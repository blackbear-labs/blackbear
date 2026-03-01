'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, MapPin, DollarSign, Edit, Trash2, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface CustomerCardProps {
  id: string
  name: string
  whatsapp: string
  city: string
  label: 'VIP' | 'Regular' | 'Blacklist'
  totalTransactions: number
  totalProfit: number
  totalVolume: number
}

export function PartnerCustomerCard({
  id,
  name,
  whatsapp,
  city,
  label,
  totalTransactions,
  totalProfit,
  totalVolume,
}: CustomerCardProps) {
  const labelConfig = {
    VIP: {
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      icon: '⭐',
    },
    Regular: {
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      icon: '👤',
    },
    Blacklist: {
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      icon: '⚠️',
    },
  }

  const config = labelConfig[label]

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-emerald-100 dark:border-emerald-900">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{name}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={config.color}>
                <span className="mr-1">{config.icon}</span>
                {label}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-blue-50 dark:hover:bg-blue-950/30"
              asChild
            >
              <Link href={`/partner/dashboard/customers/${id}/edit`}>
                <Edit className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contact Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Phone className="w-4 h-4" />
            <span>{whatsapp}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>{city}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {totalTransactions}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Transaksi</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              Rp {(totalProfit / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Profit</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              Rp {(totalVolume / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Volume</p>
          </div>
        </div>

        {/* Action Button */}
        <Button
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          size="sm"
          asChild
        >
          <Link href={`/partner/dashboard/customers/${id}`}>
            Lihat Detail
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
