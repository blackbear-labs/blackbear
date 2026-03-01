'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Medal, Calendar, TrendingUp, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface BadgeHistoryEntry {
  year: number
  month: number
  monthName: string
  rank: number | null
  badge: string
  totalProfit: number
}

interface BadgeHistoryProps {
  partnerId: string
}

export function BadgeHistory({ partnerId }: BadgeHistoryProps) {
  const [badgeHistory, setBadgeHistory] = useState<BadgeHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBadgeHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/partners/${partnerId}/badges`)
      if (!response.ok) {
        throw new Error('Gagal mengambil riwayat badge')
      }

      const data = await response.json()
      setBadgeHistory(data.badgeHistory || [])
    } catch (err) {
      console.error('Error fetching badge history:', err)
      setError('Terjadi kesalahan saat mengambil riwayat badge')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (partnerId) {
      fetchBadgeHistory()
    }
  }, [partnerId])

  const getBadgeColor = (badge: string) => {
    const lowerBadge = badge.toLowerCase()
    if (lowerBadge.includes('diamond')) return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400'
    if (lowerBadge.includes('platinum')) return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
    if (lowerBadge.includes('gold')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    if (lowerBadge.includes('silver')) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    if (lowerBadge.includes('bronze')) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
  }

  const getRankIcon = (rank: number | null) => {
    if (!rank) return null
    if (rank === 1) return '👑'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <Card className="border-emerald-100 dark:border-emerald-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Medal className="w-5 h-5 text-emerald-600" />
              Riwayat Badge Bulanan
            </CardTitle>
            <CardDescription>
              6 bulan terakhir
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchBadgeHistory}
            disabled={loading}
            className="hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            title="Refresh riwayat"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && badgeHistory.length === 0 ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBadgeHistory}
              className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
            >
              Coba Lagi
            </Button>
          </div>
        ) : badgeHistory.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            Belum ada riwayat badge
          </p>
        ) : (
          <div className="space-y-3">
            {badgeHistory.map((entry, index) => (
              <div
                key={`${entry.year}-${entry.month}`}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  index === 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Month Indicator */}
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                        <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {entry.monthName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {entry.year}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rank */}
                  <div className="flex items-center gap-2">
                    {entry.rank && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {getRankIcon(entry.rank)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Rank</p>
                      </div>
                    )}
                  </div>

                  {/* Badge */}
                  <div className="flex-shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-sm px-3 py-1 ${getBadgeColor(entry.badge)}`}
                    >
                      {entry.badge}
                    </Badge>
                  </div>

                  {/* Total Profit */}
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        Rp {entry.totalProfit.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Total Profit
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {badgeHistory.length > 0 && !loading && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {badgeHistory.length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Bulan</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {Math.min(...badgeHistory.filter(h => h.rank).map(h => h.rank!)) || '-'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Rank Terbaik</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  Rp {badgeHistory.reduce((sum, h) => sum + h.totalProfit, 0).toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Profit 6 Bulan</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
