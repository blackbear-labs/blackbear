'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LeaderboardItem } from './leaderboard-item'
import { Trophy, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface LeaderboardEntry {
  rank: number
  name: string
  totalProfit: number
  tier: string
}

interface LeaderboardCardProps {
  currentUserName?: string
  maxItems?: number
}

export function LeaderboardCard({ currentUserName, maxItems = 5 }: LeaderboardCardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/partners/leaderboard')
      if (!response.ok) {
        throw new Error('Gagal mengambil data leaderboard')
      }

      const data = await response.json()
      setLeaderboard(data.leaderboard || [])
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
      setError('Terjadi kesalahan saat mengambil data leaderboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()

    // Refresh leaderboard every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000)

    return () => clearInterval(interval)
  }, [])

  const displayLeaderboard = maxItems ? leaderboard.slice(0, maxItems) : leaderboard

  return (
    <Card className="border-emerald-100 dark:border-emerald-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              {maxItems ? `Leaderboard Top ${maxItems}` : 'Leaderboard Global'}
            </CardTitle>
            <CardDescription>
              Peringkat mitra berdasarkan total profit
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchLeaderboard}
            disabled={loading}
            className="hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            title="Refresh leaderboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && leaderboard.length === 0 ? (
          <div className="space-y-3">
            {[...Array(maxItems)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLeaderboard}
              className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
            >
              Coba Lagi
            </Button>
          </div>
        ) : leaderboard.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            Belum ada data leaderboard
          </p>
        ) : (
          <div className="space-y-3">
            {displayLeaderboard.map((item) => (
              <LeaderboardItem
                key={item.rank}
                {...item}
                isCurrentUser={item.name === currentUserName}
              />
            ))}
          </div>
        )}

        {/* Show current user if not in top 5 */}
        {currentUserName && leaderboard.length > 0 && !displayLeaderboard.some(item => item.name === currentUserName) && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Posisi Anda:
            </p>
            {leaderboard
              .filter(item => item.name === currentUserName)
              .map((item) => (
                <LeaderboardItem
                  key={item.rank}
                  {...item}
                  isCurrentUser={true}
                />
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
