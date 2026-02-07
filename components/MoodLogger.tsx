import React, { useState } from 'react';
import { X, Smile, Frown, Meh, Save } from 'lucide-react';
import { Button } from './Button';

interface MoodLoggerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (score: number, note: string) => void;
}

export const MoodLogger: React.FC<MoodLoggerProps> = ({ isOpen, onClose, onSave }) => {
  const [score, setScore] = useState(7);
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(score, note);
    setNote(''); // Reset form
    setScore(7);
    onClose();
  };

  const getMoodLabel = (val: number) => {
    if (val <= 3) return { label: 'Struggling', color: 'text-red-500', icon: Frown };
    if (val <= 6) return { label: 'Okay', color: 'text-amber-500', icon: Meh };
    return { label: 'Great', color: 'text-teal-600', icon: Smile };
  };

  const { label, color, icon: Icon } = getMoodLabel(score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Daily Check-in</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Score Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-sm font-medium text-slate-600">How are you feeling?</label>
              <span className={`text-lg font-bold ${color} flex items-center gap-2`}>
                <Icon size={24} />
                {score}/10
              </span>
            </div>
            
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            />
            <div className="flex justify-between text-xs text-slate-400 px-1">
              <span>Very Low</span>
              <span>Neutral</span>
              <span>Very High</span>
            </div>
          </div>

          {/* Note Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Add a note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's making you feel this way?"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none h-32 text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              fullWidth 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              fullWidth 
              className="flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Save Entry
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};