'use client'

import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface OwnerDashboardLayoutProps {
  children: React.ReactNode
}

export default function OwnerDashboardLayout({ children }: OwnerDashboardLayoutProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Check authentication
    const session = localStorage.getItem('session')
    if (!session) {
      router.push('/login')
      return
    }

    const user = JSON.parse(session)
    if (user.role !== 'owner') {
      router.push('/partner/dashboard')
      return
    }

    // Use requestAnimationFrame to defer state update
    requestAnimationFrame(() => {
      setUserName(user.name)
      setMounted(true)
    })
  }, [router])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/50 dark:from-gray-950 dark:to-blue-950/50">
      <DashboardSidebar role="owner" userName={userName} />

      <div className="lg:pl-64 min-h-screen pt-14 lg:pt-0">
        <main className="p-4 md:p-5">
          {children}
        </main>
      </div>
    </div>
  )
}
