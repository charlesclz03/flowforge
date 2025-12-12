'use client'

import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { User, Mic, LogOut, ChevronDown, Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserAvatar } from '@/components/molecules/auth/UserAvatar'
import { usePracticeSession } from '@/contexts/SessionContext'
import { ConfirmModal } from '@/components/molecules/display/ConfirmModal'
import { PremiumModal } from '@/components/molecules/display/PremiumModal'

export function ProfileDropdown() {
  const { data: session } = useSession()
  const router = useRouter()
  const { isActive, isRecording } = usePracticeSession()

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingPath, setPendingPath] = useState<string | null>(null)

  const [showPremiumModal, setShowPremiumModal] = useState(false)

  // Check if Pro
  const isPro =
    session?.user?.subscriptionStatus === 'active' ||
    session?.user?.subscriptionStatus === 'trialing'

  const handleNavigation = (path: string, e?: React.MouseEvent) => {
    e?.preventDefault()

    // Gating check for recordings
    if (path === '/profile/recordings' && !isPro) {
      setShowPremiumModal(true)
      return
    }

    if (isActive) {
      setPendingPath(path)
      setShowConfirmModal(true)
    } else {
      router.push(path)
    }
  }

  const confirmNavigation = () => {
    if (pendingPath) {
      // In a real app we might try to save here, but for now we warn and discard
      // Assuming layout unmount handles cleanup or we might strictly need to call stop
      // But typically navigating away is destructive in SPA unless global state persists nicely
      router.push(pendingPath)
    }
    setShowConfirmModal(false)
  }

  return (
    <>
      <Menu as="div" className="relative">
        <Menu.Button className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent-purple/50 rounded-full p-1 -mr-2">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-purple to-accent-blue rounded-full opacity-0 group-hover:opacity-75 blur transition duration-200" />
            <div className="relative flex items-center gap-2 bg-black rounded-full p-1 pr-3 border border-white/10">
              <UserAvatar mode="avatarOnly" className="w-8 h-8" />
              <ChevronDown
                size={14}
                className="text-text-secondary group-hover:text-white transition-colors"
              />
            </div>
          </div>
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-white/10 rounded-xl bg-background-elevated border border-white/10 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
            <div className="px-4 py-3">
              <p className="text-xs text-text-secondary truncate">Signed in as</p>
              <p className="text-sm font-medium text-white truncate">{session?.user?.email}</p>
            </div>

            <div className="p-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={(e) => handleNavigation('/profile', e)}
                    className={cn(
                      'group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm',
                      active ? 'bg-accent-purple/10 text-accent-purple' : 'text-text-primary'
                    )}
                  >
                    <User size={16} />
                    Your Profile
                  </button>
                )}
              </Menu.Item>

              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={(e) => handleNavigation('/profile/recordings', e)}
                    className={cn(
                      'group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm',
                      active ? 'bg-accent-purple/10 text-accent-purple' : 'text-text-primary',
                      !isPro && 'opacity-80'
                    )}
                  >
                    <Mic size={16} />
                    <div className="flex items-center justify-between w-full">
                      <span>Your Recordings</span>
                      {!isPro && (
                        <span className="text-[10px] bg-accent-yellow/20 text-accent-yellow px-1 py-0.5 rounded">
                          PRO
                        </span>
                      )}
                    </div>
                  </button>
                )}
              </Menu.Item>

              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => {}} // Placeholder or real achievements link
                    className={cn(
                      'group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm',
                      active ? 'bg-accent-purple/10 text-accent-purple' : 'text-text-primary'
                    )}
                  >
                    <Award size={16} />
                    Achievements
                  </button>
                )}
              </Menu.Item>
            </div>

            <div className="p-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className={cn(
                      'group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm',
                      active
                        ? 'bg-red-500/10 text-red-400'
                        : 'text-text-secondary hover:text-red-400'
                    )}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Active Session"
        message="You have an active session in progress. Leaving now will discard your current progress. Are you sure?"
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmNavigation}
        confirmText="Disagree & Leave"
        cancelText="Stay"
        isDestructive={true}
      />

      <PremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        trigger="history"
      />
    </>
  )
}
