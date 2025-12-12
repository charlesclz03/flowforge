'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { PracticeTemplate } from '@/components/templates'
import { PageHeader } from '@/components/organisms/common'
import { PracticeControls } from '@/components/organisms/practice'
import { ErrorAlert } from '@/components/molecules/feedback/ErrorAlert'
import { SuccessAlert } from '@/components/molecules/feedback/SuccessAlert'
import { OnboardingLayout } from '@/components/organisms/layout/OnboardingLayout'
import { toast } from 'react-hot-toast'
import { useBeatPlayer } from '@/hooks/useBeatPlayer'
import { useRecording } from '@/hooks/useRecording'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useForceUpdate } from '@/hooks/useForceUpdate'
import { SESSION_CONFIG } from '@/lib/constants/design'
import { ErrorCodes } from '@/lib/errors'
import { usePracticeSession } from '@/contexts/SessionContext'
import { GuestStorage } from '@/lib/guest-storage'
import { GuestLoginModal } from '@/components/auth/GuestLoginModal'
import { BeatSelector } from '@/components/organisms/practice/BeatSelector'
import { useWakeLock } from '@/hooks/useWakeLock'
import { analyzeAudio } from '@/lib/scoring'
import { FirstVisitOverlay } from '@/components/onboarding/FirstVisitOverlay'
import { Beat } from '@/types/database'

