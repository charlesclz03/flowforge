import React from 'react';
import { useMusicPlayer } from './MusicPlayerContext';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Gramophone() {
  const { currentSong, isPlaying, dominantColor, accentColor } = useMusicPlayer();

  return (
    <div className="relative flex items-center justify-center">
      {/* Background gradient based on album colors */}
      <div 
        className="absolute inset-0 rounded-full opacity-20 blur-3xl transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, ${dominantColor}40 0%, ${accentColor}20 70%, transparent 100%)`,
          width: '600px',
          height: '600px',
          transform: 'translate(-50%, -50%)',
          left: '50%',
          top: '50%'
        }}
      />

      {/* Gramophone base */}
      <div className="relative">
        {/* Turntable base */}
        <div className="relative w-96 h-96 rounded-full bg-gradient-to-br from-muted to-muted/50 shadow-2xl p-6">
          {/* Vinyl Record */}
          <div 
            className={`relative w-full h-full rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-black shadow-inner transition-transform duration-300 ease-in-out ${
              isPlaying ? 'animate-spin' : ''
            }`}
            style={{
              background: 'conic-gradient(from 0deg, #1a1a1a 0%, #2d2d2d 25%, #1a1a1a 50%, #2d2d2d 75%, #1a1a1a 100%)',
              boxShadow: 'inset 0 0 60px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.4)',
              animationDuration: '3s',
              animationTimingFunction: 'linear'
            }}
          >
            {/* Vinyl grooves */}
            <div className="absolute inset-4 rounded-full border border-gray-600 opacity-30"></div>
            <div className="absolute inset-8 rounded-full border border-gray-600 opacity-25"></div>
            <div className="absolute inset-12 rounded-full border border-gray-600 opacity-20"></div>
            <div className="absolute inset-16 rounded-full border border-gray-600 opacity-15"></div>
            <div className="absolute inset-20 rounded-full border border-gray-600 opacity-10"></div>
            <div className="absolute inset-24 rounded-full border border-gray-600 opacity-5"></div>
            
            {/* Center label with album art */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full overflow-hidden shadow-2xl">
              <div 
                className="w-full h-full rounded-full border-4 overflow-hidden"
                style={{
                  borderColor: dominantColor,
                  background: `linear-gradient(135deg, ${dominantColor}20, ${accentColor}20)`
                }}
              >
                {currentSong?.coverUrl ? (
                  <ImageWithFallback
                    src={currentSong.coverUrl}
                    alt={`${currentSong.album} cover`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                    <svg
                      className="w-16 h-16 text-muted-foreground"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Center spindle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-black shadow-inner border border-gray-600"></div>
            </div>
            
            {/* Vinyl highlight effect */}
            <div 
              className="absolute top-0 left-0 w-full h-full rounded-full pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)'
              }}
            />
          </div>
        </div>

        {/* Tonearm */}
        <div 
          className={`absolute transition-transform duration-500 ease-in-out ${
            isPlaying ? 'rotate-12' : 'rotate-45'
          }`}
          style={{
            top: '20px',
            right: '20px',
            transformOrigin: '100% 100%'
          }}
        >
          {/* Tonearm base */}
          <div className="relative">
            {/* Tonearm pivot */}
            <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-lg border border-gray-500"></div>
            
            {/* Tonearm */}
            <div 
              className="w-32 h-1 bg-gradient-to-r from-gray-500 to-gray-700 rounded-full shadow-md"
              style={{
                background: 'linear-gradient(90deg, #9CA3AF 0%, #6B7280 100%)'
              }}
            >
              {/* Tonearm highlight */}
              <div className="w-full h-full rounded-full bg-gradient-to-r from-white/20 to-transparent"></div>
            </div>
            
            {/* Stylus */}
            <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 shadow-sm"></div>
          </div>
        </div>

        {/* Turntable controls */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full pt-4">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 rounded-full bg-muted-foreground opacity-30"></div>
            <div className="w-2 h-2 rounded-full bg-muted-foreground opacity-50"></div>
            <div className="w-3 h-3 rounded-full bg-muted-foreground opacity-30"></div>
          </div>
        </div>
      </div>

      {/* Ambient lighting effect */}
      <div 
        className="absolute inset-0 rounded-full opacity-10 pointer-events-none transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${dominantColor}, transparent 70%)`,
          width: '500px',
          height: '500px',
          transform: 'translate(-50%, -50%)',
          left: '50%',
          top: '50%'
        }}
      />
    </div>
  );
}