'use client'

import { Trophy, Medal, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'

interface LeaderboardEntry {
  rank: number
  name: string
  totalProfit: number
  tier: string
  totalTransactions?: number
}

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[]
  currentUserName?: string
  onRefresh?: () => void
}

export function LeaderboardTable({ leaderboard, currentUserName, onRefresh }: LeaderboardTableProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'text-2xl'
    if (rank === 2) return 'text-xl'
    if (rank === 3) return 'text-xl'
    return 'text-base font-semibold'
  }

  const getTierColor = (tier: string) => {
    const lowerTier = tier.toLowerCase()
    if (lowerTier.includes('diamond')) return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400'
    if (lowerTier.includes('platinum')) return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
    if (lowerTier.includes('gold')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    if (lowerTier.includes('silver')) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    if (lowerTier.includes('bronze')) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
  }

  const getRowBackground = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800'
    }
    if (rank === 1) {
      return 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800'
    }
    if (rank === 2) {
      return 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/50 dark:to-slate-900/50 border-gray-200 dark:border-gray-700'
    }
    if (rank === 3) {
      return 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-800'
    }
    return 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
  }

  // Calculate progress percentage based on rank (higher rank = higher progress)
  const getProgressPercentage = (rank: number, totalRanks: number) => {
    if (totalRanks === 0) return 0
    return ((totalRanks - rank + 1) / totalRanks) * 100
  }

  return (
    <ScrollArea className="h-[600px] rounded-lg border-0">
      <div className="space-y-3 p-1">
        {leaderboard.map((item, index) => {
          const isCurrentUser = item.name === currentUserName
          const progressPercentage = getProgressPercentage(item.rank, leaderboard.length)

          return (
            <Card
              key={item.rank}
              className={`transition-all duration-200 hover:shadow-lg ${getRowBackground(item.rank, isCurrentUser)}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-16 text-center">
                    <div className={getRankStyle(item.rank)}>
                      {getRankIcon(item.rank)}
                    </div>
                  </div>

                  {/* Partner Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                        {item.name}
                      </h3>
                      {isCurrentUser && (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2 py-0.5">
                          Anda
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge
                        variant="outline"
                        className={`text-xs px-2 py-0.5 ${getTierColor(item.tier)}`}
                      >
                        {item.tier}
                      </Badge>
                      {item.totalTransactions !== undefined && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {item.totalTransactions} transaksi
                        </span>
                      )}
                    </div>

                    {/* Profit Display */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Total Profit 30 Hari
                        </p>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          Rp {item.totalProfit.toLocaleString('id-ID')}
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex-1 max-w-[150px] ml-4">
                        <Progress
                          value={progressPercentage}
                          className="h-2"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                          {progressPercentage.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </ScrollArea>
  )
}
