import React, { useState, useRef, useEffect } from 'react';
import { Send, User as UserIcon, Bot, ExternalLink, SlidersHorizontal, Check, Timer, Heart, Coffee, Briefcase, Zap, Mic, MicOff, Trash2, AlertCircle, X, Download } from 'lucide-react';
import { Message, User } from '../types';
import { sendMessageStream, resetChat, initializeChat } from '../services/geminiService';
import { db } from '../services/db';

interface ChatInterfaceProps {
  user: User;
  onOpenTimer: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, onOpenTimer }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Tone Configuration (Persisted in LocalStorage still as it's a UI preference)
  const TONE_KEY = `mindEaseChatTone_${user.id}`;
  const toneOptions = [
    { id: 'Empathetic', label: 'Empathetic', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50', ring: 'ring-rose-200' },
    { id: 'Casual', label: 'Casual', icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-200' },
    { id: 'Formal', label: 'Formal', icon: Briefcase, color: 'text-slate-600', bg: 'bg-slate-50', ring: 'ring-slate-200' },
    { id: 'Direct', label: 'Direct', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-200' },
  ];

  const [tone, setTone] = useState<string>(() => {
    return localStorage.getItem(TONE_KEY) || 'Empathetic';
  });

  const [showToneSelector, setShowToneSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);
  const activeTone = toneOptions.find(t => t.id === tone) || toneOptions[0];

  // Fetch messages from DB on mount
  useEffect(() => {
    const loadMessages = async () => {
        setIsInitializing(true);
        try {
            const history = await db.getMessages();
            if (history.length > 0) {
                setMessages(history);
                // Init AI with history
                const historyPayload = history.map(msg => ({
                    role: msg.role,
                    parts: [{ text: msg.text }]
                }));
                initializeChat(historyPayload);
            } else {
                // Add default welcome message locally if DB is empty
                const welcomeMsg: Message = {
                    id: 'welcome',
                    role: 'model',
                    text: `Hello ${user.name}! I'm Mind Ease, your mental wellness companion. I'm here to listen, guide, and support you anytime. How are you feeling today?`,
                    timestamp: new Date()
                };
                setMessages([welcomeMsg]);
                initializeChat();
            }
        } catch (error) {
            console.error("Failed to load chat history", error);
            initializeChat();
        } finally {
            setIsInitializing(false);
        }
    };
    loadMessages();
  }, [user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    localStorage.setItem(TONE_KEY, tone);
  }, [tone, TONE_KEY]);

  // Close selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setShowToneSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup speech recognition
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleClearChat = async () => {
    if (window.confirm("Are you sure you want to clear your chat history? This cannot be undone.")) {
      try {
          await db.clearChat();
          const initialMsg: Message = {
            id: 'welcome',
            role: 'model',
            text: `Hello ${user.name}! I'm Mind Ease, your mental wellness companion. I'm here to listen, guide, and support you anytime. How are you feeling today?`,
            timestamp: new Date()
          };
          setMessages([initialMsg]);
          resetChat(); 
      } catch (e) {
          console.error("Failed to clear chat", e);
      }
    }
  };

  const handleDownloadChat = () => {
    const content = messages
      .map(m => `[${m.timestamp.toLocaleString()}] ${m.role === 'user' ? 'You' : 'Mind Ease'}: ${m.text}`)
      .join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mind-ease-chat-${user.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getVoiceErrorMessage = (error: string) => {
    switch (error) {
      case 'no-speech': return 'No speech detected. Please speak closer to the microphone.';
      case 'audio-capture': return 'Microphone not found. Please check your connections.';
      case 'not-allowed': return 'Microphone permission denied. Please allow access in browser settings.';
      case 'network': return 'Network error. Voice input requires internet connection.';
      case 'aborted': return 'Voice input stopped.';
      case 'service-not-allowed': return 'Voice input is not allowed by this browser.';
      default: return `Voice input error: ${error}`;
    }
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    setVoiceError(null);
    
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        // Handle no-speech gracefully
        if (event.error === 'no-speech') {
            setIsListening(false);
            setVoiceError(getVoiceErrorMessage('no-speech'));
        } else {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
            setVoiceError(getVoiceErrorMessage(event.error));
        }
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          const cleanTranscript = finalTranscript.toLowerCase().trim();
          
          if (cleanTranscript.includes('clear chat')) { 
             recognition.stop(); 
             handleClearChat(); 
             return; 
          }
          if (cleanTranscript.includes('open timer')) { 
             recognition.stop(); 
             onOpenTimer(); 
             return; 
          }

          setInput((prev) => {
            const separator = prev && !prev.endsWith(' ') ? ' ' : '';
            return prev + separator + finalTranscript;
          });
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
        console.error("Failed to start speech recognition", e);
        setVoiceError("Failed to initialize voice input.");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Save user message to DB
    db.addMessage(userMsg);

    const botMsgId = crypto.randomUUID();
    const initialBotMsg: Message = {
      id: botMsgId,
      role: 'model',
      text: '', 
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, initialBotMsg]);

    try {
      const stream = sendMessageStream(userMsg.text, tone);
      let accumulatedText = "";
      let finalGrounding = undefined;
      
      for await (const chunk of stream) {
        accumulatedText += chunk.text;
        finalGrounding = chunk.groundingChunks;

        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMsgId 
              ? { ...msg, text: accumulatedText, groundingChunks: finalGrounding } 
              : msg
          )
        );
      }

      // Save complete bot message to DB
      db.addMessage({
          ...initialBotMsg,
          text: accumulatedText,
          groundingChunks: finalGrounding
      });

    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.20))] md:h-[calc(100vh-theme(spacing.10))] max-w-5xl mx-auto bg-white md:rounded-2xl md:shadow-sm md:border md:border-slate-200 overflow-hidden">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-white flex justify-between items-center relative z-20">
        <div>
          <h2 className="font-bold text-slate-800 text-lg">Talk, Reflect, Heal</h2>
          <p className="text-xs text-slate-500">
             {isInitializing ? 'Connecting to secure history...' : 'Your personal mental health companion. Here to listen.'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
            <button onClick={handleDownloadChat} className="p-2 rounded-full hover:bg-slate-50 text-slate-500 hover:text-teal-600 transition-colors" title="Download Chat History">
              <Download size={20} />
            </button>
            <button onClick={handleClearChat} className="p-2 rounded-full hover:bg-slate-50 text-slate-500 hover:text-red-600 transition-colors" title="Clear Chat History">
              <Trash2 size={20} />
            </button>
            <button onClick={onOpenTimer} className="p-2 rounded-full hover:bg-slate-50 text-slate-500 hover:text-teal-600 transition-colors" title="Open Mindfulness Timer">
              <Timer size={20} />
            </button>

            {/* Tone Selector */}
            <div className="relative" ref={selectorRef}>
              <button 
                onClick={() => setShowToneSelector(!showToneSelector)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border ${showToneSelector ? 'bg-slate-50 border-slate-200' : 'border-transparent hover:bg-slate-50'}`}
              >
                <SlidersHorizontal size={18} className="text-slate-500" />
                <span className={`text-xs font-medium hidden sm:flex items-center gap-1 ${activeTone.color}`}>
                   <activeTone.icon size={12} />
                   {activeTone.label}
                </span>
              </button>
              
              <div className={`absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-30 transition-all duration-200 ease-in-out origin-top-right ${showToneSelector ? 'opacity-100 translate-y-0 scale-100 visible' : 'opacity-0 -translate-y-2 scale-95 invisible pointer-events-none'}`}>
                  <div className="flex justify-between items-center px-3 py-2 border-b border-slate-50 mb-1">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Personality</h3>
                  </div>
                  <div className="space-y-1">
                    {toneOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => { setTone(option.id); setShowToneSelector(false); }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-all ${
                          tone === option.id ? `${option.bg} ${option.color} font-medium ring-1 ${option.ring}` : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <option.icon size={16} className={tone === option.id ? option.color : 'text-slate-400'} />
                          {option.label}
                        </div>
                        {tone === option.id && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
            </div>

            <div className="bg-teal-50 text-teal-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <span className="hidden sm:inline">Live Support</span>
            </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in-up`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'model' 
                ? 'bg-teal-100 text-teal-600' 
                : 'bg-indigo-100 text-indigo-600'
            }`}>
              {msg.role === 'model' ? <Bot size={20} /> : <UserIcon size={20} />}
            </div>
            
            <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}>
              <div className={`px-5 py-3 rounded-2xl text-sm md:text-base shadow-sm select-text ${
                msg.role === 'user' 
                  ? 'bg-teal-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
              }`}>
                {msg.text ? (
                  msg.text.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-2 min-h-[1em]' : 'min-h-[1em]'}>{line}</p>
                  ))
                ) : (
                   <div className="flex space-x-1 h-6 items-center">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                )}
              </div>
              
              {/* Grounding Sources */}
              {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 animate-fade-in">
                  {msg.groundingChunks.map((chunk, idx) => (
                    chunk.web ? (
                      <a 
                        key={idx} 
                        href={chunk.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-[10px] bg-white border border-slate-200 text-slate-500 px-2 py-1 rounded-full hover:bg-slate-50 hover:text-teal-600 transition-colors shadow-sm"
                      >
                        <ExternalLink size={10} className="mr-1" />
                        {chunk.web.title}
                      </a>
                    ) : null
                  ))}
                </div>
              )}

              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 relative">
        {voiceError && (
          <div className="absolute -top-12 left-0 right-0 flex justify-center px-4 z-10">
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-full text-xs font-medium border border-red-100 shadow-sm flex items-center gap-2 animate-fade-in-up">
              <AlertCircle size={14} />
              {voiceError}
              <button onClick={() => setVoiceError(null)} className="ml-1 hover:text-red-800"><X size={12} /></button>
            </div>
          </div>
        )}

        <div className="relative max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening... (speak now)" : `Share what's on your mind... (${activeTone.label} mode)`}
            className={`w-full pl-4 pr-24 py-3 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none min-h-[50px] max-h-[150px] transition-colors ${isListening ? 'border-teal-400 ring-1 ring-teal-100' : 'border-slate-200'}`}
            rows={1}
            style={{ minHeight: '52px' }}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-2">
            <button
              onClick={toggleListening}
              className={`p-2 rounded-xl transition-all ${
                isListening ? 'bg-red-50 text-red-600 ring-2 ring-red-100 animate-pulse' : 'text-slate-400 hover:bg-slate-200 hover:text-slate-600'
              }`}
              title={isListening ? "Stop Listening" : "Start Voice Input"}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-2 flex items-center justify-center gap-1">
          <span className="flex items-center gap-1">
            <activeTone.icon size={10} className={activeTone.color} />
            Mind Ease AI ({tone})
          </span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span>Not a substitute for professional care.</span>
        </p>
      </div>
    </div>
  );
};