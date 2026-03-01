'use client'

import { Card, CardContent } from '@/components/ui/card'
import { DollarSign, Activity, TrendingUp, Target } from 'lucide-react'

interface PartnerStats {
  totalProfit: number
  totalTransactions: number
  totalVolume: number
  pendingVolume: number
}

interface PartnerStatsCardsProps {
  stats: PartnerStats
}

export function PartnerStatsCards({ stats }: PartnerStatsCardsProps) {
  const cards = [
    {
      title: 'Total Profit',
      value: `Rp ${stats.totalProfit.toLocaleString('id-ID')}`,
      icon: DollarSign,
      color: 'emerald' as const,
      description: 'Bulan ini'
    },
    {
      title: 'Total Transaksi',
      value: stats.totalTransactions.toLocaleString(),
      icon: Activity,
      color: 'blue' as const,
      description: 'Bulan ini'
    },
    {
      title: 'Total Volume',
      value: `Rp ${stats.totalVolume.toLocaleString('id-ID')}`,
      icon: TrendingUp,
      color: 'purple' as const,
      description: 'Bulan ini'
    },
    {
      title: 'Volume Pending',
      value: `Rp ${stats.pendingVolume.toLocaleString('id-ID')}`,
      icon: Target,
      color: 'orange' as const,
      description: 'Menunggu proses'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const colorClasses = {
          emerald: {
            bg: 'bg-emerald-100 dark:bg-emerald-900/30',
            text: 'text-emerald-600 dark:text-emerald-400'
          },
          blue: {
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            text: 'text-blue-600 dark:text-blue-400'
          },
          purple: {
            bg: 'bg-purple-100 dark:bg-purple-900/30',
            text: 'text-purple-600 dark:text-purple-400'
          },
          orange: {
            bg: 'bg-orange-100 dark:bg-orange-900/30',
            text: 'text-orange-600 dark:text-orange-400'
          }
        }

        const colors = colorClasses[card.color]

        return (
          <Card
            key={index}
            className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-emerald-100 dark:border-emerald-900"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {card.value}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {card.description}
                  </p>
                </div>

                <div
                  className={`p-3 rounded-xl ${colors.bg} ${colors.text} group-hover:scale-110 transition-transform`}
                >
                  <card.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
