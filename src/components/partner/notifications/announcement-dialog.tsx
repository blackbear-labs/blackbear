'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, ExternalLink, Bell, CheckCircle2, AlertCircle } from 'lucide-react'
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

interface AnnouncementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  announcement: Announcement | null
  partnerId: string
  onRead?: (id: string) => void
}

export function AnnouncementDialog({
  open,
  onOpenChange,
  announcement,
  partnerId,
  onRead
}: AnnouncementDialogProps) {
  const [loading, setLoading] = useState(false)

  const isExpired = announcement ? new Date(announcement.expireDate) < new Date() : false
  const isActive = announcement && !isExpired

  const handleMarkAsRead = async () => {
    if (!announcement || announcement.isRead) return

    setLoading(true)
    try {
      await fetch(`/api/partners/${partnerId}/notifications/${announcement.id}/read`, {
        method: 'PUT'
      })
      if (onRead) {
        onRead(announcement.id)
      }
    } catch (error) {
      console.error('Error marking as read:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenLink = () => {
    if (!announcement?.link) return

    handleMarkAsRead()
    window.open(announcement.link, '_blank', 'noopener,noreferrer')
  }

  useEffect(() => {
    // Auto-mark as read when opened
    if (open && announcement && !announcement.isRead) {
      handleMarkAsRead()
    }
  }, [open, announcement])

  if (!announcement) return null

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

  const daysRemaining = getDaysRemaining(announcement.expireDate)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <Bell className={cn(
                'h-5 w-5',
                isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
              )} />
              <DialogTitle className="text-xl">{announcement.title}</DialogTitle>
            </div>
            <Badge
              variant={isActive ? 'default' : 'secondary'}
              className={cn(
                'shrink-0',
                isActive
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-400'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
              )}
            >
              {isActive ? 'Aktif' : 'Kadaluarsa'}
            </Badge>
          </div>
          <DialogDescription className="mt-2">
            {announcement.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>
                <span className="font-medium">Dibuat:</span> {formatDate(announcement.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>
                <span className="font-medium">Berakhir:</span> {formatDate(announcement.expireDate)}
              </span>
            </div>
            {isActive && daysRemaining > 0 && (
              <div className="flex items-center gap-2 text-sm">
                {daysRemaining <= 3 ? (
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
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

          {/* Read Status */}
          <div className="flex items-center gap-2">
            {announcement.isRead ? (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Sudah Dibaca
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                <Bell className="mr-1 h-3 w-3" />
                Belum Dibaca
              </Badge>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {announcement.link && isActive && (
            <Button
              onClick={handleOpenLink}
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Buka Tautan
              {loading && (
                <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
