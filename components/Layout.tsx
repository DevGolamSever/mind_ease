import React from 'react';
import { User, AppView } from '../types';
import { MessageSquare, BarChart2, BookOpen, LogOut, Heart } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  currentView, 
  onNavigate, 
  onLogout 
}) => {
  const navItems = [
    { id: AppView.CHAT, label: 'Chat', icon: MessageSquare },
    { id: AppView.DASHBOARD, label: 'Progress', icon: BarChart2 },
    { id: AppView.RESOURCES, label: 'Wellness', icon: BookOpen },
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc]">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-full fixed inset-y-0 z-20">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-50">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
            <Heart size={18} fill="currentColor" />
          </div>
          <span className="text-xl font-bold text-slate-800">Mind Ease</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center w-full px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-teal-50 text-teal-700 font-medium' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={20} className={`mr-3 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <div className="flex items-center px-4 py-3 rounded-xl bg-slate-50 mb-3">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-slate-500 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} className="mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header & Content Wrapper */}
      <div className="flex-1 md:ml-64 flex flex-col h-full">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
              <Heart size={18} fill="currentColor" />
            </div>
            <span className="text-lg font-bold text-slate-800">Mind Ease</span>
          </div>
          <button onClick={onLogout} className="text-slate-500 p-2">
             <LogOut size={20} />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden bg-white border-t border-slate-200 flex justify-around p-2 pb-safe sticky bottom-0 z-30">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center p-2 rounded-lg ${
                   isActive ? 'text-teal-600' : 'text-slate-400'
                }`}
              >
                <Icon size={24} className={isActive ? 'fill-teal-100' : ''} />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};