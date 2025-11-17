'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { PracticeTemplate } from '@/components/templates'
import { PageHeader } from '@/components/organisms/common'
import { PracticeControls } from '@/components/organisms/practice'
import { ErrorAlert } from '@/components/molecules/feedback/ErrorAlert'
import { SuccessAlert } from '@/components/molecules/feedback/SuccessAlert'
import { OnboardingLayout } from '@/components/organisms/layout/OnboardingLayout'
import { useBeatPlayer } from '@/hooks/useBeatPlayer'
import { useRecording } from '@/hooks/useRecording'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useForceUpdate } from '@/hooks/useForceUpdate'
import { SESSION_CONFIG } from '@/lib/constants/design'
import { ErrorCodes } from '@/lib/errors'
import { usePracticeSession } from '@/contexts/SessionContext'

export default function PracticePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { selectedBeat, frequency, difficulty } = usePracticeSession()
  const [currentWord, setCurrentWord] = useState<string>('')
  const [wordList, setWordList] = useState<string[]>([])
  const [sessionDuration] = useState(SESSION_CONFIG.DEFAULT_DURATION_SECONDS)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [playButtonSize, setPlayButtonSize] = useState(180)
  const { error, handleError, clearError } = useErrorHandler()
  const forceUpdate = useForceUpdate()

  // Handle responsive play button size
  useEffect(() => {
    const updateSize = () => {
      setPlayButtonSize(window.innerWidth >= 640 ? 200 : 180)
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Audio hooks
  const beatPlayer = useBeatPlayer()
  const recording = useRecording({
    maxDuration: sessionDuration,
    onMaxDurationReached: () => {
      handleStop()
    },
    onComplete: async (blob) => {
      if (blob.size === 0) {
        console.warn('Recording blob is empty, not saving')
        return
      }

      if (selectedBeat) {
        if (session?.user) {
          try {
            const measuredDuration = Math.round(recording.duration || 0)
            const fallbackDuration = blob.size > 0 ? Math.max(1, Math.round(blob.size / 16000)) : 1
            const actualDuration = Math.max(
              1,
              measuredDuration > 0 ? measuredDuration : fallbackDuration
            )

            const formData = new FormData()
            formData.append('audio', blob, 'recording.webm')
            formData.append('beatId', selectedBeat.id)
            formData.append('title', `${selectedBeat.title} - ${new Date().toLocaleDateString()}`)
            formData.append('durationSeconds', actualDuration.toString())
            formData.append('frequency', frequency.toString())
            formData.append('difficulty', difficulty.toString())

            const response = await fetch('/api/recordings', {
              method: 'POST',
              body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
              throw new Error(data.error || 'Failed to save recording')
            }

            setSaveMessage('Recording saved successfully! View it in your recordings library.')
            setTimeout(() => setSaveMessage(null), 5000)
          } catch (err) {
            handleError(err, ErrorCodes.SESSION_SAVE_FAILED)
          }
        } else {
          setSaveMessage('Session complete! Sign in to save your recordings next time.')
          setTimeout(() => setSaveMessage(null), 5000)
        }
      }
    },
  })

  // Redirect to setup if there is no configured beat
  useEffect(() => {
    if (!selectedBeat) {
      router.push('/difficultyselection')
    }
  }, [selectedBeat, router])

  // Load beat audio when selected
  useEffect(() => {
    if (selectedBeat) {
      const beatMetadata = {
        id: selectedBeat.id,
        title: selectedBeat.title,
        bpm: selectedBeat.bpm,
        storageUrl: selectedBeat.storageUrl,
        isPremium: selectedBeat.isPremium,
        genre: selectedBeat.genre,
        duration: selectedBeat.duration,
        artistName: selectedBeat.artistName,
      }
      beatPlayer.loadBeat(beatMetadata)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBeat?.id])

  // Fetch words when beat and difficulty are selected
  useEffect(() => {
    if (!selectedBeat) return

    async function fetchWords() {
      try {
        const secondsPerBar = (60 / selectedBeat!.bpm) * 4
        const secondsPerPrompt = secondsPerBar * frequency
        const wordsNeeded = Math.ceil(sessionDuration / secondsPerPrompt)

        const response = await fetch(
          `/api/words/random?difficulty=${difficulty}&count=${wordsNeeded}`
        )
        const data = await response.json()

        if (data.words && data.words.length > 0) {
          const words = data.words.map((w: { wordText: string }) => w.wordText)
          setWordList(words)
        }
      } catch (err) {
        handleError(err, ErrorCodes.FETCH_WORDS_FAILED)
      }
    }

    fetchWords()
  }, [selectedBeat, difficulty, frequency, sessionDuration, handleError])

  // Handle play/pause
  const handlePlayPause = async () => {
    if (!selectedBeat) return

    if (beatPlayer.isPlaying) {
      if (recording.isRecording) {
        handleStop()
      } else {
        beatPlayer.pause()
      }
    } else {
      clearError()
      try {
        if (wordList.length > 0 && !currentWord) {
          setCurrentWord(wordList[0])
        }

        await beatPlayer.play()

        if (!recording.isRecording) {
          await recording.start()
        } else {
          recording.resume()
        }
      } catch (err) {
        handleError(err, ErrorCodes.AUDIO_PLAYBACK_FAILED)
      }
    }
  }

  // Handle stop
  const handleStop = () => {
    beatPlayer.stop()
    recording.stop()
    setCurrentWord(wordList[0] || '')
    forceUpdate()
  }

  // Timer countdown and word cycling
  useEffect(() => {
    if (!beatPlayer.isPlaying || !selectedBeat || wordList.length === 0) return

    const secondsPerBar = (60 / selectedBeat.bpm) * 4
    const secondsPerPrompt = secondsPerBar * frequency
    const startTime = Date.now()

    const interval = setInterval(() => {
      const elapsedMs = Date.now() - startTime
      const elapsedSeconds = elapsedMs / 1000

      forceUpdate()

      if (elapsedSeconds >= sessionDuration) {
        beatPlayer.stop()
        recording.stop()
        setCurrentWord('')
        return
      }

      const wordIndex = Math.floor(elapsedSeconds / secondsPerPrompt)
      const actualIndex = wordIndex % wordList.length
      setCurrentWord(wordList[actualIndex])
    }, 100)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beatPlayer.isPlaying, selectedBeat?.id, frequency, wordList.length, sessionDuration])

  return (
    <OnboardingLayout showBackButton onBack={() => router.push('/difficultyselection')}>
      <PracticeTemplate
        pageHeader={
          <PageHeader
            title="Practice Session"
            description="Press play to start your 2-minute freestyle."
          />
        }
        alerts={
          <>
            {saveMessage && (
              <SuccessAlert message={saveMessage} onDismiss={() => setSaveMessage(null)} />
            )}
            {error && <ErrorAlert error={error} onDismiss={clearError} />}
          </>
        }
        beatSelector={null}
        sessionConfig={null}
        practiceControls={
          selectedBeat ? (
            <PracticeControls
              selectedBeat={selectedBeat}
              isPlaying={beatPlayer.isPlaying}
              isLoading={beatPlayer.isLoading}
              currentTime={beatPlayer.currentTime || 0}
              sessionDuration={sessionDuration}
              currentWord={currentWord}
              isRecording={recording.isRecording}
              recordingDuration={recording.duration}
              error={beatPlayer.error || recording.error}
              onToggle={handlePlayPause}
              playButtonSize={playButtonSize}
              difficulty={difficulty}
              frequency={frequency}
            />
          ) : null
        }
        helpSection={null}
      />
    </OnboardingLayout>
  )
}
