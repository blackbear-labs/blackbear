'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Trophy,
  Bell,
  Settings,
  LogOut,
  Menu
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useState, useEffect, useCallback, useRef } from 'react'

interface PartnerSidebarProps {
  userName?: string
  onLogout?: () => void
  partnerId?: string
}

const partnerNavItems = [
  { name: 'Dashboard', href: '/partner/dashboard', icon: LayoutDashboard, showBadge: false },
  { name: 'Transaksi', href: '/partner/dashboard/transactions', icon: CreditCard, showBadge: false },
  { name: 'Customer', href: '/partner/dashboard/customers', icon: Users, showBadge: false },
  { name: 'Pengumuman', href: '/partner/dashboard/notifications', icon: Bell, showBadge: true },
  { name: 'Leaderboard', href: '/partner/dashboard/leaderboard', icon: Trophy, showBadge: false },
  { name: 'Pengaturan', href: '/partner/dashboard/settings', icon: Settings, showBadge: false },
]

interface PartnerSidebarContentProps {
  userName?: string
  pathname: string
  onLogout: () => void
  onCloseMobile?: () => void
  partnerId?: string
}

function PartnerSidebarContent({ userName, pathname, onLogout, onCloseMobile, partnerId }: PartnerSidebarContentProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const previousPartnerId = useRef<string | undefined>(partnerId)

  const fetchUnreadCount = useCallback(async () => {
    if (!partnerId) return

    try {
      const response = await fetch(`/api/partners/${partnerId}/notifications?filter=active`)
      if (response.ok) {
        const data = await response.json()
        const unread = data.notifications.filter((n: any) => !n.isRead).length
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }, [partnerId])

  useEffect(() => {
    // Only fetch when partnerId changes
    if (partnerId && partnerId !== previousPartnerId.current) {
      previousPartnerId.current = partnerId
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchUnreadCount()
    }
  }, [partnerId, fetchUnreadCount])

  useEffect(() => {
    if (!partnerId) return

    // Auto-refresh setiap 30 detik
    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000)

    return () => clearInterval(interval)
  }, [partnerId, fetchUnreadCount])

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
      {/* Header */}
      <div className="p-6 border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <Link href="/partner/dashboard" className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Partner</span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">Panel</span>
          </div>
        </Link>
        {userName && (
          <div className="mt-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {userName}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4 py-4">
        <nav className="space-y-2">
          {partnerNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            const showBadge = item.showBadge && unreadCount > 0

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative',
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md'
                )}
              >
                <div className="relative flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                  {showBadge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -right-2 -top-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold animate-pulse"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </div>
                {isActive && !showBadge && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Quick Stats Mini */}
        <div className="mt-6 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-emerald-100 dark:border-emerald-900">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">AKSES CEPAT</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto flex-col py-3 gap-1 text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              asChild
            >
              <Link href="/partner/dashboard/transactions">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span className="text-gray-700 dark:text-gray-300">Input</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto flex-col py-3 gap-1 text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              asChild
            >
              <Link href="/partner/dashboard/customers">
                <Users className="w-4 h-4 text-emerald-600" />
                <span className="text-gray-700 dark:text-gray-300">Pelanggan</span>
              </Link>
            </Button>
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-300"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Keluar
        </Button>
      </div>
    </div>
  )
}

export function PartnerSidebar({ userName, onLogout, partnerId }: PartnerSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true)
    })
  }, [])

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      localStorage.removeItem('session')
      window.location.href = '/login'
    }
  }

  const handleCloseMobile = () => {
    setMobileOpen(false)
  }

  if (!mounted) {
    return (
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm">
        <Link href="/partner/dashboard" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">PartnerPanel</span>
        </Link>
        <Button variant="ghost" size="icon">
          <Menu className="w-6 h-6" />
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Header - Only visible on mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm">
        <Link href="/partner/dashboard" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">PartnerPanel</span>
        </Link>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px]">
            <PartnerSidebarContent
              userName={userName}
              pathname={pathname}
              onLogout={handleLogout}
              onCloseMobile={handleCloseMobile}
              partnerId={partnerId}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar - Fixed position, only visible on desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 w-72 h-screen flex-col border-r border-emerald-100 dark:border-emerald-900 bg-gradient-to-b from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 z-30 overflow-y-auto">
        <PartnerSidebarContent
          userName={userName}
          pathname={pathname}
          onLogout={handleLogout}
          partnerId={partnerId}
        />
      </aside>
    </>
  )
}
