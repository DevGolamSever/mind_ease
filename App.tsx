import React, { useState, useEffect } from 'react';
import { User, AppView, MoodEntry } from './types';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { ChatInterface } from './components/ChatInterface';
import { Dashboard } from './components/Dashboard';
import { Resources } from './components/Resources';
import { MindfulnessTimer } from './components/MindfulnessTimer';
import { resetChat } from './services/geminiService';
import { db } from './services/db';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.CHAT);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth State & Data
  const initAuth = async () => {
    try {
      // Check current session
      const currentUser = await db.getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
          await loadUserData();
      }
    } catch (e) {
      console.error("Auth initialization failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const loadUserData = async () => {
    try {
        const moods = await db.getMoods();
        setMoodEntries(moods);
    } catch(e) {
        console.error("Failed to load user data", e);
    }
  };

  // Passed to Auth component to trigger state update after successful login
  const handleLoginSuccess = async () => {
      await initAuth();
      setCurrentView(AppView.CHAT);
  };

  const handleLogout = async () => {
    await db.signOut();
    setUser(null);
    setCurrentView(AppView.CHAT);
    setMoodEntries([]);
    resetChat();
  };

  const handleLogMood = async (score: number, note: string) => {
    try {
        await db.addMood(score, note);
        // Refresh data 
        const moods = await db.getMoods();
        setMoodEntries(moods);
    } catch (e) {
        console.error("Failed to log mood", e);
        alert("Failed to save mood. Please try again.");
    }
  };

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 text-sm">Connecting to Mind Ease...</p>
            </div>
        </div>
    );
  }

  if (!user) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.CHAT:
        return (
          <ChatInterface 
            key={user.id} // Critical: Forces component remount when user changes
            user={user} 
            onOpenTimer={() => setIsTimerOpen(true)} 
          />
        );
      case AppView.DASHBOARD:
        return (
          <Dashboard 
            user={user} 
            moodEntries={moodEntries} 
            onLogMood={handleLogMood} 
          />
        );
      case AppView.RESOURCES:
        return (
          <Resources 
            onOpenTimer={() => setIsTimerOpen(true)} 
          />
        );
      default:
        return (
          <ChatInterface 
            key={user.id}
            user={user} 
            onOpenTimer={() => setIsTimerOpen(true)} 
          />
        );
    }
  };

  return (
    <>
      <Layout 
        user={user} 
        currentView={currentView} 
        onNavigate={setCurrentView}
        onLogout={handleLogout}
      >
        {renderView()}
      </Layout>
      <MindfulnessTimer 
        isOpen={isTimerOpen} 
        onClose={() => setIsTimerOpen(false)} 
      />
    </>
  );
};

export default App;