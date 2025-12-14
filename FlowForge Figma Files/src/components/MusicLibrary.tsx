import React from 'react';
import { useMusicPlayer } from './MusicPlayerContext';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Music, Smartphone, HardDrive, Play, Pause } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function MusicLibrary() {
  const { 
    playlist, 
    currentSong, 
    isPlaying, 
    dominantColor, 
    accentColor,
    selectSong 
  } = useMusicPlayer();

  const internalSongs = playlist.filter(song => song.source === 'internal');
  const sdCardSongs = playlist.filter(song => song.source === 'sdcard');

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const SongList = ({ songs }: { songs: typeof playlist }) => (
    <div className="space-y-2">
      {songs.map((song) => {
        const isCurrentSong = currentSong?.id === song.id;
        return (
          <Card 
            key={song.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              isCurrentSong ? 'shadow-md' : ''
            }`}
            onClick={() => selectSong(song)}
            style={{
              backgroundColor: isCurrentSong ? `${accentColor}20` : undefined,
              borderColor: isCurrentSong ? dominantColor : undefined
            }}
          >
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 shadow-sm">
                  <ImageWithFallback
                    src={song.coverUrl}
                    alt={`${song.album} cover`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">{song.title}</h4>
                  <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                  <p className="text-xs text-muted-foreground/80 truncate">{song.album}</p>
                </div>
                
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {formatDuration(song.duration)}
                  </span>
                  {isCurrentSong && (
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: dominantColor }}
                    >
                      {isPlaying ? (
                        <Pause className="w-3 h-3 text-white" />
                      ) : (
                        <Play className="w-3 h-3 text-white" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="fixed top-4 left-4 z-50 backdrop-blur-sm"
          style={{
            backgroundColor: `${accentColor}40`,
            color: dominantColor
          }}
        >
          <Music className="w-4 h-4 mr-2" />
          Library
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <Music className="w-5 h-5" />
            <span>Music Library</span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="py-6">
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="internal" className="text-xs">
                <Smartphone className="w-3 h-3 mr-1" />
                Internal
              </TabsTrigger>
              <TabsTrigger value="sdcard" className="text-xs">
                <HardDrive className="w-3 h-3 mr-1" />
                SD Card
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">All Songs</h3>
                <Badge 
                  variant="secondary"
                  style={{
                    backgroundColor: accentColor,
                    color: dominantColor
                  }}
                >
                  {playlist.length} songs
                </Badge>
              </div>
              <SongList songs={playlist} />
            </TabsContent>
            
            <TabsContent value="internal" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Internal Storage</h3>
                <Badge 
                  variant="secondary"
                  style={{
                    backgroundColor: accentColor,
                    color: dominantColor
                  }}
                >
                  {internalSongs.length} songs
                </Badge>
              </div>
              <SongList songs={internalSongs} />
            </TabsContent>
            
            <TabsContent value="sdcard" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">SD Card</h3>
                <Badge 
                  variant="secondary"
                  style={{
                    backgroundColor: accentColor,
                    color: dominantColor
                  }}
                >
                  {sdCardSongs.length} songs
                </Badge>
              </div>
              <SongList songs={sdCardSongs} />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}