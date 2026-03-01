'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PaymentTypesSection } from '@/components/owner/platforms/payment-types-section'
import { TransactionMethodsSection } from '@/components/owner/platforms/transaction-methods-section'
import { PlatformsSection } from '@/components/owner/platforms/platforms-section'
import { FeeCalculatorPreview } from '@/components/owner/platforms/fee-calculator-preview'
import { CreditCard, ShoppingBag, Truck, Calculator as CalculatorIcon } from 'lucide-react'

interface PaymentType {
  id: string
  name: string
  type: string
  flatFeeThreshold: number
  flatFee: number
  percentageFee: number
  isActive: boolean
}

interface TransactionMethod {
  id: string
  name: string
  feeRate: number
  isActive: boolean
}

interface Platform {
  id: string
  name: string
  feeRate: number
  isActive: boolean
}

export default function OwnerPlatformsPage() {
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([])
  const [transactionMethods, setTransactionMethods] = useState<TransactionMethod[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])

  const fetchData = async () => {
    try {
      const [paymentsRes, methodsRes, platformsRes] = await Promise.all([
        fetch('/api/payments?includeInactive=true').then(r => r.json()),
        fetch('/api/transaction-methods').then(r => r.json()),
        fetch('/api/platforms').then(r => r.json())
      ])

      setPaymentTypes(paymentsRes.payments || [])
      setTransactionMethods(methodsRes.methods || [])
      setPlatforms(platformsRes.platforms || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Platform & Fee Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola tipe pembayaran, metode transaksi, dan platform marketplace
          </p>
        </div>
      </div>

      {/* Fee Calculator Preview */}
      <FeeCalculatorPreview
        paymentTypes={paymentTypes}
        transactionMethods={transactionMethods}
        platforms={platforms}
      />

      {/* Main Content Tabs */}
      <Tabs defaultValue="payment-types" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payment-types" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span className="hidden sm:inline">Payment Types</span>
            <span className="sm:hidden">Payments</span>
          </TabsTrigger>
          <TabsTrigger value="transaction-methods" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span className="hidden sm:inline">Transaction Methods</span>
            <span className="sm:hidden">Methods</span>
          </TabsTrigger>
          <TabsTrigger value="platforms" className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Platforms
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payment-types">
          <PaymentTypesSection onDataChange={fetchData} />
        </TabsContent>

        <TabsContent value="transaction-methods">
          <TransactionMethodsSection onDataChange={fetchData} />
        </TabsContent>

        <TabsContent value="platforms">
          <PlatformsSection onDataChange={fetchData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
