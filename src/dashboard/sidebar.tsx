'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutDashboard,
  CreditCard,
  Users,
  UserCog,
  Megaphone,
  Settings,
  BarChart3,
  Trophy,
  LogOut,
  Menu,
  ClipboardCheck
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useState, useEffect } from 'react'

interface DashboardSidebarProps {
  role: 'owner' | 'partner'
  userName?: string
  onLogout?: () => void
}

const ownerNavItems = [
  { name: 'Dashboard', href: '/owner/dashboard', icon: LayoutDashboard },
  { name: 'Transaksi', href: '/owner/dashboard/transactions', icon: CreditCard },
  { name: 'Mitra', href: '/owner/dashboard/partners', icon: Users },
  { name: 'Customer', href: '/owner/dashboard/customers', icon: UserCog },
  { name: 'Promo', href: '/owner/dashboard/promos', icon: Megaphone },
  { name: 'Broadcast', href: '/owner/dashboard/broadcasts', icon: Megaphone },
  { name: 'Platform & Fee', href: '/owner/dashboard/platforms', icon: Settings },
  { name: 'Pengaturan', href: '/owner/dashboard/settings', icon: Settings },
]

const partnerNavItems = [
  { name: 'Dashboard', href: '/partner/dashboard', icon: LayoutDashboard },
  { name: 'Transaksi', href: '/partner/dashboard/transactions', icon: CreditCard },
  { name: 'Customer', href: '/partner/dashboard/customers', icon: UserCog },
  { name: 'Leaderboard', href: '/partner/dashboard/leaderboard', icon: Trophy },
  { name: 'Pengaturan', href: '/partner/dashboard/settings', icon: Settings },
]

interface SidebarContentProps {
  role: 'owner' | 'partner'
  userName?: string
  pathname: string
  onLogout: () => void
  onCloseMobile?: () => void
}

function SidebarContent({ role, userName, pathname, onLogout, onCloseMobile }: SidebarContentProps) {
  const navItems = role === 'owner' ? ownerNavItems : partnerNavItems

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <Link href={`/${role}/dashboard`} className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
            <CreditCard className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold">Black Bear</span>
        </Link>
        {userName && (
          <p className="text-sm text-muted-foreground mt-2">
            {role === 'owner' ? 'Owner' : 'Mitra'}: {userName}
          </p>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Keluar
        </Button>
      </div>
    </div>
  )
}

export function DashboardSidebar({ role, userName, onLogout }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Use requestAnimationFrame to defer state update
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
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-background">
        <Link href={`/${role}/dashboard`} className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="font-bold">Black Bear</span>
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 border-b bg-background">
        <Link href={`/${role}/dashboard`} className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="font-bold">Black Bear</span>
        </Link>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px]">
            <SidebarContent
              role={role}
              userName={userName}
              pathname={pathname}
              onLogout={handleLogout}
              onCloseMobile={handleCloseMobile}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar - Fixed position, only visible on desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 w-64 h-screen flex-col border-r bg-background z-30">
        <SidebarContent
          role={role}
          userName={userName}
          pathname={pathname}
          onLogout={handleLogout}
        />
      </aside>
    </>
  )
}
