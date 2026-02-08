'use client'

import { useRouter } from 'next/navigation'
import { TabsTrigger } from '@/components/atoms/Tabs'

export function SuperAdminUploadTabTrigger() {
  const router = useRouter()

  return (
    <TabsTrigger
      value="upload-public-beats"
      onClick={(e) => {
        e.preventDefault()
        router.push('/admin/beats/new')
      }}
    >
      Upload Public Beats
    </TabsTrigger>
  )
}
