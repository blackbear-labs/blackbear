'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calculator, TrendingUp, DollarSign, Wallet } from 'lucide-react'

interface FeeCalculatorProps {
  calculation: {
    paymentFee: number
    codFee: number
    platformFee: number
    netMargin: number
    partnerProfit: number
    ownerProfit: number
    totalDiterima: number
  } | null
  nominal: number
}

export function FeeCalculator({ calculation, nominal }: FeeCalculatorProps) {
  if (!calculation) {
    return (
      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="w-5 h-5 text-gray-400" />
            Kalkulasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Isi nominal dan pilih payment type & metode transaksi untuk melihat kalkulasi
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-emerald-200 dark:border-emerald-900 shadow-md">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="w-5 h-5 text-emerald-600" />
          Kalkulasi Transaksi
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {/* Nominal */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
          <span className="text-sm text-gray-600 dark:text-gray-400">Nominal Transaksi</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            Rp {nominal.toLocaleString('id-ID')}
          </span>
        </div>

        {/* Fees */}
        <div className="space-y-2 pb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-gray-600 dark:text-gray-400">Payment Fee</span>
            <span className="font-medium text-red-600 dark:text-red-400">
              -Rp {calculation.paymentFee.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-gray-600 dark:text-gray-400">Online/COD Fee</span>
            <span className="font-medium text-red-600 dark:text-red-400">
              -Rp {calculation.codFee.toLocaleString('id-ID')}
            </span>
          </div>
          {calculation.platformFee > 0 && (
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-gray-600 dark:text-gray-400">Platform Fee</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                -Rp {calculation.platformFee.toLocaleString('id-ID')}
              </span>
            </div>
          )}
        </div>

        {/* Net Margin */}
        <div className="flex items-center justify-between py-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg px-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Net Margin</span>
          </div>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            Rp {calculation.netMargin.toLocaleString('id-ID')}
          </span>
        </div>

        {/* Profits */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-900 dark:text-blue-100">Profit Anda</span>
            </div>
            <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
              Rp {calculation.partnerProfit.toLocaleString('id-ID')}
            </span>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              {((calculation.partnerProfit / calculation.netMargin) * 100).toFixed(1)}%
            </p>
          </div>

          <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-900 dark:text-purple-100">Owner Profit</span>
            </div>
            <span className="font-bold text-purple-600 dark:text-purple-400 text-lg">
              Rp {calculation.ownerProfit.toLocaleString('id-ID')}
            </span>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
              {((calculation.ownerProfit / calculation.netMargin) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Total Diterima */}
        <div className="pt-3 border-t-2 border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Diterima Customer
            </span>
            <span className="font-bold text-xl text-emerald-600 dark:text-emerald-400">
              Rp {calculation.totalDiterima.toLocaleString('id-ID')}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
            Nominal - Payment Fee - Online/COD Fee
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
