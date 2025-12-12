'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Sparkles, Check, X } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { useRouter } from 'next/navigation'

interface PremiumModalProps {
  isOpen: boolean
  onClose: () => void
  trigger?: string // Context of what triggered it (e.g. "recording", "beat", "history")
}

export function PremiumModal({ isOpen, onClose, trigger }: PremiumModalProps) {
  const router = useRouter()

  const handleUpgrade = () => {
    // Navigate to pricing or checkout
    // For now, maybe just toast or console log as Stripe isn't fully set up in this context
    // Assuming /pricing or similar exists, or redirect to stripe link
    // pushing to a theoretical pricing section or billing portal
    router.push('/#pricing')
    onClose()
  }

  const getMessage = () => {
    switch (trigger) {
      case 'recording':
        return 'Unlock Recording Studio'
      case 'beat':
        return 'Unlock Premium Beats'
      case 'history':
        return 'View Your Session History'
      default:
        return 'Upgrade to Pro'
    }
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-[#0A0A0A] border border-accent-yellow/30 px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6 ring-1 ring-accent-yellow/20">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md text-text-secondary hover:text-white focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-yellow/10 mb-6 animate-pulse-slow">
                    <Sparkles className="h-8 w-8 text-accent-yellow" aria-hidden="true" />
                  </div>

                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-black leading-6 text-white uppercase tracking-tight"
                  >
                    {getMessage()}
                  </Dialog.Title>

                  <div className="mt-4">
                    <p className="text-sm text-text-secondary">
                      Take your freestyle game to the next level. Join the elite.
                    </p>
                  </div>

                  <div className="mt-6 text-left bg-white/5 rounded-xl p-4 border border-white/5">
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-sm text-text-primary">
                        <Check className="h-4 w-4 text-accent-yellow" />
                        <span>Unlimited Studio Recordings</span>
                      </li>
                      <li className="flex items-center gap-3 text-sm text-text-primary">
                        <Check className="h-4 w-4 text-accent-yellow" />
                        <span>Access All Premium Beats</span>
                      </li>
                      <li className="flex items-center gap-3 text-sm text-text-primary">
                        <Check className="h-4 w-4 text-accent-yellow" />
                        <span>Session History & Stats</span>
                      </li>
                      <li className="flex items-center gap-3 text-sm text-text-primary">
                        <Check className="h-4 w-4 text-accent-yellow" />
                        <span>Exclusive "Pro" Badge</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    variant="primary"
                    className="w-full bg-gradient-to-r from-accent-yellow to-amber-500 hover:from-accent-yellow/90 hover:to-amber-500/90 text-black border-none font-bold text-lg h-12"
                    onClick={handleUpgrade}
                  >
                    Upgrade Now
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
