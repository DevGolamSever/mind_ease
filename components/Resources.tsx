import React, { useState } from 'react';
import { Resource } from '../types';
import { Clock, BookOpen, Wind, Smile, X, PlayCircle, Timer } from 'lucide-react';
import { Button } from './Button';

interface ResourcesProps {
  onOpenTimer: () => void;
}

// Mock Data based on PDF
const resources: Resource[] = [
  {
    id: '1',
    title: '4-7-8 Breathing Technique',
    category: 'Breathing',
    duration: '5 min',
    description: 'A calming breathing exercise to reduce anxiety and promote relaxation. Inhale for 4, hold for 7, exhale for 8.',
    content: "Find a comfortable place to sit or lie down.\n\n1. Place the tip of your tongue against the ridge of tissue just behind your upper front teeth.\n2. Exhale completely through your mouth, making a whoosh sound.\n3. Close your mouth and inhale quietly through your nose to a mental count of four.\n4. Hold your breath for a count of seven.\n5. Exhale completely through your mouth, making a whoosh sound to a count of eight.\n\nRepeat this cycle three more times for a total of four breaths."
  },
  {
    id: '2',
    title: 'Box Breathing Exercise',
    category: 'Breathing',
    duration: '3 min',
    description: 'A simple technique used by Navy SEALs to stay calm under pressure. Perfect for moments of high stress.',
    content: "Visualize a box as you breathe.\n\n1. Inhale slowly through your nose for 4 seconds.\n2. Hold your breath for 4 seconds.\n3. Exhale slowly through your mouth for 4 seconds.\n4. Hold your breath for 4 seconds.\n\nRepeat for at least 3-4 rounds."
  },
  {
    id: '3',
    title: 'Body Scan Meditation',
    category: 'Mindfulness',
    duration: '10 min',
    description: 'A mindfulness practice that brings awareness to different parts of your body, releasing tension.',
    content: "Lie down in a comfortable position.\n\nClose your eyes and bring attention to your breath.\n\nSlowly shift your focus to your toes. Notice any sensations. Release any tension.\n\nGradually move your attention up through your feet, ankles, calves, knees, and thighs, continuing all the way to the top of your head.\n\nIf your mind wanders, gently bring it back to the body part you are focusing on."
  },
  {
    id: '4',
    title: '5-4-3-2-1 Grounding',
    category: 'Coping Strategy',
    duration: '5 min',
    description: 'Use your five senses to ground yourself in the present moment during anxious episodes.',
    content: "Look around you and identify:\n\n5 things you can see.\n4 things you can feel.\n3 things you can hear.\n2 things you can smell.\n1 thing you can taste.\n\nThis exercise helps interrupt anxious thought patterns by engaging your senses."
  },
  {
    id: '5',
    title: 'The Science of Stress',
    category: 'Learn',
    duration: '6 min read',
    description: 'Explore how stress affects your mind and body, and learn evidence-based strategies to manage it.',
    content: "Stress is your body's reaction to a challenge or demand. In short bursts, stress can be positive, such as when it helps you avoid danger or meet a deadline. But when stress lasts for a long time, it may harm your health.\n\nChronic stress releases cortisol, which can disrupt sleep, immune function, and mood. Recognizing the signs early is the first step to management."
  }
];

export const Resources: React.FC<ResourcesProps> = ({ onOpenTimer }) => {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [activeTab, setActiveTab] = useState('All');

  const breathingResources = resources.filter(r => r.category === 'Breathing');
  
  // Filter for the bottom grid
  const filteredResources = activeTab === 'All' 
    ? resources 
    : resources.filter(r => r.category === activeTab);

  const getIcon = (cat: string) => {
    switch (cat) {
      case 'Breathing': return <Wind className="text-cyan-500" />;
      case 'Mindfulness': return <Smile className="text-purple-500" />;
      case 'Coping Strategy': return <BookOpen className="text-amber-500" />;
      default: return <BookOpen className="text-slate-500" />;
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen pb-24">
      <header className="mb-10 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Wellness Resources</h1>
          <p className="text-slate-500 mt-2">Tools and strategies to support your mental well-being.</p>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Button onClick={onOpenTimer} className="flex items-center justify-center gap-2 shadow-md">
            <Timer size={20} />
            Practice Mindfulness
          </Button>

          <div className="relative max-w-lg flex-1 md:w-64">
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <div className="absolute right-3 top-3 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Breathing Section */}
      <section className="mb-12 bg-teal-50/50 p-6 rounded-3xl border border-teal-100">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-teal-100 text-teal-600 rounded-xl">
                <Wind size={24} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-800">Guided Breathing Exercises</h2>
                <p className="text-sm text-slate-500">Quick techniques to reduce stress and find calm.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {breathingResources.map(resource => (
                <div 
                    key={resource.id} 
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => setSelectedResource(resource)}
                >
                    <div className="flex justify-between items-start mb-3">
                        <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold">
                            {resource.duration}
                        </span>
                        <PlayCircle className="text-teal-400 group-hover:text-teal-600 transition-colors" size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-teal-700 transition-colors">{resource.title}</h3>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">{resource.description}</p>
                    <div className="text-teal-600 text-sm font-medium flex items-center">
                        View Instructions
                    </div>
                </div>
            ))}
        </div>
      </section>

      {/* Main Library Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Explore Library</h2>
        
        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {['All', 'Breathing', 'Mindfulness', 'Coping Strategy', 'Learn'].map((tab, idx) => (
            <button 
                key={idx}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab 
                    ? 'bg-slate-800 text-white shadow-md' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
            >
                {tab}
            </button>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
            <div key={resource.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-slate-50 rounded-lg">
                    {getIcon(resource.category)}
                </div>
                <div className="flex items-center text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                    <Clock size={12} className="mr-1" />
                    {resource.duration}
                </div>
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 mb-2">{resource.title}</h3>
                <p className="text-slate-500 text-sm mb-6 flex-grow">{resource.description}</p>
                
                <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setSelectedResource(resource)}
                >
                Start Exercise
                </Button>
            </div>
            ))}
        </div>
      </div>

      {/* Modal for Resource Content */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold text-teal-600 uppercase tracking-wide bg-teal-50 px-3 py-1 rounded-full">
                    {selectedResource.category}
                </span>
                <button 
                  onClick={() => setSelectedResource(null)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <h2 className="text-3xl font-bold text-slate-800 mb-2">{selectedResource.title}</h2>
              <div className="flex items-center text-slate-500 mb-8 border-b border-slate-100 pb-6">
                <Clock size={16} className="mr-2" />
                <span className="mr-6">{selectedResource.duration}</span>
                {selectedResource.category === 'Breathing' && (
                    <span className="flex items-center text-teal-600">
                        <Wind size={16} className="mr-2" />
                        Guided Breathing
                    </span>
                )}
              </div>

              <div className="prose prose-slate max-w-none">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Instructions</h3>
                {selectedResource.content.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4 text-lg leading-relaxed text-slate-600">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
                <Button onClick={() => setSelectedResource(null)}>
                  Complete Activity
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};