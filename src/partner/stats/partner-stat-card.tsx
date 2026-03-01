'use client'

import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PartnerStatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color?: 'emerald' | 'blue' | 'purple' | 'orange' | 'red' | 'cyan'
  trend?: {
    value: string
    isPositive: boolean
  }
  description?: string
}

export function PartnerStatCard({
  title,
  value,
  icon: Icon,
  color = 'emerald',
  trend,
  description,
}: PartnerStatCardProps) {
  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      trend: 'text-emerald-600',
      trendBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600 dark:text-blue-400',
      trend: 'text-blue-600',
      trendBg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-600 dark:text-purple-400',
      trend: 'text-purple-600',
      trendBg: 'bg-purple-50 dark:bg-purple-950/30',
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-600 dark:text-orange-400',
      trend: 'text-orange-600',
      trendBg: 'bg-orange-50 dark:bg-orange-950/30',
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-600 dark:text-red-400',
      trend: 'text-red-600',
      trendBg: 'bg-red-50 dark:bg-red-950/30',
    },
    cyan: {
      bg: 'bg-cyan-100 dark:bg-cyan-900/30',
      text: 'text-cyan-600 dark:text-cyan-400',
      trend: 'text-cyan-600',
      trendBg: 'bg-cyan-50 dark:bg-cyan-950/30',
    },
  }

  const colors = colorClasses[color]

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-emerald-100 dark:border-emerald-900">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {value}
            </p>

            {trend && (
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors.trendBg} ${colors.trend}`}>
                <span>{trend.value}</span>
                <span className="text-gray-500 dark:text-gray-400">vs bulan lalu</span>
              </div>
            )}

            {description && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                {description}
              </p>
            )}
          </div>

          <div className={`p-3 rounded-xl ${colors.bg} ${colors.text} group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
