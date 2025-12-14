import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl: string;
  audioUrl: string;
  source: 'internal' | 'sdcard';
  primaryColor?: string;
  secondaryColor?: string;
}

interface MusicPlayerState {
  currentSong: Song | null;
  playlist: Song[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLooping: boolean;
  isShuffling: boolean;
  darkMode: boolean;
  dominantColor: string;
  accentColor: string;
}

interface MusicPlayerContextType extends MusicPlayerState {
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  nextSong: () => void;
  previousSong: () => void;
  selectSong: (song: Song) => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  toggleDarkMode: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  extractColors: (imageUrl: string) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

// Mock song data with Material U colors
const mockSongs: Song[] = [
  {
    id: '1',
    title: 'Summer Vibes',
    artist: 'Ocean Waves',
    album: 'Coastal Dreams',
    duration: 240,
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=center',
    audioUrl: '',
    source: 'internal',
    primaryColor: '#6750A4',
    secondaryColor: '#E8DEF8'
  },
  {
    id: '2',
    title: 'Midnight Jazz',
    artist: 'Blue Note Collective',
    album: 'City Lights',
    duration: 320,
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop&crop=center',
    audioUrl: '',
    source: 'sdcard',
    primaryColor: '#1976D2',
    secondaryColor: '#BBDEFB'
  },
  {
    id: '3',
    title: 'Electronic Dreams',
    artist: 'Synth Masters',
    album: 'Digital Horizon',
    duration: 280,
    coverUrl: 'https://images.unsplash.com/photo-1571974599782-87624638275d?w=400&h=400&fit=crop&crop=center',
    audioUrl: '',
    source: 'internal',
    primaryColor: '#FF6B35',
    secondaryColor: '#FFE0D6'
  },
  {
    id: '4',
    title: 'Acoustic Soul',
    artist: 'Folk Harmony',
    album: 'Unplugged Sessions',
    duration: 195,
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop&crop=center',
    audioUrl: '',
    source: 'sdcard',
    primaryColor: '#4CAF50',
    secondaryColor: '#E8F5E8'
  },
  {
    id: '5',
    title: 'Urban Beats',
    artist: 'Street Symphony',
    album: 'City Pulse',
    duration: 210,
    coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop&crop=center',
    audioUrl: '',
    source: 'internal',
    primaryColor: '#E91E63',
    secondaryColor: '#FCE4EC'
  }
];

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MusicPlayerState>({
    currentSong: mockSongs[0],
    playlist: mockSongs,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isLooping: false,
    isShuffling: false,
    darkMode: false,
    dominantColor: mockSongs[0].primaryColor || '#6750A4',
    accentColor: mockSongs[0].secondaryColor || '#E8DEF8'
  });

  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (state.isPlaying && state.currentSong) {
        setState(prev => ({
          ...prev,
          currentTime: Math.min(prev.currentTime + 1, state.currentSong?.duration || 0)
        }));
        
        if (state.currentTime >= (state.currentSong?.duration || 0)) {
          if (state.isLooping) {
            setState(prev => ({ ...prev, currentTime: 0 }));
          } else {
            nextSong();
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isPlaying, state.currentTime, state.currentSong?.duration, state.isLooping]);

  const extractColors = (imageUrl: string) => {
    // In a real app, this would use a color extraction library
    // For now, we'll use the predefined colors from the song data
    const song = state.currentSong;
    if (song?.primaryColor && song?.secondaryColor) {
      setState(prev => ({
        ...prev,
        dominantColor: song.primaryColor!,
        accentColor: song.secondaryColor!
      }));
    }
  };

  const play = () => {
    setState(prev => ({ ...prev, isPlaying: true }));
  };

  const pause = () => {
    setState(prev => ({ ...prev, isPlaying: false }));
  };

  const togglePlay = () => {
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const nextSong = () => {
    let nextIndex;
    if (state.isShuffling) {
      nextIndex = Math.floor(Math.random() * state.playlist.length);
    } else {
      nextIndex = (currentSongIndex + 1) % state.playlist.length;
    }
    
    setCurrentSongIndex(nextIndex);
    const nextSong = state.playlist[nextIndex];
    setState(prev => ({
      ...prev,
      currentSong: nextSong,
      currentTime: 0,
      dominantColor: nextSong.primaryColor || '#6750A4',
      accentColor: nextSong.secondaryColor || '#E8DEF8'
    }));
  };

  const previousSong = () => {
    const prevIndex = currentSongIndex === 0 ? state.playlist.length - 1 : currentSongIndex - 1;
    setCurrentSongIndex(prevIndex);
    const prevSong = state.playlist[prevIndex];
    setState(prev => ({
      ...prev,
      currentSong: prevSong,
      currentTime: 0,
      dominantColor: prevSong.primaryColor || '#6750A4',
      accentColor: prevSong.secondaryColor || '#E8DEF8'
    }));
  };

  const selectSong = (song: Song) => {
    const index = state.playlist.findIndex(s => s.id === song.id);
    setCurrentSongIndex(index);
    setState(prev => ({
      ...prev,
      currentSong: song,
      currentTime: 0,
      isPlaying: true,
      dominantColor: song.primaryColor || '#6750A4',
      accentColor: song.secondaryColor || '#E8DEF8'
    }));
  };

  const toggleLoop = () => {
    setState(prev => ({ ...prev, isLooping: !prev.isLooping }));
  };

  const toggleShuffle = () => {
    setState(prev => ({ ...prev, isShuffling: !prev.isShuffling }));
  };

  const toggleDarkMode = () => {
    setState(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const setVolume = (volume: number) => {
    setState(prev => ({ ...prev, volume }));
  };

  const seekTo = (time: number) => {
    setState(prev => ({ ...prev, currentTime: time }));
  };

  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  const contextValue: MusicPlayerContextType = {
    ...state,
    play,
    pause,
    togglePlay,
    nextSong,
    previousSong,
    selectSong,
    toggleLoop,
    toggleShuffle,
    toggleDarkMode,
    setVolume,
    seekTo,
    extractColors
  };

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
}