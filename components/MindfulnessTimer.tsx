import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Timer } from 'lucide-react';
import { Button } from './Button';

interface MindfulnessTimerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MindfulnessTimer: React.FC<MindfulnessTimerProps> = ({ isOpen, onClose }) => {
  const [duration, setDuration] = useState(300); // Default 5 minutes
  const [timeLeft, setTimeLeft] = useState(300);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setIsCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  // Reset when modal opens/closes or duration changes
  useEffect(() => {
    if (!isOpen) {
      setIsActive(false);
    }
  }, [isOpen]);

  const toggleTimer = () => {
    setIsActive(!isActive);
    setIsCompleted(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration);
    setIsCompleted(false);
  };

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    setTimeLeft(newDuration);
    setIsActive(false);
    setIsCompleted(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration - timeLeft) / duration) * 100;
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      {/* Added max-h and flex-col to ensure content fits and scrolls if needed */}
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-50 flex-shrink-0">
          <div className="flex items-center gap-2 text-teal-700">
            <Timer size={24} />
            <h2 className="text-xl font-bold">Mindfulness Timer</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close timer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 flex flex-col items-center overflow-y-auto">
          {/* Circular Timer Visual */}
          <div className="relative mb-8 flex-shrink-0">
            <svg width="280" height="280" className="transform -rotate-90">
              <circle
                cx="140"
                cy="140"
                r={radius}
                stroke="#f1f5f9"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="140"
                cy="140"
                r={radius}
                stroke="#0d9488"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {isCompleted ? (
                <div className="text-center animate-fade-in">
                  <span className="text-4xl font-bold text-teal-600 block mb-1">Done</span>
                  <span className="text-sm text-slate-500">Great job!</span>
                </div>
              ) : (
                <>
                  <span className={`text-6xl font-light text-slate-700 tabular-nums ${isActive ? 'animate-pulse-slow' : ''}`}>
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-sm text-slate-400 font-medium mt-2 uppercase tracking-widest">
                    {isActive ? 'Breathing...' : 'Ready'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={toggleTimer}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl ${
                isActive 
                  ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
                  : 'bg-teal-600 text-white hover:bg-teal-700'
              }`}
              aria-label={isActive ? "Pause timer" : "Start timer"}
            >
              {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </button>
            <button
              onClick={resetTimer}
              className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
              title="Reset"
              aria-label="Reset timer"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          {/* Duration Presets */}
          <div className="grid grid-cols-4 gap-2 w-full mb-6">
            {[1, 3, 5, 10].map((mins) => (
              <button
                key={mins}
                onClick={() => handleDurationChange(mins * 60)}
                className={`py-2 px-1 rounded-xl text-sm font-medium transition-colors ${
                  duration === mins * 60
                    ? 'bg-teal-50 text-teal-700 border border-teal-100'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
          
          <p className="text-xs text-center text-slate-400 mb-6">
            Use this time for silent reflection, deep breathing, or simply doing nothing.
          </p>

          <Button 
            variant="outline" 
            fullWidth 
            onClick={onClose}
            className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 mt-auto"
          >
            Exit Session
          </Button>
        </div>
      </div>
    </div>
  );
};