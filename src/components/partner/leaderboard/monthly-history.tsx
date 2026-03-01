'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Medal, Calendar, TrendingUp, RefreshCw, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'

interface BadgeHistoryEntry {
  year: number
  month: number
  monthName: string
  rank: number | null
  badge: string
  totalProfit: number
}

interface MonthlyHistoryProps {
  partnerId: string
}

export function MonthlyHistory({ partnerId }: MonthlyHistoryProps) {
  const [badgeHistory, setBadgeHistory] = useState<BadgeHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchBadgeHistory = async () => {
    try {
      setRefreshing(true)
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
      setRefreshing(false)
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
    if (!rank) return '-'
    if (rank === 1) return '👑'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getBestMonth = () => {
    const entriesWithRank = badgeHistory.filter(h => h.rank !== null)
    if (entriesWithRank.length === 0) return null
    return entriesWithRank.reduce((best, current) => {
      if (!best.rank) return current
      if (!current.rank) return best
      return current.rank < best.rank ? current : best
    })
  }

  const bestMonth = getBestMonth()

  return (
    <div className="space-y-6">
      {/* Header Card with Stats */}
      <Card className="border-emerald-100 dark:border-emerald-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Medal className="w-5 h-5 text-emerald-600" />
                Riwayat Peringkat Bulanan
              </CardTitle>
              <CardDescription>
                6 bulan terakhir
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchBadgeHistory}
              disabled={refreshing}
              className="hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              title="Refresh riwayat"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats Summary */}
          {badgeHistory.length > 0 && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-semibold">Total Bulan</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {badgeHistory.length}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 mb-1">
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm font-semibold">Rank Terbaik</span>
                </div>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {getRankIcon(Math.min(...badgeHistory.filter(h => h.rank).map(h => h.rank!)))}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 text-purple-800 dark:text-purple-200 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-semibold">Total Profit</span>
                </div>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  Rp {badgeHistory.reduce((sum, h) => sum + h.totalProfit, 0).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Best Month Highlight */}
      {bestMonth && !loading && (
        <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <Trophy className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
                  Bulan Terbaik!
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {bestMonth.monthName} {bestMonth.year} - Rank {getRankIcon(bestMonth.rank)} dengan profit Rp {bestMonth.totalProfit.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly History List */}
      <Card className="border-emerald-100 dark:border-emerald-900">
        <CardHeader>
          <CardTitle>Timeline Peringkat</CardTitle>
          <CardDescription>
            Perkembangan peringkat Anda 6 bulan terakhir
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && badgeHistory.length === 0 ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
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
            <div className="text-center py-12">
              <Medal className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Belum ada riwayat badge
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3 pr-2">
                {badgeHistory.map((entry, index) => {
                  const isBestMonth = bestMonth && entry.year === bestMonth.year && entry.month === bestMonth.month

                  return (
                    <div
                      key={`${entry.year}-${entry.month}`}
                      className={`p-4 rounded-xl border transition-all duration-200 ${
                        index === 0
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 shadow-md'
                          : isBestMonth
                          ? 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800 shadow-md'
                          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {/* Month */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                            <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {entry.monthName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {entry.year}
                            </p>
                          </div>
                        </div>

                        {/* Rank */}
                        <div className="flex-shrink-0 px-3">
                          <p className="text-lg font-bold text-gray-900 dark:text-white text-center">
                            {getRankIcon(entry.rank)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            {entry.rank ? 'Rank' : '-'}
                          </p>
                        </div>

                        {/* Badge */}
                        <div className="flex-shrink-0 px-3">
                          <Badge
                            variant="outline"
                            className={`text-sm px-3 py-1 ${getBadgeColor(entry.badge)}`}
                          >
                            {entry.badge}
                          </Badge>
                        </div>

                        {/* Total Profit */}
                        <div className="flex-shrink-0 px-3 text-right">
                          <div className="flex items-center gap-1 justify-end">
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
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
