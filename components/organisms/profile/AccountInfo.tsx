'use client'

import Image from 'next/image'
import { Card } from '@/components/atoms/Card'

interface User {
  name?: string | null
  email?: string | null
  image?: string | null
}

interface AccountInfoProps {
  user: User
}

export function AccountInfo({ user }: AccountInfoProps) {
  return (
    <Card title="Account Information">
      <div className="space-y-6">
        {/* User Avatar and Name */}
        <div className="flex items-center gap-4">
          {user.image ? (
            <div className="relative h-20 w-20">
              <Image
                src={user.image}
                alt={user.name || 'User'}
                fill
                sizes="80px"
                className="rounded-full border-2 border-accent-orange/20 object-cover"
              />
            </div>
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 text-2xl font-semibold text-white">
              {user.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || 'U'}
            </div>
          )}
          <div>
            <h3 className="text-xl font-medium text-white">{user.name}</h3>
            <p className="text-text-secondary">{user.email}</p>
          </div>
        </div>

        {/* Account Details */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-stroke-subtle/20 bg-background-elevated/50 p-4">
            <p className="text-sm text-text-tertiary">Email</p>
            <p className="mt-1 text-white">{user.email}</p>
          </div>
          <div className="rounded-xl border border-stroke-subtle/20 bg-background-elevated/50 p-4">
            <p className="text-sm text-text-tertiary">Account Type</p>
            <p className="mt-1 text-white">Free Tier</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
