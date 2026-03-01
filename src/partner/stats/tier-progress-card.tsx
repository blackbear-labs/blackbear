'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, TrendingUp, Target, Crown } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface TierProgressCardProps {
  currentTier: string
  nextTier: string | null
  currentProfit: number
  requiredProfit: number
  badge: string
  rank: number
}

export function TierProgressCard({
  currentTier,
  nextTier,
  currentProfit,
  requiredProfit,
  badge,
  rank,
}: TierProgressCardProps) {
  const progress = nextTier ? Math.min((currentProfit / requiredProfit) * 100, 100) : 100
  const remaining = nextTier ? Math.max(0, requiredProfit - currentProfit) : 0

  const tierIcons = {
    Bronze: <Target className="w-5 h-5 text-amber-600" />,
    Silver: <TrendingUp className="w-5 h-5 text-gray-400" />,
    Gold: <Trophy className="w-5 h-5 text-yellow-500" />,
    Platinum: <Crown className="w-5 h-5 text-slate-300" />,
    Diamond: <Crown className="w-5 h-5 text-cyan-400" />,
  }

  const tierColors = {
    Bronze: 'from-amber-500 to-amber-600',
    Silver: 'from-gray-400 to-gray-500',
    Gold: 'from-yellow-500 to-yellow-600',
    Platinum: 'from-slate-300 to-slate-400',
    Diamond: 'from-cyan-400 to-cyan-500',
  }

  const tierBadgeColors = {
    Bronze: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    Silver: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    Gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    Platinum: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
    Diamond: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  }

  return (
    <Card className="border-emerald-100 dark:border-emerald-900 bg-gradient-to-br from-white to-emerald-50/50 dark:from-gray-900 dark:to-emerald-950/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-emerald-600" />
          Progress Tier & Badge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Tier Display */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl bg-gradient-to-br ${tierColors[currentTier as keyof typeof tierColors]} text-white shadow-lg`}
            >
              {tierIcons[currentTier as keyof typeof tierIcons]}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tier Saat Ini</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {currentTier}
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge
              variant="outline"
              className={`text-sm px-3 py-1 ${tierBadgeColors[currentTier as keyof typeof tierBadgeColors] || tierBadgeColors.Bronze}`}
            >
              {badge}
            </Badge>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Rank #{rank || '-'}
            </p>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Progress ke {nextTier}
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {progress.toFixed(0)}%
              </span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Rp {currentProfit.toLocaleString('id-ID')}</span>
              <span>Target: Rp {requiredProfit.toLocaleString('id-ID')}</span>
            </div>
          </div>
        )}

        {/* If Diamond tier, show achievement message */}
        {!nextTier && (
          <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800">
            <div className="flex items-center gap-2 text-cyan-800 dark:text-cyan-200">
              <Crown className="w-4 h-4" />
              <span className="font-semibold">Pencapaian Tertinggi!</span>
            </div>
            <p className="text-sm text-cyan-700 dark:text-cyan-300 mt-2">
              Selamat! Anda telah mencapai tier tertinggi dengan total profit Rp{' '}
              {currentProfit.toLocaleString('id-ID')}
            </p>
          </div>
        )}

        {/* Gap Indicator */}
        {remaining > 0 && nextTier && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">Gap Indicator</span>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
              Butuh{' '}
              <span className="font-bold text-amber-900 dark:text-amber-100">
                Rp {remaining.toLocaleString('id-ID')}
              </span>{' '}
              lagi untuk naik ke{' '}
              <span className="font-bold text-amber-900 dark:text-amber-100">
                {nextTier}
              </span>
            </p>
          </div>
        )}

        {/* Tier Rules Reference */}
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Aturan Tier (berdasarkan profit):
          </p>
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <p>🥉 Bronze: Rp 0 - 5.000.000</p>
            <p>🥈 Silver: Rp 5.000.000 - 15.000.000</p>
            <p>🥇 Gold: Rp 15.000.000 - 50.000.000</p>
            <p>💎 Platinum: Rp 50.000.000 - 100.000.000</p>
            <p>👑 Diamond: Rp 100.000.000+</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
