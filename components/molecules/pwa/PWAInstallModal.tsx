import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Share, X, Smartphone } from 'lucide-react'

interface PWAInstallModalProps {
  isOpen: boolean
  onClose: () => void
  onInstall?: () => void
}

export function PWAInstallModal({ isOpen, onClose }: PWAInstallModalProps) {
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Detect OS
    const userAgent = window.navigator.userAgent.toLowerCase()
    setIsIOS(/iphone|ipad|ipod/.test(userAgent))
  }, [])

  return (
    <Transition appear show={isOpen} as={Fragment}>
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-[#1A1A1A] border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-bold text-white flex items-center gap-2"
                  >
                    <Smartphone className="text-accent-purple" size={24} />
                    Install App
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mt-2 text-center">
                  <p className="text-text-secondary mb-6">
                    Install FreeStyla for the best experience, lower latency,
                    and fullscreen mode.
                  </p>

                  <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4 text-left">
                    {isIOS ? (
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="min-w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                            1
                          </div>
                          <div>
                            <p className="text-white text-sm">
                              Tap the <Share className="inline w-4 h-4 mx-1" />{' '}
                              Share button
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="min-w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                            2
                          </div>
                          <div>
                            <p className="text-white text-sm">
                              Scroll down and tap{' '}
                              <span className="font-bold text-white">
                                Add to Home Screen
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="min-w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">
                            1
                          </div>
                          <div>
                            <p className="text-white text-sm">
                              Tap the <span className="font-bold">Menu</span>{' '}
                              (three dots)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="min-w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">
                            2
                          </div>
                          <div>
                            <p className="text-white text-sm">
                              Select{' '}
                              <span className="font-bold text-white">
                                Install App
                              </span>{' '}
                              or{' '}
                              <span className="font-bold text-white">
                                Add to Home Screen
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    className="flex-1 justify-center rounded-xl bg-accent-purple px-4 py-3 text-sm font-bold text-white hover:bg-accent-purple/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple focus-visible:ring-offset-2 transition-transform active:scale-95"
                    onClick={onClose}
                  >
                    Got it
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
