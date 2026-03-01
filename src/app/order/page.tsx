'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreditCard, Calculator, ArrowRight, CheckCircle2, Home, Copy, RefreshCw, Search } from 'lucide-react'
import Link from 'next/link'
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

export default function OrderPage() {
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    bankName: '',
    accountNumber: '',
    accountOwner: '',
    city: '',
    nominal: '',
    paymentTypeId: '',
    transactionMethodId: '',
    platformId: ''
  })

  // Dropdown data
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([])
  const [transactionMethods, setTransactionMethods] = useState<TransactionMethod[]>([])
  const [loading, setLoading] = useState(false)
  const [calculations, setCalculations] = useState<{
    paymentFee: number
    codFee: number
    totalDiterima: number
  } | null>(null)
  
  // Success state
  const [showSuccess, setShowSuccess] = useState(false)
  const [transactionId, setTransactionId] = useState('')
  const [transactionNominal, setTransactionNominal] = useState(0)
  const [transactionPaymentFee, setTransactionPaymentFee] = useState(0)
  const [transactionCodFee, setTransactionCodFee] = useState(0)
  const [transactionTotalReceived, setTransactionTotalReceived] = useState(0)

  useEffect(() => {
    setMounted(true)
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [paymentsRes, methodsRes] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/transaction-methods')
      ])

      const paymentsData = await paymentsRes.json()
      const methodsData = await methodsRes.json()

      setPaymentTypes(paymentsData.payments || [])
      setTransactionMethods(methodsData.methods || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data',
        variant: 'destructive'
      })
    }
  }

  const calculateFees = () => {
    const nominal = parseFloat(formData.nominal) || 0
    const paymentType = paymentTypes.find(p => p.id === formData.paymentTypeId)
    const transactionMethod = transactionMethods.find(m => m.id === formData.transactionMethodId)

    if (!paymentType || !transactionMethod || nominal <= 0) {
      setCalculations(null)
      return
    }

    let paymentFee = 0
    if (nominal < paymentType.flatFeeThreshold) {
      paymentFee = paymentType.flatFee
    } else {
      paymentFee = nominal * paymentType.percentageFee
    }

    const codFee = nominal * transactionMethod.feeRate
    const totalDiterima = nominal - paymentFee - codFee

    setCalculations({
      paymentFee,
      codFee,
      totalDiterima
    })
  }

  useEffect(() => {
    calculateFees()
  }, [formData.nominal, formData.paymentTypeId, formData.transactionMethodId, paymentTypes, transactionMethods])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.whatsapp || !formData.nominal || !formData.paymentTypeId || !formData.transactionMethodId) {
      toast({
        title: 'Validasi Error',
        description: 'Mohon lengkapi semua field wajib',
        variant: 'destructive'
      })
      return
    }

    // Validate WhatsApp
    if (!formData.whatsapp.match(/^08\d{8,11}$/)) {
      toast({
        title: 'Format WhatsApp Salah',
        description: 'WhatsApp harus dimulai dengan 08 dan 10-13 digit',
        variant: 'destructive'
      })
      return
    }

    // Validate nominal
    const nominal = parseFloat(formData.nominal)
    if (nominal <= 0) {
      toast({
        title: 'Nominal Invalid',
        description: 'Nominal harus lebih dari 0',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          nominal,
          partnerId: null // From landing page, no partner
        })
      })

      const data = await response.json()

      if (data.success) {
        // Save transaction data for success page
        setTransactionId(data.transaction.id)
        setTransactionNominal(nominal)
        setTransactionPaymentFee(calculations?.paymentFee || 0)
        setTransactionCodFee(calculations?.codFee || 0)
        setTransactionTotalReceived(calculations?.totalDiterima || 0)

        // Show success page
        setShowSuccess(true)

        toast({
          title: 'Order Berhasil!',
          description: 'Order Anda telah berhasil dibuat',
          variant: 'default'
        })

        // Reset form
        setFormData({
          name: '',
          whatsapp: '',
          bankName: '',
          accountNumber: '',
          accountOwner: '',
          city: '',
          nominal: '',
          paymentTypeId: '',
          transactionMethodId: '',
          platformId: ''
        })
        setCalculations(null)
      } else {
        throw new Error(data.error || 'Gagal membuat order')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal membuat order',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(transactionId)
    toast({
      title: 'ID Transaksi Disalin',
      description: 'ID transaksi berhasil disalin ke clipboard',
      variant: 'default'
    })
  }

  const handleNewOrder = () => {
    setShowSuccess(false)
    setTransactionId('')
    setTransactionNominal(0)
    setTransactionPaymentFee(0)
    setTransactionCodFee(0)
    setTransactionTotalReceived(0)
  }

  if (!mounted) return null

  // Show Success Page
  if (showSuccess) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation showOrderButton={false} />

        <main className="flex-1 py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            {/* Breadcrumb */}
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
              <Home className="w-4 h-4 mr-2" />
              Kembali ke Beranda
            </Link>

            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                Order Berhasil!
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Terima kasih telah melakukan order gestun. Simpan ID transaksi Anda untuk tracking status order.
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Detail Order</CardTitle>
                <CardDescription>Informasi lengkap order Anda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Transaction ID */}
                <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl border-2 border-emerald-200 dark:border-emerald-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2">
                        ID Transaksi
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="text-lg md:text-xl font-mono font-bold text-emerald-900 dark:text-emerald-100 bg-white dark:bg-gray-900 px-4 py-2 rounded-lg border border-emerald-300 dark:border-emerald-700">
                          {transactionId}
                        </code>
                      </div>
                    </div>
                    <Button
                      onClick={handleCopyId}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="hidden sm:inline">Copy ID</span>
                      <span className="sm:hidden">Copy</span>
                    </Button>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Nominal Gestun</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      Rp {transactionNominal.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Estimasi Diterima</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      Rp {transactionTotalReceived.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                {/* Fee Breakdown */}
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-3">Rincian Biaya</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-700 dark:text-amber-300">Biaya Pembayaran</span>
                      <span className="text-amber-900 dark:text-amber-100 font-medium">
                        -Rp {transactionPaymentFee.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-700 dark:text-amber-300">Biaya Transaksi</span>
                      <span className="text-amber-900 dark:text-amber-100 font-medium">
                        -Rp {transactionCodFee.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-amber-300 dark:border-amber-700">
                      <span className="text-amber-900 dark:text-amber-100 font-semibold">Total Potongan</span>
                      <span className="text-amber-900 dark:text-amber-100 font-bold">
                        -Rp {(transactionPaymentFee + transactionCodFee).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tracking Info */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Informasi Tracking
                  </h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                      <span>Gunakan ID transaksi di atas untuk melacak status order Anda</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                      <span>Status akan diperbarui: Pending → Verifikasi → Proses → Berhasil</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                      <span>Simpan ID transaksi dengan baik untuk referensi</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/track" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto gap-2">
                  <Search className="w-4 h-4" />
                  Lacak Order
                </Button>
              </Link>
              <Button
                onClick={handleNewOrder}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              >
                Buat Order Baru
              </Button>
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  Kembali ke Beranda
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation showOrderButton={false} />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <Home className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Link>

          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Form Order Gestun
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Isi form di bawah ini untuk melakukan order gestun. Proses cepat dan aman.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informasi Customer</CardTitle>
                    <CardDescription>Data pribadi untuk proses transaksi</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nama Lengkap *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Masukkan nama lengkap"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="whatsapp">No. WhatsApp *</Label>
                      <Input
                        id="whatsapp"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        placeholder="08xxxxxxxxxx"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Format: 08*** (10-13 digit)
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="bankName">Nama Bank (Opsional)</Label>
                      <Input
                        id="bankName"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        placeholder="Contoh: BCA, Mandiri, BNI"
                      />
                    </div>

                    <div>
                      <Label htmlFor="accountNumber">No. Rekening (Opsional)</Label>
                      <Input
                        id="accountNumber"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        placeholder="Nomor rekening"
                      />
                    </div>

                    <div>
                      <Label htmlFor="accountOwner">Nama Pemilik Rekening (Opsional)</Label>
                      <Input
                        id="accountOwner"
                        value={formData.accountOwner}
                        onChange={(e) => setFormData({ ...formData, accountOwner: e.target.value })}
                        placeholder="Sesuai buku tabungan"
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">Kota *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Kota domisili"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Transaction Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Detail Transaksi</CardTitle>
                    <CardDescription>Informasi nominal dan metode pembayaran</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="nominal">Nominal Gestun *</Label>
                      <Input
                        id="nominal"
                        type="number"
                        value={formData.nominal}
                        onChange={(e) => setFormData({ ...formData, nominal: e.target.value })}
                        placeholder="Contoh: 1000000"
                        required
                        min="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="paymentType">Metode Pembayaran *</Label>
                      <Select
                        value={formData.paymentTypeId}
                        onValueChange={(value) => setFormData({ ...formData, paymentTypeId: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih metode pembayaran" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentTypes.map((payment) => (
                            <SelectItem key={payment.id} value={payment.id}>
                              {payment.name} ({payment.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="transactionMethod">Metode Transaksi *</Label>
                      <Select
                        value={formData.transactionMethodId}
                        onValueChange={(value) => setFormData({ ...formData, transactionMethodId: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih metode transaksi" />
                        </SelectTrigger>
                        <SelectContent>
                          {transactionMethods.map((method) => (
                            <SelectItem key={method.id} value={method.id}>
                              {method.name} (+{(method.feeRate * 100).toFixed(0)}% fee)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Calculation */}
              <div className="space-y-6">
                <Card className="sticky top-20">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calculator className="w-5 h-5 mr-2" />
                      Kalkulasi
                    </CardTitle>
                    <CardDescription>Estimasi biaya dan dana diterima</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {calculations ? (
                      <>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm text-muted-foreground">Nominal Gestun</span>
                            <span className="font-semibold">
                              Rp {parseFloat(formData.nominal).toLocaleString('id-ID')}
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm text-muted-foreground">Biaya Pembayaran</span>
                            <span className="font-semibold text-red-600">
                              -Rp {calculations.paymentFee.toLocaleString('id-ID')}
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-sm text-muted-foreground">Biaya Transaksi</span>
                            <span className="font-semibold text-red-600">
                              -Rp {calculations.codFee.toLocaleString('id-ID')}
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-4 bg-muted/50 rounded-lg px-4">
                            <span className="font-semibold">Total Diterima</span>
                            <span className="text-xl font-bold text-emerald-600">
                              Rp {calculations.totalDiterima.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 mt-4">
                          <p className="text-xs text-blue-800 dark:text-blue-200">
                            <strong>Catatan:</strong> Biaya ongkir marketplace dan layanan tambahan tidak termasuk dalam kalkulasi.
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">
                          Masukkan nominal dan pilih metode pembayaran untuk melihat kalkulasi
                        </p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                      disabled={loading || !calculations}
                    >
                      {loading ? 'Memproses...' : 'Order Sekarang'}
                      {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
