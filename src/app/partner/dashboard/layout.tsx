'use client'

import { PartnerSidebar } from '@/components/partner/layout/partner-sidebar'
import { PartnerHeader } from '@/components/partner/layout/partner-header'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface PartnerDashboardLayoutProps {
  children: React.ReactNode
}

export default function PartnerDashboardLayout({ children }: PartnerDashboardLayoutProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [userName, setUserName] = useState('')
  const [partnerId, setPartnerId] = useState('')

  useEffect(() => {
    // Check authentication
    const session = localStorage.getItem('session')
    if (!session) {
      router.push('/login')
      return
    }

    const user = JSON.parse(session)
    if (user.role !== 'partner') {
      router.push('/owner/dashboard')
      return
    }

    // Use requestAnimationFrame to defer state update
    requestAnimationFrame(() => {
      setUserName(user.name)
      setPartnerId(user.partnerId || '')
      setMounted(true)
    })
  }, [router])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/50 dark:from-gray-950 dark:to-emerald-950/50">
      <PartnerSidebar userName={userName} partnerId={partnerId} />

      <div className="lg:pl-72 min-h-screen pt-14 lg:pt-0">
        <div className="bg-gradient-to-r from-white to-emerald-50/50 dark:from-gray-900 dark:to-emerald-950/50 backdrop-blur-sm border-b border-emerald-100 dark:border-emerald-900">
          <PartnerHeader userName={userName} userTier="Bronze" />
        </div>

        <main className="p-4 md:p-5">
          {children}
        </main>
      </div>
    </div>
  )
}
