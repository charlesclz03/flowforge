'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { Card } from '@/components/atoms/Card'
import { SignOutButton } from '@/components/molecules/auth/SignOutButton'
import { ConfirmDialog } from '@/components/molecules/feedback/ConfirmDialog'

export function SecuritySection() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch('/api/user', { method: 'DELETE' })
      if (!res.ok) {
        throw new Error('Failed to delete account')
      }
      window.location.href = '/'
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'An error occurred')
      setIsDeleting(false)
    }
  }

  return (
    <Card title="Security">
      <div className="space-y-4">
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteAccount}
          title="Delete Account?"
          description="This permanently removes your account and all associated data. This action cannot be undone."
          confirmLabel="Delete Account"
          isLoading={isDeleting}
          tone="danger"
        />

        {/* Sign Out */}
        <div className="flex items-center justify-between rounded-xl border border-stroke-subtle/20 bg-background-elevated/50 p-4">
          <div>
            <h3 className="font-medium text-white">Sign Out</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Sign out of your FreeStyla account
            </p>
          </div>
          <SignOutButton className="rounded-lg border border-stroke-subtle/40 bg-background-card px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:border-accent-red/40 hover:text-accent-red" />
        </div>

        <div className="rounded-xl border border-stroke-subtle/20 bg-background-elevated/50 p-4">
          <div>
            <h3 className="font-medium text-white">Manage Your Data</h3>
            <p className="mt-1 text-sm text-text-secondary">
              You can delete recordings or uploaded beats without deleting your
              account.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/recordings"
              className="rounded-lg border border-stroke-subtle/40 bg-background-card px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:border-accent-purple/40 hover:text-accent-purple"
            >
              Manage Recordings
            </Link>
            <Link
              href="/tracks"
              className="rounded-lg border border-stroke-subtle/40 bg-background-card px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:border-accent-cyan/40 hover:text-accent-cyan"
            >
              Manage Uploaded Beats
            </Link>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 mt-4 border-t border-white/5">
          <h4 className="text-sm font-medium text-red-500 mb-4 uppercase tracking-wider">
            Danger Zone
          </h4>

          <div className="flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div>
              <h3 className="font-medium text-white">Delete Account</h3>
              <p className="mt-1 text-sm text-text-secondary">
                Permanently remove your account and all data
              </p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500 hover:text-white"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}
