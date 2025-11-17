import React, { useState } from 'react';
import { HowItWorksPage } from './components/HowItWorksPage';
import { BeatSelectorPage } from './components/BeatSelectorPage';
import { PlayerPage } from './components/PlayerPage';

export type Beat = {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  genre: string;
  audioUrl: string;
  isPremium?: boolean;
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<'howItWorks' | 'beatSelector' | 'player'>('howItWorks');
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [difficulty, setDifficulty] = useState(50); // 0-100 scale
  const [frequency, setFrequency] = useState(50); // 0-100 scale

  // Add dark class to document
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleStartPractice = () => {
    setCurrentPage('beatSelector');
  };

  const handleBeatSelect = (beat: Beat) => {
    setSelectedBeat(beat);
    setCurrentPage('player');
  };

  const handleBack = () => {
    if (currentPage === 'player') {
      setCurrentPage('beatSelector');
    } else if (currentPage === 'beatSelector') {
      setCurrentPage('howItWorks');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-purple-950/20 to-black" />
      
      {/* Ambient glow orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Content with fade transition */}
      <div className="relative z-10 animate-fade-in" key={currentPage}>
        {currentPage === 'howItWorks' && (
          <HowItWorksPage onStartPractice={handleStartPractice} />
        )}
        
        {currentPage === 'beatSelector' && (
          <BeatSelectorPage 
            onBeatSelect={handleBeatSelect}
            onBack={handleBack}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            frequency={frequency}
            setFrequency={setFrequency}
          />
        )}
        
        {currentPage === 'player' && selectedBeat && (
          <PlayerPage 
            beat={selectedBeat}
            onBack={handleBack}
            difficulty={difficulty}
            frequency={frequency}
          />
        )}
      </div>

      {/* Page Progress Indicator */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${currentPage === 'howItWorks' ? 'bg-purple-500 w-8' : 'bg-white/20'}`} />
        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${currentPage === 'beatSelector' ? 'bg-purple-500 w-8' : 'bg-white/20'}`} />
        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${currentPage === 'player' ? 'bg-purple-500 w-8' : 'bg-white/20'}`} />
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.05); }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-pulse {
          animation: pulse 8s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}