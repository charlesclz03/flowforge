'use client'

import { signIn } from 'next-auth/react'
import { X } from 'lucide-react'

interface GuestLoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GuestLoginModal({ isOpen, onClose }: GuestLoginModalProps) {
  if (!isOpen) return null

  const handleSignIn = () => {
    // Redirect to profile after login to trigger the restoration logic
    signIn('google', { callbackUrl: '/profile' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 bg-[#1C1C1E] border border-white/10 rounded-2xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-[#7D7AFF]/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-3xl">🔥</span>
          </div>

          <h2 className="text-2xl font-bold text-white">Don't Lose Your Flow</h2>

          <p className="text-[#8E8E93]">
            That was fire! Sign in now to save this recording to your profile forever.
          </p>

          <div className="pt-4 space-y-3">
            <button
              onClick={handleSignIn}
              className="w-full py-3.5 bg-[#7D7AFF] hover:bg-[#6865D6] text-white font-medium rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#7D7AFF]/20"
            >
              Sign In with Google
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 text-[#8E8E93] hover:text-white text-sm transition-colors"
            >
              Discard Recording
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
