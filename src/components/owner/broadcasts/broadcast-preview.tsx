'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Bell } from 'lucide-react'

interface BroadcastPreviewProps {
  title: string
  description: string
  startDate: string
  expireDate: string
  isActive: boolean
}

export function BroadcastPreview({
  title,
  description,
  startDate,
  expireDate,
  isActive
}: BroadcastPreviewProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with Badge */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {title || 'Judul Broadcast'}
              </h3>
            </div>
            <Badge
              className={
                isActive
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
              }
            >
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Deskripsi
            </p>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                {description || 'Deskripsi broadcast akan muncul di sini...'}
              </p>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Periode Aktif
            </p>
            <div className="flex items-center gap-4 bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div className="text-sm">
                  <p className="text-gray-500 dark:text-gray-400">Mulai</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {startDate ? formatDate(startDate) : '-'}
                  </p>
                </div>
              </div>
              <div className="text-gray-400">→</div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div className="text-sm">
                  <p className="text-gray-500 dark:text-gray-400">Berakhir</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {expireDate ? formatDate(expireDate) : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Note */}
          <p className="text-xs text-gray-400 dark:text-gray-500 italic">
            Ini adalah tampilan preview yang akan dilihat oleh partner
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
