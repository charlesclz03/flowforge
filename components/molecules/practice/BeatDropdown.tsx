'use client'

import { useState, useRef, useEffect } from 'react'
import { Beat } from '@/types/database'
import { Crown, Check, ChevronDown, Music } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BeatDropdownProps {
  beats: Beat[]
  selectedBeat: Beat | null
  onSelect: (beat: Beat) => void
  disabled?: boolean
}

export function BeatDropdown({
  beats,
  selectedBeat,
  onSelect,
  disabled = false,
}: BeatDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="space-y-3" ref={dropdownRef}>
      <label className="text-lg font-medium text-white">Beat</label>

      <div className="relative">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'w-full flex items-center justify-between rounded-xl px-4 py-3 text-left transition-all duration-200',
            'border border-white/10 bg-white/5 hover:bg-white/10',
            isOpen && 'border-accent-purple/50 ring-2 ring-accent-purple/20',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {selectedBeat ? (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-purple/20">
                <Music size={14} className="text-accent-purple" />
              </div>
              <div>
                <div className="font-medium text-white text-sm">{selectedBeat.title}</div>
                <div className="text-xs text-text-secondary">
                  {selectedBeat.bpm} BPM • {selectedBeat.artistName || 'FlowForge'}
                </div>
              </div>
            </div>
          ) : (
            <span className="text-text-secondary">Select a beat...</span>
          )}
          <ChevronDown
            size={20}
            className={cn(
              'text-text-secondary transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[300px] overflow-y-auto rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-2xl ring-1 ring-black/5">
            <div className="p-2 space-y-1">
              {beats.map((beat) => {
                const isSelected = selectedBeat?.id === beat.id
                return (
                  <button
                    key={beat.id}
                    onClick={() => {
                      onSelect(beat)
                      setIsOpen(false)
                    }}
                    className={cn(
                      'w-full flex items-center justify-between rounded-lg p-3 transition-colors',
                      isSelected ? 'bg-accent-purple/20' : 'hover:bg-white/5'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-lg border',
                          isSelected
                            ? 'border-accent-purple/30 bg-accent-purple/20'
                            : 'border-white/5 bg-white/5'
                        )}
                      >
                        {isSelected ? (
                          <div className="h-2 w-2 rounded-full bg-accent-purple" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-text-tertiary" />
                        )}
                      </div>

                      {/* Text */}
                      <div className="text-left">
                        <div
                          className={cn(
                            'font-medium text-sm',
                            isSelected ? 'text-accent-purple' : 'text-white'
                          )}
                        >
                          {beat.title}
                        </div>
                        <div className="text-xs text-text-secondary flex items-center gap-2">
                          <span>{beat.bpm} BPM</span>
                          {beat.genre && (
                            <>
                              <span className="h-0.5 w-0.5 rounded-full bg-text-tertiary" />
                              <span>{beat.genre}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Side Icons */}
                    <div className="flex items-center gap-3">
                      {beat.isPremium && (
                        <div className="flex items-center gap-1 rounded-full bg-accent-orange/10 px-2 py-0.5 border border-accent-orange/20">
                          <Crown size={10} className="text-accent-orange" />
                          <span className="text-[10px] font-bold text-accent-orange uppercase tracking-wider">
                            Pro
                          </span>
                        </div>
                      )}

                      {isSelected && <Check size={16} className="text-accent-purple" />}
                    </div>
                  </button>
                )
              })}

              {beats.length === 0 && (
                <div className="p-4 text-center text-sm text-text-secondary">
                  No beats available
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
