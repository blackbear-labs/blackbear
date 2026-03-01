'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CustomerSelector } from './customer-selector'
import { FeeCalculator } from './fee-calculator'
import { Loader2, CreditCard, ShoppingCart, Truck, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PaymentType {
  id: string
  name: string
  type: string
  flatFeeThreshold: number
  flatFee: number
  percentageFee: number
}

interface TransactionMethod {
  id: string
  name: string
  feeRate: number
}

interface Platform {
  id: string
  name: string
  feeRate: number
}

interface Customer {
  id: string
  name: string
  whatsapp: string
  city: string
  bankName?: string | null
  accountNumber?: string | null
  accountOwner?: string | null
}

interface PartnerInfo {
  commissionRate: number
}

interface TransactionInputFormProps {
  partnerId: string
  partnerInfo: PartnerInfo | null
  onSuccess?: () => void
}

export function TransactionInputForm({ partnerId, partnerInfo, onSuccess }: TransactionInputFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Data states
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([])
  const [transactionMethods, setTransactionMethods] = useState<TransactionMethod[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [nominal, setNominal] = useState('')
  const [paymentTypeId, setPaymentTypeId] = useState('')
  const [transactionMethodId, setTransactionMethodId] = useState('')
  const [platformId, setPlatformId] = useState('')

  // Calculation state
  const [calculation, setCalculation] = useState<{
    paymentFee: number
    codFee: number
    platformFee: number
    netMargin: number
    partnerProfit: number
    ownerProfit: number
    totalDiterima: number
  } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    calculateTransaction()
  }, [nominal, paymentTypeId, transactionMethodId, platformId, paymentTypes, transactionMethods, platforms, partnerInfo])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [payments, methods, plats, customersRes] = await Promise.all([
        fetch('/api/payments').then(r => r.json()),
        fetch('/api/transaction-methods').then(r => r.json()),
        fetch('/api/platforms').then(r => r.json()),
        fetch('/api/customers').then(r => r.json())
      ])

      setPaymentTypes(payments.payments || [])
      setTransactionMethods(methods.methods || [])
      setPlatforms(plats.platforms || [])
      setCustomers(customersRes.customers || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTransaction = () => {
    const nominalValue = parseFloat(nominal) || 0
    const paymentType = paymentTypes.find(p => p.id === paymentTypeId)
    const transactionMethod = transactionMethods.find(m => m.id === transactionMethodId)
    const platform = platforms.find(p => p.id === platformId)

    if (!paymentType || !transactionMethod || nominalValue <= 0 || !partnerInfo) {
      setCalculation(null)
      return
    }

    // Calculate payment fee (flat or percentage based on threshold)
    let paymentFee = 0
    if (nominalValue < paymentType.flatFeeThreshold) {
      paymentFee = paymentType.flatFee
    } else {
      paymentFee = nominalValue * paymentType.percentageFee
    }

    const codFee = nominalValue * transactionMethod.feeRate
    const platformFee = platform ? nominalValue * platform.feeRate : 0
    const netMargin = paymentFee + codFee - platformFee

    // Use partner's commission rate from their profile
    const partnerRate = partnerInfo.commissionRate / 100
    const partnerProfit = netMargin * partnerRate
    const ownerProfit = netMargin - partnerProfit

    setCalculation({
      paymentFee,
      codFee,
      platformFee,
      netMargin,
      partnerProfit,
      ownerProfit,
      totalDiterima: nominalValue - paymentFee - codFee
    })
  }

  const handleSubmit = async () => {
    // Validation
    if (!selectedCustomerId) {
      toast({
        title: 'Validasi Error',
        description: 'Pilih customer terlebih dahulu',
        variant: 'destructive'
      })
      return
    }

    if (!nominal || !paymentTypeId || !transactionMethodId) {
      toast({
        title: 'Validasi Error',
        description: 'Isi semua field yang wajib diisi',
        variant: 'destructive'
      })
      return
    }

    const nominalValue = parseFloat(nominal)
    if (nominalValue <= 0) {
      toast({
        title: 'Validasi Error',
        description: 'Nominal harus lebih dari 0',
        variant: 'destructive'
      })
      return
    }

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId)

    setSubmitting(true)
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedCustomer?.name || '',
          whatsapp: selectedCustomer?.whatsapp || '',
          bankName: selectedCustomer?.bankName || '',
          accountNumber: selectedCustomer?.accountNumber || '',
          accountOwner: selectedCustomer?.accountOwner || '',
          city: selectedCustomer?.city || '',
          nominal: nominalValue,
          paymentTypeId,
          transactionMethodId,
          platformId: platformId || undefined, // Jika empty, kirim undefined
          partnerId
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Transaksi Berhasil!',
          description: `Profit Anda: Rp ${calculation?.partnerProfit.toLocaleString('id-ID') || 0}`,
          variant: 'default'
        })

        // Reset form
        setSelectedCustomerId('')
        setNominal('')
        setPaymentTypeId('')
        setTransactionMethodId('')
        setPlatformId('')
        setCalculation(null)

        if (onSuccess) {
          onSuccess()
        }
      } else {
        throw new Error(data.error || 'Gagal membuat transaksi')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal membuat transaksi',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const isFormValid = selectedCustomerId && nominal && paymentTypeId && transactionMethodId && calculation

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            Detail Transaksi
          </CardTitle>
          <CardDescription>
            Isi formulir di bawah untuk membuat transaksi baru
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Customer Selection */}
          <CustomerSelector
            selectedCustomerId={selectedCustomerId}
            onCustomerSelect={setSelectedCustomerId}
            onNewCustomer={(customer) => setCustomers([...customers, customer])}
            partnerId={partnerId}
          />

          {/* Nominal */}
          <div>
            <Label htmlFor="nominal">Nominal Transaksi *</Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                Rp
              </span>
              <Input
                id="nominal"
                type="number"
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                placeholder="1.000.000"
                className="pl-12 text-lg font-semibold"
                min="0"
                step="1000"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Minimal Rp 1.000
            </p>
          </div>

          {/* Payment Type */}
          <div>
            <Label htmlFor="paymentType">Jenis Pembayaran *</Label>
            <Select value={paymentTypeId} onValueChange={setPaymentTypeId}>
              <SelectTrigger id="paymentType" className="mt-2">
                <SelectValue placeholder="Pilih jenis pembayaran" />
              </SelectTrigger>
              <SelectContent>
                {paymentTypes.map((pt) => (
                  <SelectItem key={pt.id} value={pt.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{pt.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {pt.flatFeeThreshold > 0 && (
                          <>
                            &lt; Rp{pt.flatFeeThreshold.toLocaleString('id-ID')}: Rp{pt.flatFee.toLocaleString('id-ID')}
                          </>
                        )}
                        {pt.percentageFee > 0 && (
                          <>
                            {pt.flatFee > 0 && ' • '}
                            &ge; Rp{pt.flatFeeThreshold.toLocaleString('id-ID')}: {(pt.percentageFee * 100).toFixed(1)}%
                          </>
                        )}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transaction Method */}
          <div>
            <Label htmlFor="transactionMethod">Metode Transaksi *</Label>
            <Select value={transactionMethodId} onValueChange={setTransactionMethodId}>
              <SelectTrigger id="transactionMethod" className="mt-2">
                <SelectValue placeholder="Pilih metode transaksi" />
              </SelectTrigger>
              <SelectContent>
                {transactionMethods.map((tm) => (
                  <SelectItem key={tm.id} value={tm.id}>
                    <div className="flex items-center gap-2">
                      {tm.name.toLowerCase().includes('online') ? (
                        <ShoppingCart className="w-4 h-4" />
                      ) : (
                        <Truck className="w-4 h-4" />
                      )}
                      <span>{tm.name}</span>
                      <span className="text-xs text-muted-foreground">
                        (+{(tm.feeRate * 100).toFixed(0)}% fee)
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Platform */}
          <div>
            <Label htmlFor="platform">Platform (Opsional)</Label>
            <Select value={platformId} onValueChange={setPlatformId}>
              <SelectTrigger id="platform" className="mt-2">
                <SelectValue placeholder="Pilih platform (jika ada)" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-xs text-red-500">
                        -{(p.feeRate * 100).toFixed(1)}% margin
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || submitting}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-6 text-lg font-semibold mt-6"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Buat Transaksi
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Fee Calculator */}
      <FeeCalculator
        calculation={calculation}
        nominal={parseFloat(nominal) || 0}
      />
    </div>
  )
}
