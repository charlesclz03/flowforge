import React from 'react';
import { Music, Timer, Mic, ArrowRight, Sparkles, Zap, Target } from 'lucide-react';
import { Button } from './ui/button';

interface HowItWorksPageProps {
  onStartPractice: () => void;
}

export function HowItWorksPage({ onStartPractice }: HowItWorksPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-block">
            <div className="flex items-center justify-center space-x-3">
              <Music className="w-12 h-12 text-purple-500" />
              <h1 className="text-6xl">
                Flow<span className="text-purple-500">Forge</span>
              </h1>
            </div>
          </div>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Master your freestyle flow with precision timing and intelligent word prompts
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-500/20">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-400">Ready to Practice</span>
            </div>
          </div>
        </div>

        {/* How It Works Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-purple-500/30 transition-all duration-300 hover:scale-105">
            <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
              <Music className="w-7 h-7 text-blue-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-3xl">1</span>
                <h3 className="text-xl">Choose Your Beat</h3>
              </div>
              <p className="text-gray-400">
                Select from a curated library of hip-hop instrumentals. Each beat is tagged with BPM and genre for the perfect vibe.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-purple-500/30 transition-all duration-300 hover:scale-105">
            <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
              <Target className="w-7 h-7 text-purple-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-3xl">2</span>
                <h3 className="text-xl">Configure Session</h3>
              </div>
              <p className="text-gray-400">
                Set your difficulty level and word frequency. Start easy with 2-3 syllable words, or challenge yourself with complex vocabulary.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-purple-500/30 transition-all duration-300 hover:scale-105">
            <div className="w-14 h-14 bg-violet-500/20 rounded-2xl flex items-center justify-center mb-6">
              <Mic className="w-7 h-7 text-violet-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-3xl">3</span>
                <h3 className="text-xl">Record & Flow</h3>
              </div>
              <p className="text-gray-400">
                Hit play and start freestyling. Words appear in sync with the beat. Your session is automatically recorded for review.
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-start space-x-4">
              <Timer className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg mb-2">Precision Timing</h4>
                <p className="text-sm text-gray-400">
                  iOS Clock-inspired timer with visual progress ring. Know exactly where you are in your 2-minute session.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-violet-500/10 to-transparent rounded-2xl p-6 border border-violet-500/20">
            <div className="flex items-start space-x-4">
              <Sparkles className="w-6 h-6 text-violet-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg mb-2">Smart Word Bank</h4>
                <p className="text-sm text-gray-400">
                  Over 1,000 curated words designed for freestyling. Filtered by syllable count to match your skill level.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-transparent rounded-2xl p-6 border border-blue-500/20">
            <div className="flex items-start space-x-4">
              <Zap className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg mb-2">Beat Synchronization</h4>
                <p className="text-sm text-gray-400">
                  Words appear precisely timed to musical bars. Choose between 4, 8, or 16 bar intervals.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-transparent rounded-2xl p-6 border border-green-500/20">
            <div className="flex items-start space-x-4">
              <Music className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg mb-2">Auto-Recording</h4>
                <p className="text-sm text-gray-400">
                  Every session is captured automatically. Review your performances and track your progress over time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center pt-6">
          <Button
            onClick={onStartPractice}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white px-12 py-6 text-lg rounded-full shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
          >
            Start Practicing
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center space-x-12 pt-6 text-center">
          <div>
            <div className="text-3xl mb-1">50+</div>
            <div className="text-sm text-gray-500">Curated Beats</div>
          </div>
          <div className="w-px h-12 bg-white/10" />
          <div>
            <div className="text-3xl mb-1">1,000+</div>
            <div className="text-sm text-gray-500">Word Vault</div>
          </div>
          <div className="w-px h-12 bg-white/10" />
          <div>
            <div className="text-3xl mb-1">2 min</div>
            <div className="text-sm text-gray-500">Practice Sessions</div>
          </div>
        </div>
      </div>
    </div>
  );
}