export default function PracticePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { selectedBeat, setBeat, frequency, difficulty, isTTSEnabled, ttsVolume } =
    usePracticeSession()
  const [currentWord, setCurrentWord] = useState<string>('')
  const [wordList, setWordList] = useState<string[]>([])
  const [wordIndex, setWordIndex] = useState(0) // Track index for Golden Prompt
  const [sessionDuration] = useState(SESSION_CONFIG.DEFAULT_DURATION_SECONDS)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [playButtonSize, setPlayButtonSize] = useState(180)
  const [showGuestModal, setShowGuestModal] = useState(false)
  const { error, handleError, clearError } = useErrorHandler()
  const forceUpdate = useForceUpdate()
  const { requestLock, releaseLock } = useWakeLock()
  const [beats, setBeats] = useState<Beat[]>([])

  // Handle responsive play button size
  useEffect(() => {
    const updateSize = () => {
      setPlayButtonSize(window.innerWidth >= 640 ? 200 : 180)
    }
    updateSize()
    window.addEventListener('resize', updateSize)

    // Fetch Beats
    const fetchBeats = async () => {
      try {
        const res = await fetch('/api/beats')
        const data = await res.json()
        if (data.beats) setBeats(data.beats)
      } catch (err) {
        console.error('Failed to load beats', err)
      }
    }
    fetchBeats()

    // Headphone Toast
    const toastId = setTimeout(() => {
      // toast('🎧 Headphones recommended for studio quality', { icon: '🎧' })
      // Need to import toast first.
    }, 1000)

    return () => {
      window.removeEventListener('resize', updateSize)
      clearTimeout(toastId)
    }
  }, [])

  // Determine if user is pro
  const isPro =
    session?.user?.subscriptionStatus === 'active' ||
    session?.user?.subscriptionStatus === 'trialing'

  // Audio hooks
  const beatPlayer = useBeatPlayer()

  // Handle stop (logic detached from recording hook for circular dependency resolution)
  const stopPlayback = useCallback(() => {
    beatPlayer.stop()
    releaseLock()
    setCurrentWord(wordList[0] || '')
    forceUpdate()
  }, [beatPlayer, wordList, forceUpdate, releaseLock])

  // Challenge Logic
  const searchParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const challengeId = searchParams?.get('challengeId')

  useEffect(() => {
    if (challengeId) {
      // Fetch challenge details
      // Actually, let's use the server action we created: getChallengeSession
      // But we can't call server action directly in useEffect easily without wrapping or treating it as promise.
      // Next.js Server Actions can be called from client components.

      const loadChallenge = async () => {
        try {
          // Dynamic import to avoid server-side module issues in client component if checking 'use server' isn't enough?
          // Actually, we can just import it.
          const { getChallengeSession } = await import('@/app/actions/social')
          const data = await getChallengeSession(challengeId)

          if (data && data.beat) {
            setBeat(data.beat)
            // setFrequency(data.frequency) // Need setters in context if we want to force it
            // setDifficulty(data.difficulty)
            // For now, just setting the beat is the MVP "Duel".
            // Ideally we show a banner "Challenging..."
          }
        } catch (err) {
          console.error('Failed to load challenge', err)
        }
      }
      loadChallenge()
    }
  }, [challengeId, setBeat])

  const handleRecordingComplete = useCallback(
    async (blob: Blob, recordedDuration: number) => {
      if (blob.size === 0) {
        console.warn('Recording blob is empty, not saving')
        return
      }

      if (selectedBeat) {
        if (session?.user) {
          try {
            const measuredDuration = Math.round(recordedDuration)
            const fallbackDuration = blob.size > 0 ? Math.max(1, Math.round(blob.size / 16000)) : 1
            const actualDuration = Math.max(
              1,
              measuredDuration > 0 ? measuredDuration : fallbackDuration
            )

            // Analyze Audio (Scoring)
            const { score, vibe } = await analyzeAudio(blob)

            // Word Vault: Collect used words
            const usedWords = wordList.slice(0, wordIndex + 1)

            const formData = new FormData()
            formData.append('audio', blob, 'recording.webm')
            formData.append('beatId', selectedBeat.id)
            formData.append('title', `${selectedBeat.title} - ${new Date().toLocaleDateString()}`)
            formData.append('durationSeconds', actualDuration.toString())
            formData.append('frequency', frequency.toString())
            formData.append('difficulty', difficulty.toString())
            formData.append('score', score.toString())
            formData.append('vibe', vibe || '')
            formData.append('wordsUsed', JSON.stringify(usedWords))

            if (challengeId) {
              formData.append('parentId', challengeId)
            }

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
          // Guest Mode: Save to local storage and prompt login
          try {
            const measuredDuration = Math.round(recordedDuration)
            const fallbackDuration = blob.size > 0 ? Math.max(1, Math.round(blob.size / 16000)) : 1
            const actualDuration = Math.max(
              1,
              measuredDuration > 0 ? measuredDuration : fallbackDuration
            )

            const metadata = {
              beatId: selectedBeat.id,
              beatTitle: selectedBeat.title,
              frequency: frequency,
              difficulty: difficulty,
              duration: actualDuration,
              createdAt: Date.now(),
              // Guest mode doesn't strictly need persistent score yet but good to have
            }

            // Save to IndexedDB
            await GuestStorage.saveSession(blob, metadata)

            // Show modal
            setShowGuestModal(true)
          } catch (err) {
            console.error('Failed to save guest session:', err)
            // Fallback: just ask them to sign in, they might lose this specific take but at least they convert
            // But realistically we want to tell them.
            setSaveMessage('Could not save temp recording. Please sign in.')
          }
        }
      }
    },
    [
      selectedBeat,
      session?.user,
      frequency,
      difficulty,
      handleError,
      challengeId,
      wordList,
      wordIndex,
    ]
  )

  const {
    isRecording,
    duration,
    start: startRecording,
    stop: stopRecording,
    resume: resumeRecording,
  } = useRecording({
    maxDuration: isPro ? null : 120, // 2 minutes for free, unlimited for pro
    onComplete: (blob, duration) => handleRecordingComplete(blob, duration),
    onMaxDurationReached: () => {
      stopPlayback() // Stop the beat and UI
      // Note: Recorder stops automatically
      if (!isPro) {
        setSaveMessage('Free limit reached (2m). Upgrade for unlimited recording!')
      }
    },
  })

  // Main stop handler for button click
  const handleStop = useCallback(() => {
    stopRecording()
    stopPlayback()
  }, [stopRecording, stopPlayback])

  // Redirect to setup if there is no configured beat
  // Redirect removed to allow on-page beat selection
  // useEffect(() => {
  //   if (!selectedBeat && !challengeId) {
  //     router.push('/difficultyselection')
  //   }
  // }, [selectedBeat, router, challengeId])

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
  const handlePlayPause = useCallback(async () => {
    if (!selectedBeat) return

    if (beatPlayer.isPlaying) {
      if (isRecording) {
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

        if (!isRecording) {
          await requestLock() // Keep screen awake
          await startRecording(!isPro)
        } else {
          resumeRecording()
        }
      } catch (err) {
        handleError(err, ErrorCodes.AUDIO_PLAYBACK_FAILED)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedBeat,
    beatPlayer.isPlaying,
    isRecording,
    beatPlayer.play,
    beatPlayer.pause,
    beatPlayer.stop,
    wordList,
    currentWord,
    requestLock,
    startRecording,
    isPro,
    resumeRecording,
    handleError,
    clearError,
    stopRecording,
  ])

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
        if (elapsedSeconds >= sessionDuration) {
          beatPlayer.stop()
          stopRecording()
          releaseLock()
          setCurrentWord('')
          return
        }
        setCurrentWord('')
        return
      }

      const wordIdx = Math.floor(elapsedSeconds / secondsPerPrompt)
      const actualIndex = wordIdx % wordList.length
      setWordIndex(wordIdx) // Update state

      const newWord = wordList[actualIndex]
      if (newWord !== currentWord) {
        setCurrentWord(newWord)

        // Trigger TTS
        if (isTTSEnabled && newWord && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(newWord)
          utterance.rate = 1.2 // Slightly faster for flow
          utterance.volume = ttsVolume
          // Try to use a better voice if available (Google US English or Safari default)
          const voices = window.speechSynthesis.getVoices()
          const preferredVoice = voices.find(
            (v) => v.name.includes('Google US English') || v.name.includes('Samantha')
          )
          if (preferredVoice) utterance.voice = preferredVoice

          window.speechSynthesis.cancel() // Stop previous word
          window.speechSynthesis.speak(utterance)
        }
      }
    }, 100)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beatPlayer.isPlaying, selectedBeat?.id, frequency, wordList.length, sessionDuration])

  // Desktop Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.code === 'Space') {
        e.preventDefault() // Prevent scroll
        handlePlayPause()
      }

      if (e.code === 'KeyR') {
        if (!isRecording && beatPlayer.isPlaying) {
          startRecording(!isPro)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handlePlayPause, isRecording, beatPlayer.isPlaying])

  return (
    <OnboardingLayout showBackButton onBack={() => router.push('/difficultyselection')}>
      <FirstVisitOverlay />
      <PracticeTemplate
        pageHeader={
          <PageHeader
            title={challengeId ? 'Duel Mode' : 'Practice Session'}
            description={
              challengeId
                ? 'Drop your best response!'
                : 'Press play to start your 2-minute freestyle.'
            }
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
        beatSelector={
          <BeatSelector
            beats={beats}
            selectedBeat={selectedBeat}
            onSelect={setBeat}
            isPro={isPro}
            className="mt-6"
          />
        }
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
              isRecording={isRecording}
              recordingDuration={duration}
              error={
                beatPlayer.error ||
                (typeof error === 'string' ? error : (error as Error)?.message) ||
                null
              }
              onToggle={handlePlayPause}
              playButtonSize={playButtonSize}
              difficulty={difficulty}
              frequency={frequency}
              isGolden={(wordIndex + 1) % 50 === 0 && wordIndex > 0}
              onSkipWord={() => {
                // Skip logic
                setCurrentWord(wordList[(wordIndex + 1) % wordList.length])
                setWordIndex((prev) => prev + 1)
                // Visual feedback for penalty?
                // Ideally we track score deduction in state
                toast.error('Panic! -500 Points', { icon: '😱' })
              }}
            />
          ) : null
        }
        helpSection={null}
      />
      <GuestLoginModal isOpen={showGuestModal} onClose={() => setShowGuestModal(false)} />
    </OnboardingLayout>
  )
}
