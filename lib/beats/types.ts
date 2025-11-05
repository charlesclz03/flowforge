export interface BeatMetadata {
  id: string
  title: string
  bpm: number
  storageUrl: string
  isPremium: boolean
  genre: string | null
  duration: number | null // in seconds
  artistName: string | null
}

export interface BeatTiming {
  bpm: number
  beatsPerBar: number
  barsPerPhrase: number
  secondsPerBeat: number
  secondsPerBar: number
}

export interface BeatPlaybackState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
}

