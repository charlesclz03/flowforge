'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GlassyDropdownProps {
  label: string
  value: number
  options: { label: string; value: number }[]
  onChange: (value: number) => void
  disabled?: boolean
  className?: string
}

export function GlassyDropdown({
  label,
  value,
  options,
  onChange,
  disabled = false,
  className,
}: GlassyDropdownProps) {
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

  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200',
          'border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium',
          isOpen && 'border-accent-purple/50 ring-1 ring-accent-purple/20 bg-accent-purple/10',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span className="text-text-secondary">{label}:</span>
        <span className={cn('text-white', isOpen && 'text-accent-purple')}>
          {selectedOption?.label || value}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            'text-text-secondary transition-transform duration-200 ml-1',
            isOpen && 'rotate-180 text-accent-purple'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-1 space-y-0.5">
            {options.map((option) => {
              const isSelected = option.value === value
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                    isSelected
                      ? 'bg-accent-purple/20 text-accent-purple font-medium'
                      : 'text-text-primary hover:bg-white/10 hover:text-white'
                  )}
                >
                  {option.label}
                  {isSelected && <Check size={14} className="text-accent-purple" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
