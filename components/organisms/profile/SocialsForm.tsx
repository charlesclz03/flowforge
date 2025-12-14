'use client'

import { useState } from 'react'
import { Card } from '@/components/atoms/Card'
import { Button } from '@/components/atoms/Button'
import { Instagram, Globe, Save } from 'lucide-react'
import { updateSocials } from '@/app/actions/social'
import { toast } from 'react-hot-toast'

export interface SocialLinks {
  instagram?: string
  tiktok?: string
}

interface SocialsFormProps {
  initialSocials: SocialLinks
}

export function SocialsForm({ initialSocials }: SocialsFormProps) {
  const [instagram, setInstagram] = useState(initialSocials?.instagram || '')
  const [tiktok, setTiktok] = useState(initialSocials?.tiktok || '') // Re-using globe for now or finding icon
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateSocials({ instagram, tiktok })
      toast.success('Socials updated!')
    } catch (error) {
      toast.error('Failed to update socials')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card title="Social Links" subtitle="Show off your handles on your profile.">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs text-text-secondary uppercase font-bold tracking-wider">
            Instagram
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              <Instagram size={16} />
            </div>
            <input
              type="text"
              placeholder="username"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="w-full bg-background-elevated border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-accent-purple"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-text-secondary uppercase font-bold tracking-wider">
            TikTok
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              <Globe size={16} />
            </div>
            <input
              type="text"
              placeholder="username"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
              className="w-full bg-background-elevated border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-accent-purple"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={handleSave} isLoading={isSaving} leftIcon={<Save size={16} />}>
            Save Links
          </Button>
        </div>
      </div>
    </Card>
  )
}
