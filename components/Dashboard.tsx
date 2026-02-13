import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Activity, Calendar, Award, TrendingUp, PlusCircle, X, Smile, Meh, Frown, Trash } from 'lucide-react';
import { DailyMood, User, MoodEntry } from '../types';
import { Button } from './Button';
import { MoodLogger } from './MoodLogger';
import { db } from '../services/db';

interface DashboardProps {
  user: User;
  moodEntries: MoodEntry[];
  onLogMood: (score: number, note: string) => void;
  onDeleteMood: (id: string) => void; // Add this line
}

export const Dashboard: React.FC<DashboardProps> = ({ user, moodEntries, onLogMood ,onDeleteMood}) => {
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);

  // Calculate Chart Data (Last 7 Days)
  const chartData = useMemo(() => {
    const data: DailyMood[] = [];
    const today = new Date();
    
    // Iterate backwards 6 days to today
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Use toDateString() for local timezone comparison instead of ISO (UTC)
      const checkDate = d.toDateString();

      // Find all entries for this specific day
      const daysEntries = moodEntries.filter(e => {
        return new Date(e.timestamp).toDateString() === checkDate;
      });

      // Get the latest entry for the day if multiple exist
      const latestEntry = daysEntries.length > 0 
        ? daysEntries.sort((a, b) => b.timestamp - a.timestamp)[0]
        : undefined;

      data.push({
        day: dayLabel,
        score: latestEntry ? latestEntry.score : null,
        entry: latestEntry
      });
    }
    return data;
  }, [moodEntries]);

  // Calculate Average Mood
  const averageMood = useMemo(() => {
    if (moodEntries.length === 0) return 0;
    const sum = moodEntries.reduce((acc, curr) => acc + curr.score, 0);
    return (sum / moodEntries.length).toFixed(1);
  }, [moodEntries]);

  // Current Streak Calculation (simplified)
  const streak = useMemo(() => {
    if (moodEntries.length === 0) return 0;
    // Calculate actual consecutive days streak would be complex, keeping simple count for now as per original
    return moodEntries.length; 
  }, [moodEntries]);

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const payload = data.activePayload[0].payload as DailyMood;
      if (payload.entry) {
        setSelectedEntry(payload.entry);
      }
    }
  };

const handleDeletMode = async (noteId: string) => {
  // 1. Set an alert (Confirmation)
  const confirmDelete = window.confirm("Are you sure you want to delete this mood entry?");
  
  if (confirmDelete) {
    try {
      // 2. Call the DB service
      await db.deleteMood(noteId);

      // 3. Call the parent function to update the list in the UI
      onDeleteMood(noteId);

      // 4. Close the modal
      setSelectedEntry(null);
    } catch (e) {
      console.error("Failed to delete mood entry", e);
      alert("Something went wrong while deleting.");
    }
  }
};


  

  const getMoodIcon = (score: number) => {
    if (score <= 3) return <Frown size={48} className="text-red-500" />;
    if (score <= 6) return <Meh size={48} className="text-amber-500" />;
    return <Smile size={48} className="text-teal-600" />;
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Your Progress</h1>
          <p className="text-slate-500 mt-2">Track your wellness journey, {user.name}.</p>
        </div>
        <Button onClick={() => setIsLoggerOpen(true)} className="flex items-center gap-2">
          <PlusCircle size={20} />
          Log Today's Mood
        </Button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Logs</p>
            <p className="text-2xl font-bold text-slate-800">{moodEntries.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-teal-100 text-teal-600 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Avg Mood</p>
            <p className="text-2xl font-bold text-slate-800">{averageMood}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Check-ins</p>
            <p className="text-2xl font-bold text-slate-800">{streak}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
            <Award size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Badges</p>
            <p className="text-2xl font-bold text-slate-800">3</p>
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Weekly Mood Tracker</h2>
            <p className="text-xs text-slate-400 mt-1">Click on a data point to view details</p>
          </div>
        </div>
        <div className="h-[300px] w-full cursor-pointer">
          {moodEntries.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={chartData} 
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                onClick={handleChartClick}
              >
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  domain={[0, 10]}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#94a3b8', strokeWidth: 1 }}
                  formatter={(value: any) => [value, 'Mood Score']}
                  labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#0d9488" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)"
                  connectNulls={true}
                  dot={{ r: 4, fill: '#0d9488', strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#0f766e' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <p>No mood data yet.</p>
              <Button variant="ghost" size="sm" onClick={() => setIsLoggerOpen(true)} className="mt-2 text-teal-600">
                Log your first mood
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {moodEntries.length === 0 && (
            <p className="text-slate-400 text-sm">No recent activity.</p>
          )}
          
          {[...moodEntries].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5).map((entry) => (
            <div 
              key={entry.id} 
              onClick={() => setSelectedEntry(entry)}
              className="flex items-start justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-50 last:border-0 cursor-pointer"
            >
              <div className="flex items-start space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                   entry.score >= 7 ? 'bg-teal-100 text-teal-600' : 
                   entry.score >= 4 ? 'bg-amber-100 text-amber-600' : 
                   'bg-red-100 text-red-600'
                }`}>
                  <span className="font-bold text-sm">{entry.score}</span>
                </div>
                <div>
                  <h4 className="font-medium text-slate-800">Mood Check-in</h4>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{entry.note || "No note added."}</p>
                </div>
              </div>
              <span className="text-xs font-medium text-slate-400 whitespace-nowrap ml-2 ">
                {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            
             </span>
              
            </div>
          ))}
        </div>
      </div>

      <MoodLogger 
        isOpen={isLoggerOpen} 
        onClose={() => setIsLoggerOpen(false)} 
        onSave={onLogMood} 
      />

      {/* Detail Modal */}
      {selectedEntry && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedEntry(null)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
             <div className="relative p-6 text-center">
                <button 
                  onClick={() => setSelectedEntry(null)}
                  className="absolute right-4 top-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="mb-4 flex justify-center">
                  {getMoodIcon(selectedEntry.score)}
                </div>
                
                <h3 className="text-2xl font-bold text-slate-800 mb-1">
                  Mood Score: {selectedEntry.score}
                </h3>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wide mb-6">
                  {new Date(selectedEntry.timestamp).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                <div className="bg-slate-50 rounded-2xl p-6 text-left border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Note</h4>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedEntry.note || "No note written for this day."}
                  </p>
                </div>

                <div className="mt-6 flex gap-2">
                   <Button fullWidth variant="outline" onClick={() => setSelectedEntry(null)}>Close</Button>
                   <Button fullWidth variant="outline" onClick={()=>handleDeletMode(selectedEntry?._id)}>Delete Mode</Button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};