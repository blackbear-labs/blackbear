'use client'

import { useState, useEffect } from 'react'
import { AnnouncementList } from '@/components/partner/notifications/announcement-list'
import { AnnouncementDialog } from '@/components/partner/notifications/announcement-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, RefreshCw, Megaphone, Gift, Radio } from 'lucide-react'

type NotificationType = 'pengumuman' | 'promo' | 'broadcast'

interface Announcement {
  id: string
  type: string
  title: string
  description: string
  link?: string | null
  expireDate: string
  isRead: boolean
  createdAt: string
}

export default function PartnerNotificationsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [currentType, setCurrentType] = useState<NotificationType>('pengumuman')
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [partnerId, setPartnerId] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (partnerId) {
      fetchAnnouncements()
    }
  }, [partnerId, currentType])

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

  const fetchAnnouncements = async () => {
    if (!partnerId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/partners/${partnerId}/notifications?type=${currentType}`)
      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data.notifications || [])
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTypeChange = (type: NotificationType) => {
    setCurrentType(type)
  }

  const handleAnnouncementClick = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement)
    setDialogOpen(true)
  }

  const handleRead = (id: string) => {
    setAnnouncements(prev =>
      prev.map(a => a.id === id ? { ...a, isRead: true } : a)
    )
  }

  const isExpired = (expireDate: string) => new Date(expireDate) < new Date()
  const isActive = (expireDate: string) => !isExpired(expireDate)

  const unreadCount = announcements.filter(a => !a.isRead && isActive(a.expireDate)).length
  const activeCount = announcements.filter(a => isActive(a.expireDate)).length
  const expiredCount = announcements.filter(a => isExpired(a.expireDate)).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Pengumuman
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Lihat semua pengumuman, promo, dan broadcast dari owner
            </p>
          </div>
        </div>
      </div>

      {/* Type Tabs */}
      <Card className="border-emerald-100 dark:border-emerald-900">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <TypeTab
              type="pengumuman"
              label="Pengumuman"
              icon={<Bell className="w-4 h-4" />}
              activeType={currentType}
              onClick={handleTypeChange}
            />
            <TypeTab
              type="promo"
              label="Promo"
              icon={<Gift className="w-4 h-4" />}
              activeType={currentType}
              onClick={handleTypeChange}
            />
            <TypeTab
              type="broadcast"
              label="Broadcast"
              icon={<Radio className="w-4 h-4" />}
              activeType={currentType}
              onClick={handleTypeChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-emerald-100 dark:border-emerald-900">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total {currentType.charAt(0).toUpperCase() + currentType.slice(1)}
              </CardTitle>
              <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {announcements.length}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Semua {currentType}
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 dark:border-emerald-900">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {currentType.charAt(0).toUpperCase() + currentType.slice(1)} Aktif
              </CardTitle>
              <RefreshCw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {activeCount}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {unreadCount > 0 && `${unreadCount} belum dibaca`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 dark:border-emerald-900">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Kadaluarsa
              </CardTitle>
              <RefreshCw className="w-4 h-4 text-gray-400 dark:text-gray-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500 dark:text-gray-400">
              {expiredCount}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Sudah berakhir
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Announcement List */}
      <AnnouncementList
        announcements={announcements}
        partnerId={partnerId || ''}
        onAnnouncementClick={handleAnnouncementClick}
        onRefresh={fetchAnnouncements}
        loading={loading}
      />

      {/* Announcement Dialog */}
      <AnnouncementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        announcement={selectedAnnouncement}
        partnerId={partnerId || ''}
        onRead={handleRead}
      />
    </div>
  )
}

function TypeTab({
  type,
  label,
  icon,
  activeType,
  onClick
}: {
  type: NotificationType
  label: string
  icon: React.ReactNode
  activeType: NotificationType
  onClick: (type: NotificationType) => void
}) {
  return (
    <button
      onClick={() => onClick(type)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        activeType === type
          ? 'bg-emerald-600 text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
