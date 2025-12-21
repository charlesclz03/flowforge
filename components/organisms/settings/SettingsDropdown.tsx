'use client'

import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Settings } from 'lucide-react'
import { SettingsList } from '@/components/organisms/settings/SettingsList' // Adjust path
import { BottomSheet } from '@/components/atoms/BottomSheet'

export function SettingsDropdown() {
  const [showSheet, setShowSheet] = useState(false)

  return (
    <>
      {/* Mobile: Bottom Sheet Trigger */}
      <div className="lg:hidden">
        <button
          onClick={() => setShowSheet(true)}
          className="p-2 text-text-secondary hover:text-white transition-colors rounded-full hover:bg-white/5"
        >
          <Settings size={20} />
        </button>
        <BottomSheet isOpen={showSheet} onClose={() => setShowSheet(false)} title="Settings">
          <SettingsList onItemClick={() => setShowSheet(false)} />
        </BottomSheet>
      </div>

      {/* Desktop: Dropdown Menu */}
      <div className="hidden lg:block">
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="p-2 text-text-secondary hover:text-white transition-colors rounded-full hover:bg-white/5">
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
            <Menu.Items className="absolute right-0 mt-2 w-72 origin-top-right divide-y divide-white/10 rounded-xl bg-background-elevated border border-white/10 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden">
              <SettingsList />
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </>
  )
}
