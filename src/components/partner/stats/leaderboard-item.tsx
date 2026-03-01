'use client'

import { Badge } from '@/components/ui/badge'

interface LeaderboardItemProps {
  rank: number
  name: string
  totalProfit: number
  tier: string
  isCurrentUser?: boolean
}

export function LeaderboardItem({
  rank,
  name,
  totalProfit,
  tier,
  isCurrentUser = false,
}: LeaderboardItemProps) {
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
          text: 'text-white',
          border: 'border-yellow-300 dark:border-yellow-600',
          shadow: 'shadow-lg shadow-yellow-500/30',
        }
      case 2:
        return {
          bg: 'bg-gradient-to-r from-gray-300 to-gray-400',
          text: 'text-white',
          border: 'border-gray-300 dark:border-gray-600',
          shadow: 'shadow-md',
        }
      case 3:
        return {
          bg: 'bg-gradient-to-r from-amber-600 to-amber-700',
          text: 'text-white',
          border: 'border-amber-500 dark:border-amber-700',
          shadow: 'shadow-md',
        }
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          text: 'text-gray-900 dark:text-white',
          border: 'border-gray-200 dark:border-gray-700',
          shadow: '',
        }
    }
  }

  const tierColors = {
    Bronze: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    Silver: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    Gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    Platinum: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
    Diamond: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  }

  const rankStyle = getRankStyle(rank)
  const isTop3 = rank <= 3

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
        isCurrentUser
          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500/20'
          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:shadow-md'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Rank Badge */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${rankStyle.bg} ${rankStyle.text} ${rankStyle.shadow}`}
        >
          {isTop3 && rank === 1 ? '👑' : rank}
        </div>

        {/* Partner Info */}
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900 dark:text-white">
              {name}
            </p>
            {isCurrentUser && (
              <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300 dark:border-emerald-700">
                Anda
              </Badge>
            )}
          </div>
          <Badge
            variant="outline"
            className={`text-xs mt-1 ${tierColors[tier as keyof typeof tierColors] || tierColors.Bronze}`}
          >
            {tier}
          </Badge>
        </div>
      </div>

      {/* Profit */}
      <div className="text-right">
        <p className="font-bold text-lg text-gray-900 dark:text-white">
          Rp {totalProfit.toLocaleString('id-ID')}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Profit Bulan Ini
        </p>
      </div>
    </div>
  )
}
