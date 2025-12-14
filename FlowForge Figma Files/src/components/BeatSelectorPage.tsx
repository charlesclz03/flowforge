import React, { useState } from 'react';
import { Music, ArrowLeft, Crown, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import type { Beat } from '../App';

interface BeatSelectorPageProps {
  onBeatSelect: (beat: Beat) => void;
  onBack: () => void;
  difficulty: number;
  setDifficulty: (value: number) => void;
  frequency: number;
  setFrequency: (value: number) => void;
}

// Mock beat data
const BEATS: Beat[] = [
  { id: '1', title: 'Midnight Flow', artist: 'ProducerX', bpm: 88, genre: 'Trap', audioUrl: '', isPremium: false },
  { id: '2', title: 'Urban Dreams', artist: 'BeatMaker', bpm: 95, genre: 'Boom Bap', audioUrl: '', isPremium: false },
  { id: '3', title: 'Purple Haze', artist: 'SoundCraft', bpm: 140, genre: 'Lo-Fi', audioUrl: '', isPremium: true },
  { id: '4', title: 'Street Poetry', artist: 'RhythmLab', bpm: 92, genre: 'East Coast', audioUrl: '', isPremium: false },
  { id: '5', title: 'Golden Hour', artist: 'ProducerX', bpm: 85, genre: 'Chill Hop', audioUrl: '', isPremium: false },
  { id: '6', title: 'Neon Nights', artist: 'BeatMaker', bpm: 100, genre: 'Trap', audioUrl: '', isPremium: true },
  { id: '7', title: 'Underground', artist: 'SoundCraft', bpm: 90, genre: 'Boom Bap', audioUrl: '', isPremium: false },
  { id: '8', title: 'Skyline', artist: 'RhythmLab', bpm: 88, genre: 'Lo-Fi', audioUrl: '', isPremium: false },
];

export function BeatSelectorPage({ onBeatSelect, onBack, difficulty, setDifficulty, frequency, setFrequency }: BeatSelectorPageProps) {
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);

  // Get difficulty label
  const getDifficultyLabel = () => {
    if (difficulty < 33) return 'Easy';
    if (difficulty < 67) return 'Medium';
    return 'Hard';
  };

  // Get frequency in bars
  const getFrequencyBars = () => {
    if (frequency < 33) return 4;
    if (frequency < 67) return 8;
    return 16;
  };

  const handleContinue = () => {
    if (selectedBeat) {
      onBeatSelect(selectedBeat);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center space-x-2">
            <Music className="w-6 h-6 text-purple-500" />
            <span className="text-xl">
              Flow<span className="text-purple-500">Forge</span>
            </span>
          </div>
          
          <div className="w-24" /> {/* Spacer for center alignment */}
        </div>

        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl">Setup Your Session</h1>
          <p className="text-lg text-gray-400">
            Configure settings and choose your beat
          </p>
        </div>

        {/* Configuration Sliders */}
        <div className="space-y-6 bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
          {/* Difficulty Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">Difficulty</label>
              <span className={`
                px-3 py-1 rounded-full text-sm
                ${difficulty < 33 ? 'bg-green-500/20 text-green-400' : 
                  difficulty < 67 ? 'bg-purple-500/20 text-purple-400' : 
                  'bg-red-500/20 text-red-400'}
              `}>
                {getDifficultyLabel()}
              </span>
            </div>
            <Slider
              value={[difficulty]}
              onValueChange={(value) => setDifficulty(value[0])}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              {difficulty < 33 && '2-3 syllable words, perfect for beginners'}
              {difficulty >= 33 && difficulty < 67 && '3-4 syllable words, moderate challenge'}
              {difficulty >= 67 && '4-6 syllable words, advanced vocabulary'}
            </p>
          </div>

          {/* Frequency Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">Word Frequency</label>
              <span className="px-3 py-1 bg-violet-500/20 text-violet-400 rounded-full text-sm">
                Every {getFrequencyBars()} bars
              </span>
            </div>
            <Slider
              value={[frequency]}
              onValueChange={(value) => setFrequency(value[0])}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              {frequency < 33 && 'New word every 4 bars - fast paced'}
              {frequency >= 33 && frequency < 67 && 'New word every 8 bars - balanced'}
              {frequency >= 67 && 'New word every 16 bars - plenty of time'}
            </p>
          </div>
        </div>

        {/* Beat Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {BEATS.map((beat) => (
            <button
              key={beat.id}
              onClick={() => setSelectedBeat(beat)}
              className={`
                relative p-6 rounded-2xl border-2 transition-all duration-300 text-left
                ${selectedBeat?.id === beat.id 
                  ? 'border-purple-500 bg-purple-500/10 scale-[1.02]' 
                  : 'border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-white/10'
                }
              `}
            >
              {/* Premium Badge */}
              {beat.isPremium && (
                <div className="absolute top-4 right-4">
                  <div className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center space-x-1">
                    <Crown className="w-3 h-3" />
                    <span className="text-xs">Premium</span>
                  </div>
                </div>
              )}

              {/* Selection Indicator */}
              {selectedBeat?.id === beat.id && (
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className="w-6 h-6 text-purple-500" />
                </div>
              )}

              {/* Beat Icon */}
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center mb-4
                ${selectedBeat?.id === beat.id ? 'bg-purple-500/20' : 'bg-white/10'}
              `}>
                <Music className={`w-6 h-6 ${selectedBeat?.id === beat.id ? 'text-purple-400' : 'text-gray-400'}`} />
              </div>

              {/* Beat Info */}
              <div className="space-y-2">
                <h3 className="text-xl">{beat.title}</h3>
                <p className="text-sm text-gray-400">{beat.artist}</p>
                
                <div className="flex items-center space-x-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                    <span className="text-sm text-gray-400">{beat.bpm} BPM</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
                    <span className="text-sm text-gray-400">{beat.genre}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center pt-6">
          <Button
            onClick={handleContinue}
            disabled={!selectedBeat}
            size="lg"
            className={`
              px-12 py-6 text-lg rounded-full transition-all duration-300
              ${selectedBeat 
                ? 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105' 
                : 'bg-white/10 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Continue to Practice
          </Button>
        </div>

        {/* Beat Count */}
        <div className="text-center text-sm text-gray-500">
          {BEATS.filter(b => !b.isPremium).length} free beats • {BEATS.filter(b => b.isPremium).length} premium beats
        </div>
      </div>
    </div>
  );
}