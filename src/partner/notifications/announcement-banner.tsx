'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Bell, ExternalLink, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Announcement {
  id: string
  title: string
  description: string
  link?: string | null
  expireDate: string
  isRead: boolean
  createdAt: string
}

interface AnnouncementBannerProps {
  partnerId: string
  className?: string
}

export function AnnouncementBanner({ partnerId, className }: AnnouncementBannerProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0)

  useEffect(() => {
    fetchActiveAnnouncements()
  }, [partnerId])

  const fetchActiveAnnouncements = async () => {
    try {
      const response = await fetch(`/api/partners/${partnerId}/notifications?filter=active`)
      if (response.ok) {
        const data = await response.json()
        const unreadAnnouncements = data.notifications.filter((n: Announcement) => !n.isRead)
        setAnnouncements(unreadAnnouncements)
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]))
    if (currentAnnouncementIndex < announcements.length - 1) {
      setCurrentAnnouncementIndex(prev => prev + 1)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/partners/${partnerId}/notifications/${id}/read`, {
        method: 'PUT'
      })
      // Refresh the announcements
      fetchActiveAnnouncements()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleLinkClick = (id: string, link: string) => {
    handleMarkAsRead(id)
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  if (loading || announcements.length === 0 || dismissedIds.has(announcements[currentAnnouncementIndex]?.id)) {
    return null
  }

  const announcement = announcements[currentAnnouncementIndex]

  return (
    <Alert className={cn(
      'relative bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800',
      className
    )}>
      <Bell className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      <AlertTitle className="text-emerald-900 dark:text-emerald-100 flex items-center justify-between">
        <span>{announcement.title}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
          onClick={() => handleDismiss(announcement.id)}
        >
          <X className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        </Button>
      </AlertTitle>
      <AlertDescription className="text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-4">
        <div className="flex-1">
          <p>{announcement.description}</p>
          {announcement.link && (
            <Button
              variant="link"
              className="h-auto p-0 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 mt-1"
              onClick={() => handleLinkClick(announcement.id, announcement.link!)}
            >
              <span>Buka Tautan</span>
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
        {announcements.length > 1 && (
          <div className="flex gap-1">
            {announcements.map((_, idx) => (
              <button
                key={idx}
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-all',
                  idx === currentAnnouncementIndex
                    ? 'bg-emerald-600 dark:bg-emerald-400 w-4'
                    : 'bg-emerald-300 dark:bg-emerald-700'
                )}
                onClick={() => setCurrentAnnouncementIndex(idx)}
              />
            ))}
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}
