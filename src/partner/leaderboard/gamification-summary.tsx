'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Trophy, TrendingUp, Target, Crown, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface GamificationSummaryProps {
  partnerId: string
}

interface TierInfo {
  current: string
  next: string | null
  currentProfit: number
  requiredProfit: number
  gap: number
  badge: string
  rank: number
}

export function GamificationSummary({ partnerId }: GamificationSummaryProps) {
  const [tierInfo, setTierInfo] = useState<TierInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchTierInfo = async () => {
    try {
      setRefreshing(true)
      setError(null)

      const response = await fetch(`/api/partners/${partnerId}/stats`)
      if (!response.ok) {
        throw new Error('Gagal mengambil data tier')
      }

      const data = await response.json()
      setTierInfo(data.tier)
    } catch (err) {
      console.error('Error fetching tier info:', err)
      setError('Terjadi kesalahan saat mengambil data tier')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (partnerId) {
      fetchTierInfo()
    }
  }, [partnerId])

  const tierIcons = {
    Bronze: <Target className="w-6 h-6 text-white" />,
    Silver: <TrendingUp className="w-6 h-6 text-white" />,
    Gold: <Trophy className="w-6 h-6 text-white" />,
    Platinum: <Crown className="w-6 h-6 text-white" />,
    Diamond: <Crown className="w-6 h-6 text-white" />,
  }

  const tierGradients = {
    Bronze: 'from-amber-500 to-amber-600',
    Silver: 'from-gray-400 to-gray-500',
    Gold: 'from-yellow-500 to-yellow-600',
    Platinum: 'from-slate-400 to-slate-500',
    Diamond: 'from-cyan-400 to-cyan-500',
  }

  const tierBadgeColors = {
    Bronze: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    Silver: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    Gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    Platinum: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
    Diamond: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  }

  const progress = tierInfo?.next
    ? Math.min((tierInfo.currentProfit / tierInfo.requiredProfit) * 100, 100)
    : 100

  if (loading) {
    return (
      <Card className="border-emerald-100 dark:border-emerald-900">
        <CardHeader>
          <CardTitle>Progress Tier & Badge</CardTitle>
          <CardDescription>Lihat status tier dan badge Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error || !tierInfo) {
    return (
      <Card className="border-emerald-100 dark:border-emerald-900">
        <CardHeader>
          <CardTitle>Progress Tier & Badge</CardTitle>
          <CardDescription>Lihat status tier dan badge Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-red-600 dark:text-red-400 mb-2">
              {error || 'Gagal memuat data tier'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTierInfo}
              className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Coba Lagi
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-emerald-100 dark:border-emerald-900 bg-gradient-to-br from-white to-emerald-50/50 dark:from-gray-900 dark:to-emerald-950/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-emerald-600" />
              Progress Tier & Badge
            </CardTitle>
            <CardDescription>
              Status tier dan progress Anda saat ini
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchTierInfo}
            disabled={refreshing}
            className="hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Tier Display */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div
              className={`p-4 rounded-xl bg-gradient-to-br ${tierGradients[tierInfo.current as keyof typeof tierGradients]} text-white shadow-lg`}
            >
              {tierIcons[tierInfo.current as keyof typeof tierIcons]}
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tier Saat Ini</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {tierInfo.current}
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge
              variant="outline"
              className={`text-sm px-4 py-1.5 ${tierBadgeColors[tierInfo.current as keyof typeof tierBadgeColors] || tierBadgeColors.Bronze}`}
            >
              {tierInfo.badge}
            </Badge>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
              Rank #{tierInfo.rank || '-'}
            </p>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {tierInfo.next ? (
          <div className="space-y-3 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Progress ke <span className="font-semibold text-emerald-600 dark:text-emerald-400">{tierInfo.next}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Rp {tierInfo.currentProfit.toLocaleString('id-ID')} dari Rp {tierInfo.requiredProfit.toLocaleString('id-ID')}
                </p>
              </div>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {progress.toFixed(0)}%
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        ) : (
          /* Diamond Tier Achievement */
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-950/30 dark:to-teal-950/30 border border-cyan-200 dark:border-cyan-800">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-cyan-100 dark:bg-cyan-900/30">
                <Crown className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <p className="font-semibold text-cyan-800 dark:text-cyan-200">
                  Pencapaian Tertinggi!
                </p>
                <p className="text-sm text-cyan-700 dark:text-cyan-300 mt-1">
                  Selamat! Anda telah mencapai tier Diamond dengan total profit Rp{' '}
                  {tierInfo.currentProfit.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Gap Indicator */}
        {tierInfo.next && tierInfo.gap > 0 && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex-shrink-0 mt-0.5">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  Gap Indicator
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Butuh{' '}
                  <span className="font-bold text-amber-900 dark:text-amber-100">
                    Rp {tierInfo.gap.toLocaleString('id-ID')}
                  </span>{' '}
                  lagi untuk naik ke{' '}
                  <span className="font-bold text-amber-900 dark:text-amber-100">
                    {tierInfo.next}
                  </span>
                </p>
                <Progress value={progress} className="h-2 mt-3 bg-amber-100 dark:bg-amber-900/50" />
              </div>
            </div>
          </div>
        )}

        {/* Tier Rules Explanation */}
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Aturan Tier (berdasarkan profit bulanan)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span>🥉</span>
              <span>Bronze: Rp 0 - 5.000.000</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🥈</span>
              <span>Silver: Rp 5.000.000 - 15.000.000</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🥇</span>
              <span>Gold: Rp 15.000.000 - 50.000.000</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💎</span>
              <span>Platinum: Rp 50.000.000 - 100.000.000</span>
            </div>
            <div className="flex items-center gap-2">
              <span>👑</span>
              <span>Diamond: Rp 100.000.000+</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-semibold">📈</span>
              <span className="text-emerald-600 font-semibold">Auto-update tiap bulan</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 italic">
            Tier akan otomatis diperbarui berdasarkan total profit bulanan Anda pada akhir setiap bulan.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
