'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Flame } from 'lucide-react'

interface CityStat {
  city: string
  count: number
}

interface CityHeatmapProps {
  cityStats: CityStat[]
  totalCustomers: number
  selectedCity: string
  onCitySelect: (city: string) => void
}

export function CityHeatmap({
  cityStats,
  totalCustomers,
  selectedCity,
  onCitySelect
}: CityHeatmapProps) {
  const getCityColor = (count: number) => {
    if (count >= 20) return {
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-600 dark:text-red-400',
      hover: 'hover:bg-red-100 dark:hover:bg-red-950/40'
    }
    if (count >= 10) return {
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      border: 'border-orange-200 dark:border-orange-800',
      text: 'text-orange-600 dark:text-orange-400',
      hover: 'hover:bg-orange-100 dark:hover:bg-orange-950/40'
    }
    if (count >= 5) return {
      bg: 'bg-yellow-50 dark:bg-yellow-950/30',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-600 dark:text-yellow-400',
      hover: 'hover:bg-yellow-100 dark:hover:bg-yellow-950/40'
    }
    if (count >= 1) return {
      bg: 'bg-green-50 dark:bg-green-950/30',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-600 dark:text-green-400',
      hover: 'hover:bg-green-100 dark:hover:bg-green-950/40'
    }
    return {
      bg: 'bg-gray-50 dark:bg-gray-900/30',
      border: 'border-gray-200 dark:border-gray-800',
      text: 'text-gray-600 dark:text-gray-400',
      hover: 'hover:bg-gray-100 dark:hover:bg-gray-900/40'
    }
  }

  const getHeatmapLabel = (count: number) => {
    if (count >= 20) return 'Sangat Tinggi'
    if (count >= 10) return 'Tinggi'
    if (count >= 5) return 'Sedang'
    if (count >= 1) return 'Rendah'
    return 'Sangat Rendah'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <CardTitle>Heatmap Kota untuk Ekspansi</CardTitle>
          </div>
          <MapPin className="w-5 h-5 text-blue-500" />
        </div>
        <CardDescription>
          Distribusi customer berdasarkan kota. Klik untuk filter.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-200 dark:bg-red-800"></div>
              <span className="text-gray-600 dark:text-gray-400">Sangat Tinggi (20+)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-orange-200 dark:bg-orange-800"></div>
              <span className="text-gray-600 dark:text-gray-400">Tinggi (10-19)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-200 dark:bg-yellow-800"></div>
              <span className="text-gray-600 dark:text-gray-400">Sedang (5-9)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-200 dark:bg-green-800"></div>
              <span className="text-gray-600 dark:text-gray-400">Rendah (1-4)</span>
            </div>
          </div>

          {/* City Cards */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedCity === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCitySelect('all')}
              className={
                selectedCity === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  : ''
              }
            >
              Semua Kota ({totalCustomers})
            </Button>

            {cityStats.map((cityStat) => {
              const colors = getCityColor(cityStat.count)
              const isSelected = selectedCity === cityStat.city

              return (
                <Button
                  key={cityStat.city}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onCitySelect(cityStat.city)}
                  className={
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                      : ''
                  }
                  title={`Tingkat: ${getHeatmapLabel(cityStat.count)}`}
                >
                  {cityStat.city} ({cityStat.count})
                </Button>
              )
            })}
          </div>

          {cityStats.length === 0 && (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
              Belum ada data kota
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
