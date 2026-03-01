'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calculator } from 'lucide-react'

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

interface FeeCalculatorPreviewProps {
  paymentTypes: PaymentType[]
  transactionMethods: TransactionMethod[]
  platforms: Platform[]
}

interface FeeCalculation {
  nominal: number
  paymentType: PaymentType
  transactionMethod: TransactionMethod
  platform?: Platform
  paymentFee: number
  transactionFee: number
  platformFee: number
  netMargin: number
}

export function FeeCalculatorPreview({
  paymentTypes,
  transactionMethods,
  platforms
}: FeeCalculatorPreviewProps) {
  const calculateFee = (
    nominal: number,
    paymentType: PaymentType,
    transactionMethod: TransactionMethod,
    platform?: Platform
  ): FeeCalculation => {
    // Calculate payment fee (flat or percentage)
    let paymentFee = 0
    if (nominal < paymentType.flatFeeThreshold) {
      paymentFee = paymentType.flatFee
    } else {
      paymentFee = nominal * paymentType.percentageFee
    }

    const transactionFee = nominal * transactionMethod.feeRate
    const platformFee = platform ? nominal * platform.feeRate : 0
    const netMargin = paymentFee + transactionFee - platformFee

    return {
      nominal,
      paymentType,
      transactionMethod,
      platform,
      paymentFee,
      transactionFee,
      platformFee,
      netMargin
    }
  }

  const activePaymentType = paymentTypes.find(p => p.isActive)
  const activeTransactionMethod = transactionMethods.find(m => m.isActive)
  const activePlatform = platforms.find(p => p.isActive)

  const exampleScenarios = [500000, 2000000]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-emerald-600" />
          <CardTitle>Fee Calculation Preview</CardTitle>
        </div>
        <CardDescription>
          Preview how fees are calculated based on current settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activePaymentType && activeTransactionMethod ? (
          <div className="space-y-4">
            {exampleScenarios.map((nominal, index) => {
              const calc = calculateFee(nominal, activePaymentType, activeTransactionMethod, activePlatform)
              return (
                <div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Nominal</span>
                    <span className="text-lg font-bold">
                      Rp {nominal.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Payment Fee:</span>
                      <span className="font-medium">-Rp {calc.paymentFee.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Transaction Fee:</span>
                      <span className="font-medium">-Rp {calc.transactionFee.toLocaleString('id-ID')}</span>
                    </div>
                    {calc.platform && (
                      <div className="flex justify-between col-span-2">
                        <span className="text-gray-600 dark:text-gray-400">Platform Fee ({calc.platform.name}):</span>
                        <span className="font-medium">-Rp {calc.platformFee.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Net Margin:</span>
                      <span className={`font-bold ${calc.netMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        Rp {calc.netMargin.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Payment: {calc.paymentType.name} ({calc.paymentType.type})
                      {nominal < calc.paymentType.flatFeeThreshold
                        ? ` - Flat Fee Rp ${calc.paymentType.flatFee.toLocaleString('id-ID')}`
                        : ` - ${calc.paymentType.percentageFee * 100}%`
                      } | Method: {calc.transactionMethod.name} (+{(calc.transactionMethod.feeRate * 100).toFixed(1)}%)
                      {calc.platform && ` | Platform: ${calc.platform.name} (-${calc.platform.feeRate * 100}%)`}
                    </div>
                  </div>
                </div>
              )
            })}
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              * Examples use the first active payment type, transaction method, and platform.
              * Payment fee uses flat fee if nominal &lt; threshold, otherwise uses percentage fee.
              * Net Margin = Payment Fee + Transaction Fee - Platform Fee
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Calculator className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No active payment type or transaction method available</p>
            <p className="text-sm">Please activate at least one payment type and transaction method</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
