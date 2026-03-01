'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ExternalLink, Calendar, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Announcement {
  id: string
  type?: string
  title: string
  description: string
  link?: string | null
  expireDate: string
  isRead: boolean
  createdAt: string
}

interface AnnouncementListProps {
  announcements: Announcement[]
  partnerId: string
  onAnnouncementClick?: (announcement: Announcement) => void
  onRefresh?: () => void
  loading?: boolean
}

export function AnnouncementList({
  announcements,
  partnerId,
  onAnnouncementClick,
  onRefresh,
  loading = false
}: AnnouncementListProps) {
  const [markingAsRead, setMarkingAsRead] = useState<Set<string>>(new Set())

  const handleMarkAsRead = async (id: string) => {
    setMarkingAsRead(prev => new Set([...prev, id]))
    try {
      await fetch(`/api/partners/${partnerId}/notifications/${id}/read`, {
        method: 'PUT'
      })
      if (onRefresh) {
        onRefresh()
      }
    } catch (error) {
      console.error('Error marking as read:', error)
    } finally {
      setMarkingAsRead(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handleLinkClick = (announcement: Announcement) => {
    handleMarkAsRead(announcement.id)
    window.open(announcement.link!, '_blank', 'noopener,noreferrer')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getDaysRemaining = (expireDate: string) => {
    const now = new Date()
    const expire = new Date(expireDate)
    const diffTime = expire.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const isExpired = (expireDate: string) => new Date(expireDate) < new Date()
  const isActive = (expireDate: string) => !isExpired(expireDate)

  const unreadCount = announcements.filter(a => !a.isRead && isActive(a.expireDate)).length
  const activeCount = announcements.filter(a => isActive(a.expireDate)).length
  const expiredCount = announcements.filter(a => isExpired(a.expireDate)).length

  return (
    <Card className="border-emerald-100 dark:border-emerald-900">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                <ExternalLink className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              Daftar {announcements[0]?.type || 'Notifikasi'}
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-400">
                  {unreadCount} baru
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              {activeCount} aktif, {expiredCount} kadaluarsa
            </CardDescription>
          </div>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="shrink-0"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
              ) : (
                'Refresh'
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          {announcements.length === 0 ? (
            <div className="text-center py-12">
              <ExternalLink className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                {loading ? 'Memuat notifikasi...' : 'Tidak ada notifikasi'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((announcement) => {
                const daysRemaining = getDaysRemaining(announcement.expireDate)
                const announcementIsActive = isActive(announcement.expireDate)

                return (
                  <Card
                    key={announcement.id}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md',
                      !announcement.isRead && announcementIsActive
                        ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'border-gray-200 dark:border-gray-800'
                    )}
                    onClick={() => onAnnouncementClick && onAnnouncementClick(announcement)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {!announcement.isRead && announcementIsActive && (
                              <div className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0" />
                            )}
                            <h3 className={cn(
                              'font-semibold text-sm truncate',
                              !announcement.isRead && announcementIsActive
                                ? 'text-emerald-900 dark:text-emerald-100'
                                : 'text-gray-900 dark:text-gray-100'
                            )}>
                              {announcement.title}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                            {announcement.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{formatDate(announcement.createdAt)}</span>
                            </div>
                            {announcementIsActive && daysRemaining > 0 && (
                              <div className="flex items-center gap-1">
                                {daysRemaining <= 3 ? (
                                  <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                ) : (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                )}
                                <span className={cn(
                                  'font-medium',
                                  daysRemaining <= 3
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-emerald-600 dark:text-emerald-400'
                                )}>
                                  {daysRemaining === 1 ? 'Berakhir hari ini' : `${daysRemaining} hari lagi`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <Badge
                            variant={announcementIsActive ? 'default' : 'secondary'}
                            className={cn(
                              announcementIsActive
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-400'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
                            )}
                          >
                            {announcementIsActive ? 'Aktif' : 'Kadaluarsa'}
                          </Badge>
                          {announcement.link && announcementIsActive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleLinkClick(announcement)
                              }}
                              disabled={markingAsRead.has(announcement.id)}
                            >
                              <ExternalLink className="h-4 w-4" />
                              {markingAsRead.has(announcement.id) && (
                                <div className="ml-1 h-3 w-3 animate-spin rounded-full border border-emerald-600 border-t-transparent" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
