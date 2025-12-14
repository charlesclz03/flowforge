import React from 'react';
import { useMusicPlayer } from './MusicPlayerContext';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Settings, Moon, Sun, Volume2, Repeat, Shuffle, HardDrive, Smartphone } from 'lucide-react';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Card, CardContent } from './ui/card';

export function SettingsPanel() {
  const { 
    darkMode, 
    isLooping, 
    isShuffling, 
    volume,
    dominantColor,
    accentColor,
    playlist,
    toggleDarkMode, 
    toggleLoop, 
    toggleShuffle,
    setVolume
  } = useMusicPlayer();

  const internalSongs = playlist.filter(song => song.source === 'internal');
  const sdCardSongs = playlist.filter(song => song.source === 'sdcard');

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="fixed top-4 right-4 z-50 w-10 h-10 p-0 rounded-full backdrop-blur-sm"
          style={{
            backgroundColor: `${accentColor}40`,
            color: dominantColor
          }}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-lg">Settings</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 py-6">
          {/* Theme Settings */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium">Appearance</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: accentColor }}
                  >
                    {darkMode ? (
                      <Moon className="w-4 h-4" style={{ color: dominantColor }} />
                    ) : (
                      <Sun className="w-4 h-4" style={{ color: dominantColor }} />
                    )}
                  </div>
                  <Label htmlFor="dark-mode" className="text-sm">Dark Mode</Label>
                </div>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={toggleDarkMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* Playback Settings */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium">Playback</h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: isLooping ? dominantColor : accentColor }}
                  >
                    <Repeat className="w-4 h-4" style={{ color: isLooping ? 'white' : dominantColor }} />
                  </div>
                  <Label htmlFor="loop-mode" className="text-sm">Loop Mode</Label>
                </div>
                <Switch
                  id="loop-mode"
                  checked={isLooping}
                  onCheckedChange={toggleLoop}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: isShuffling ? dominantColor : accentColor }}
                  >
                    <Shuffle className="w-4 h-4" style={{ color: isShuffling ? 'white' : dominantColor }} />
                  </div>
                  <Label htmlFor="shuffle-mode" className="text-sm">Shuffle Mode</Label>
                </div>
                <Switch
                  id="shuffle-mode"
                  checked={isShuffling}
                  onCheckedChange={toggleShuffle}
                />
              </div>
            </CardContent>
          </Card>

          {/* Audio Settings */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium">Audio</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Volume2 className="w-4 h-4" style={{ color: dominantColor }} />
                  </div>
                  <Label className="text-sm">Volume: {Math.round(volume * 100)}%</Label>
                </div>
                <div className="px-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume * 100}
                    onChange={(e) => setVolume(parseInt(e.target.value) / 100)}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${dominantColor} 0%, ${dominantColor} ${volume * 100}%, ${accentColor} ${volume * 100}%, ${accentColor} 100%)`
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Storage Info */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium">Storage</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: accentColor }}
                    >
                      <Smartphone className="w-4 h-4" style={{ color: dominantColor }} />
                    </div>
                    <span className="text-sm">Internal Storage</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{internalSongs.length} songs</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: accentColor }}
                    >
                      <HardDrive className="w-4 h-4" style={{ color: dominantColor }} />
                    </div>
                    <span className="text-sm">SD Card</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{sdCardSongs.length} songs</span>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Library</span>
                  <span className="text-sm font-medium" style={{ color: dominantColor }}>
                    {playlist.length} songs
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}