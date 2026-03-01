'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, TrendingUp, Target, Crown } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface TierProgressProps {
  currentTier: string
  nextTier: string
  currentProfit: number
  requiredProfit: number
  badge: string
  rank: number
}

export function TierProgress({
  currentTier,
  nextTier,
  currentProfit,
  requiredProfit,
  badge,
  rank,
}: TierProgressProps) {
  const progress = Math.min((currentProfit / requiredProfit) * 100, 100)
  const remaining = Math.max(0, requiredProfit - currentProfit)

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
            <div className={`p-3 rounded-xl bg-gradient-to-br ${tierColors[currentTier as keyof typeof tierColors]} text-white shadow-lg`}>
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
            <Badge variant="outline" className="text-sm px-3 py-1">
              {badge}
            </Badge>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Rank #{rank}
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

        {/* Gap Indicator */}
        {remaining > 0 && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <TrendingUp className="w-4 h-4" />
              <span className="font-semibold">Gap Indicator</span>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
              Butuh <span className="font-bold text-amber-900 dark:text-amber-100">
                Rp {remaining.toLocaleString('id-ID')}
              </span> lagi untuk naik ke{' '}
              <span className="font-bold text-amber-900 dark:text-amber-100">
                {nextTier}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
