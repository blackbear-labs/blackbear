'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProfileSection } from '@/components/partner/settings/profile-section'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Settings, LayoutDashboard, CreditCard, Users, Trophy, Bell, ArrowRight, Loader2, AlertCircle } from 'lucide-react'

interface Partner {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
  tier: string
  badge: string
  commissionRate: number
  status: string
  createdAt: string
}

interface SiteConfig {
  logoUrl?: string | null
  faviconUrl?: string | null
  siteTitle?: string | null
  contactWhatsApp?: string | null
  contactInstagram?: string | null
  contactFacebook?: string | null
  maintenanceMode?: boolean
}

const quickLinks = [
  {
    name: 'Dashboard',
    href: '/partner/dashboard',
    icon: LayoutDashboard,
    description: 'Lihat statistik dan ringkasan'
  },
  {
    name: 'Input Transaksi',
    href: '/partner/dashboard/transactions',
    icon: CreditCard,
    description: 'Input transaksi baru'
  },
  {
    name: 'Kelola Customer',
    href: '/partner/dashboard/customers',
    icon: Users,
    description: 'Atur data customer'
  },
  {
    name: 'Leaderboard',
    href: '/partner/dashboard/leaderboard',
    icon: Trophy,
    description: 'Lihat peringkat global'
  },
  {
    name: 'Pengumuman',
    href: '/partner/dashboard/notifications',
    icon: Bell,
    description: 'Cek pengumuman terbaru'
  }
]

export default function PartnerSettingsPage() {
  const [partner, setPartner] = useState<Partner | null>(null)
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [partnerId, setPartnerId] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (partnerId) {
      fetchPartnerData()
      fetchSiteConfig()
    }
  }, [partnerId])

  const checkAuth = () => {
    const session = localStorage.getItem('session')
    if (!session) {
      window.location.href = '/login'
      return
    }

    const user = JSON.parse(session)
    if (user.role !== 'partner' || !user.partnerId) {
      window.location.href = '/login'
      return
    }

    setPartnerId(user.partnerId)
  }

  const fetchPartnerData = async () => {
    if (!partnerId) return

    try {
      const response = await fetch(`/api/partners/${partnerId}`)
      if (response.ok) {
        const data = await response.json()
        setPartner(data.partner)
      }
    } catch (error) {
      console.error('Error fetching partner data:', error)
      toast.error('Gagal memuat data partner')
    }
  }

  const fetchSiteConfig = async () => {
    try {
      const response = await fetch('/api/site-config')
      if (response.ok) {
        const data = await response.json()
        setSiteConfig(data.config)
      }
    } catch (error) {
      console.error('Error fetching site config:', error)
      toast.error('Gagal memuat konfigurasi website')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    if (partnerId) {
      fetchPartnerData()
      fetchSiteConfig()
    }
  }

  if (loading || !partner || !siteConfig) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>

        {/* Profile Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Pengaturan
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Kelola profil dan pengaturan akun Anda
            </p>
          </div>
        </div>
      </div>

      {/* Status Alert if Suspended */}
      {partner.status === 'Suspended' && (
        <Alert variant="destructive" className="border-red-200 dark:border-red-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Akun Anda saat ini ditangguhkan. Silakan hubungi owner untuk informasi lebih lanjut.
          </AlertDescription>
        </Alert>
      )}

      {/* Maintenance Mode Alert */}
      {siteConfig.maintenanceMode && (
        <Alert className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            Website sedang dalam mode maintenance. Beberapa fitur mungkin tidak tersedia.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Section */}
        <div className="lg:col-span-2">
          <ProfileSection
            partner={partner}
            siteConfig={siteConfig}
            onRefresh={handleRefresh}
          />
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          <Card className="border-emerald-100 dark:border-emerald-900 sticky top-24">
            <CardHeader>
              <CardTitle>Link Cepat</CardTitle>
              <CardDescription>
                Akses cepat ke halaman lain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all duration-200 group"
                  >
                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md group-hover:shadow-lg transition-shadow">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {link.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {link.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                  </Link>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
