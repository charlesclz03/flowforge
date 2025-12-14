import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Square, Mic, Music } from 'lucide-react';
import { Button } from './ui/button';
import type { Beat } from '../App';

interface PlayerPageProps {
  beat: Beat;
  onBack: () => void;
  difficulty: number;
  frequency: number;
}

// Word bank organized by difficulty
const WORD_BANK = {
  easy: ['cat', 'dog', 'run', 'sun', 'fun', 'hat', 'map', 'car', 'star', 'moon', 'tree', 'free', 'king', 'sing', 'dream', 'team'],
  medium: ['rhythm', 'battle', 'cipher', 'master', 'hustle', 'golden', 'thunder', 'stellar', 'cosmic', 'legend', 'passion', 'fortune'],
  hard: ['phenomenon', 'extraordinary', 'revolutionary', 'magnificent', 'incredible', 'spectacular', 'phenomenal', 'extraordinary', 'unbelievable', 'exceptional']
};

export function PlayerPage({ beat, onBack, difficulty, frequency }: PlayerPageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes in seconds
  const [progress, setProgress] = useState(0); // 0-100
  const [currentWord, setCurrentWord] = useState('');
  const [barCount, setBarCount] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wordTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Get word based on difficulty
  const getRandomWord = () => {
    const level = difficulty < 33 ? 'easy' : difficulty < 67 ? 'medium' : 'hard';
    const words = WORD_BANK[level];
    return words[Math.floor(Math.random() * words.length)];
  };

  // Calculate bar duration (one bar = 4 beats = 240/BPM seconds)
  const barDuration = (240 / beat.bpm) * 1000; // in milliseconds
  const wordInterval = getFrequencyBars() * barDuration;

  useEffect(() => {
    if (isPlaying) {
      // Start timer countdown
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            handleStop();
            return 0;
          }
          const newTime = prev - 0.1;
          setProgress(((120 - newTime) / 120) * 100);
          return newTime;
        });
      }, 100);

      // Start word prompts
      setCurrentWord(getRandomWord());
      wordTimerRef.current = setInterval(() => {
        setBarCount(prev => prev + getFrequencyBars());
        setCurrentWord(getRandomWord());
      }, wordInterval);

      // Simulate microphone recording
      setIsRecording(true);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (wordTimerRef.current) clearInterval(wordTimerRef.current);
      setIsRecording(false);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (wordTimerRef.current) clearInterval(wordTimerRef.current);
    };
  }, [isPlaying, frequency, beat.bpm]);

  const handlePlay = () => {
    setIsPlaying(true);
    setTimeRemaining(120);
    setProgress(0);
    setBarCount(0);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentWord('');
    setSessionComplete(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate circle progress
  const circumference = 2 * Math.PI * 90; // radius = 90
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-gray-400 hover:text-white"
            disabled={isPlaying}
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
          
          <div className="w-24" />
        </div>

        {/* Beat Info */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-3 px-6 py-3 bg-white/5 rounded-full border border-white/10">
            <span className="text-lg">{beat.title}</span>
            <div className="w-1 h-1 bg-purple-500 rounded-full" />
            <span className="text-sm text-gray-400">{beat.artist}</span>
            <div className="w-1 h-1 bg-purple-500 rounded-full" />
            <span className="text-sm text-gray-400">{beat.bpm} BPM</span>
          </div>
        </div>

        {/* Timer and Word Display */}
        <div className="flex flex-col items-center space-y-8">
          {/* Timer Ring */}
          <div className="relative">
            {/* Background Circle */}
            <svg className="transform -rotate-90 w-64 h-64">
              <circle
                cx="128"
                cy="128"
                r="90"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-white/10"
              />
              {/* Progress Circle */}
              <circle
                cx="128"
                cy="128"
                r="90"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="text-purple-500 transition-all duration-100 ease-linear"
                strokeLinecap="round"
              />
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-2">{formatTime(timeRemaining)}</div>
                {isPlaying && (
                  <div className="text-sm text-gray-400">Bar {barCount}</div>
                )}
              </div>
            </div>

            {/* Play/Stop Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={isPlaying ? handleStop : handlePlay}
                className={`
                  absolute bottom-0 w-20 h-20 rounded-full flex items-center justify-center
                  transition-all duration-300 hover:scale-110 active:scale-95
                  ${isPlaying 
                    ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50' 
                    : 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 shadow-lg shadow-purple-500/50'
                  }
                `}
              >
                {isPlaying ? (
                  <Square className="w-8 h-8 text-white" />
                ) : (
                  <Play className="w-8 h-8 text-white ml-1" />
                )}
              </button>
            </div>
          </div>

          {/* Word Prompt */}
          {isPlaying && currentWord && (
            <div className="min-h-[120px] flex items-center justify-center">
              <div 
                className="text-6xl bg-gradient-to-r from-purple-500 via-violet-500 to-purple-500 bg-clip-text text-transparent animate-fade-in uppercase tracking-wider"
                key={currentWord}
              >
                {currentWord}
              </div>
            </div>
          )}

          {!isPlaying && !currentWord && (
            <div className="min-h-[120px] flex items-center justify-center text-gray-500">
              Press play to start your session
            </div>
          )}

          {/* Recording Indicator */}
          {isRecording && (
            <div className="flex items-center space-x-3 px-4 py-2 bg-red-500/10 rounded-full border border-red-500/20">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <Mic className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-400">Recording</span>
            </div>
          )}
        </div>

        {/* Session Info */}
        {isPlaying && (
          <div className="text-center text-sm text-gray-500">
            {getDifficultyLabel()} difficulty • New word every {getFrequencyBars()} bars
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }

        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}