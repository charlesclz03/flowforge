'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { WordData } from '@/lib/words/types'
import { WordGenerator } from '@/lib/words/generator'
import { WordPromptScheduler } from '@/lib/timing/scheduler'

interface UseWordPromptProps {
  words: WordData[]
  bpm: number
  frequency: number
  difficulty: number
  isPlaying: boolean
  currentTime: number
}

export function useWordPrompt({
  words,
  bpm,
  frequency,
  difficulty,
  isPlaying,
  currentTime,
}: UseWordPromptProps) {
  const [currentWord, setCurrentWord] = useState<string | null>(null)
  const [showWord, setShowWord] = useState(false)
  const [promptCount, setPromptCount] = useState(0)

  const generatorRef = useRef<WordGenerator | null>(null)
  const schedulerRef = useRef<WordPromptScheduler | null>(null)
  const nextWordRef = useRef<WordData | null>(null)

  // Initialize generator and scheduler
  useEffect(() => {
    generatorRef.current = new WordGenerator(words)
    schedulerRef.current = new WordPromptScheduler(bpm, frequency)

    // Preload first word
    nextWordRef.current = generatorRef.current.getRandomWord()

    return () => {
      generatorRef.current = null
      schedulerRef.current = null
    }
  }, [words])

  // Update difficulty
  useEffect(() => {
    if (generatorRef.current) {
      generatorRef.current.setDifficulty(difficulty)
      // Get new word for new difficulty
      nextWordRef.current = generatorRef.current.getRandomWord()
    }
  }, [difficulty])

  // Update BPM and frequency
  useEffect(() => {
    if (schedulerRef.current) {
      schedulerRef.current.setBPM(bpm)
      schedulerRef.current.setFrequency(frequency)
    }
  }, [bpm, frequency])

  // Check for prompt triggers
  useEffect(() => {
    if (!isPlaying || !schedulerRef.current || !nextWordRef.current) {
      return
    }

    const triggered = schedulerRef.current.checkAndTrigger(
      currentTime,
      nextWordRef.current
    )

    if (triggered) {
      // Show the current word
      setCurrentWord(nextWordRef.current.wordText)
      setShowWord(true)
      setPromptCount((count) => count + 1)

      // Preload next word
      if (generatorRef.current) {
        nextWordRef.current = generatorRef.current.getRandomWord()
      }

      // Hide word after a short time
      setTimeout(() => {
        setShowWord(false)
      }, 500)
    }
  }, [isPlaying, currentTime])

  // Reset when stopped
  useEffect(() => {
    if (!isPlaying) {
      if (schedulerRef.current) {
        schedulerRef.current.reset()
      }
      setPromptCount(0)
      setCurrentWord(null)
      setShowWord(false)

      // Preload first word for next session
      if (generatorRef.current) {
        nextWordRef.current = generatorRef.current.getRandomWord()
      }
    }
  }, [isPlaying])

  const reset = useCallback(() => {
    if (generatorRef.current) {
      generatorRef.current.reset()
    }
    if (schedulerRef.current) {
      schedulerRef.current.reset()
    }
    setCurrentWord(null)
    setShowWord(false)
    setPromptCount(0)
    nextWordRef.current = generatorRef.current?.getRandomWord() || null
  }, [])

  return {
    currentWord,
    showWord,
    promptCount,
    nextWord: nextWordRef.current?.wordText || null,
    reset,
  }
}

