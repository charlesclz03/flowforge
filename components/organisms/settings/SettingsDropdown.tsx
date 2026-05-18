'use client'

import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Settings } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Modal } from '@/components/atoms/Modal'

const SettingsList = dynamic(
  () =>
    import('@/components/organisms/settings/SettingsList').then(
      (mod) => mod.SettingsList
    ),
  {
    loading: () => (
      <div className="flex w-full flex-col gap-2 p-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 w-full rounded-lg bg-white/5" />
        ))}
      </div>
    ),
  }
)

export function SettingsDropdown() {
  const [showSheet, setShowSheet] = useState(false)

  return (
    <>
      {/* Mobile: Bottom Sheet Trigger */}
      <div className="lg:hidden">
        <button
          onClick={() => setShowSheet(true)}
          aria-label="Settings"
          className="flex items-center justify-center text-text-secondary hover:text-white transition-colors rounded-full hover:bg-white/5 min-w-[44px] min-h-[44px] p-2"
        >
          <Settings size={20} />
        </button>
        <Modal
          isOpen={showSheet}
          onClose={() => setShowSheet(false)}
          title="Settings"
        >
          <div className="max-h-[70vh] overflow-y-auto -mx-1 px-1">
            <SettingsList onItemClick={() => setShowSheet(false)} />
          </div>
        </Modal>
      </div>

      {/* Desktop: Dropdown Menu */}
      <div className="hidden lg:block">
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple/80"
              aria-label="Settings"
            >
              <Settings size={20} />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-72 origin-top-right divide-y divide-white/10 rounded-xl bg-zinc-950 border border-white/20 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden">
              <SettingsList />
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </>
  )
}
