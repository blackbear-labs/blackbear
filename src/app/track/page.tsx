'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, Home, RefreshCw, CheckCircle2, Clock, Loader2, AlertCircle, ArrowRight, User, CreditCard, DollarSign, Copy } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { TransactionStatusBadge } from '@/components/transactions/transaction-status-badge'
import { OrderStatusStepper } from '@/components/transactions/order-status-stepper'

interface TransactionDetail {
  id: string
  nominal: number
  netMargin: number
  paymentFee: number
  codFee: number
  platformFee: number
  status: string
  createdAt: string
  customer: {
    name: string
    whatsapp: string
    city: string
    label: string
  }
  paymentType: {
    name: string
    type: string
  }
  transactionMethod: {
    name: string
  }
  platform: {
    name: string
  } | null
}

export default function TrackingPage() {
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getTotalDiterima = () => {
    if (!transaction) return 0
    const platformFee = transaction.platformFee || 0
    return transaction.nominal - transaction.paymentFee - transaction.codFee - platformFee
  }

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!searchTerm.trim()) {
      toast({
        title: 'ID Diperlukan',
        description: 'Silakan masukkan ID transaksi untuk tracking',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    setTransaction(null)
    setNotFound(false)

    try {
      const response = await fetch(`/api/transactions/${searchTerm.trim()}`)
      const data = await response.json()

      if (data.transaction) {
        setTransaction(data.transaction)
      } else {
        setNotFound(true)
        toast({
          title: 'Transaksi Tidak Ditemukan',
          description: 'ID transaksi tidak valid atau tidak ditemukan',
          variant: 'destructive'
        })
      }
    } catch (error) {
      setNotFound(true)
      toast({
        title: 'Error',
        description: 'Gagal mencari transaksi',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyId = () => {
    if (transaction) {
      navigator.clipboard.writeText(transaction.id)
      toast({
        title: 'ID Transaksi Disalin',
        description: `ID ${transaction.id} berhasil disalin ke clipboard`,
        variant: 'default'
      })
    }
  }

  if (!mounted) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
      case 'Verifikasi':
        return <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
      case 'Proses':
        return <Loader2 className="w-6 h-6 text-purple-600 dark:text-purple-400 animate-spin" />
      case 'Berhasil':
        return <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
      default:
        return <AlertCircle className="w-6 h-6 text-gray-600 dark:text-gray-400" />
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'Order Anda sedang dalam antrian dan menunggu verifikasi dari admin'
      case 'Verifikasi':
        return 'Order Anda sedang diverifikasi oleh admin'
      case 'Proses':
        return 'Order Anda sedang diproses oleh admin'
      case 'Berhasil':
        return 'Order Anda telah selesai dan dana telah ditransfer ke rekening Anda'
      default:
        return 'Status tidak diketahui'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
      case 'Verifikasi':
        return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
      case 'Proses':
        return 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800'
      case 'Berhasil':
        return 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation showOrderButton={true} />

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <Home className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Link>

          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Tracking Order
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Masukkan ID transaksi untuk melihat status dan detail order Anda
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <form onSubmit={handleSearch}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Masukkan ID transaksi..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 text-base"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 min-w-[140px]"
                  >
                    {loading ? 'Mencari...' : 'Tracking'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Result */}
          {transaction && (
            <div className="space-y-6">
              {/* Status Card */}
              <Card className={`border-2 ${getStatusColor(transaction.status)}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-white dark:bg-gray-900">
                        {getStatusIcon(transaction.status)}
                      </div>
                      <div>
                        <CardTitle className="text-2xl">
                          {transaction.status}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {getStatusMessage(transaction.status)}
                        </CardDescription>
                      </div>
                    </div>
                    <TransactionStatusBadge status={transaction.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* ID Transaksi */}
                  <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          ID Transaksi
                        </p>
                        <code className="text-lg font-mono font-bold text-gray-900 dark:text-white break-all">
                          {transaction.id}
                        </code>
                      </div>
                      <Button
                        onClick={handleCopyId}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy
                      </Button>
                    </div>
                  </div>

                  {/* Status Stepper */}
                  <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
                    <p className="text-sm font-medium mb-4 text-gray-600 dark:text-gray-400">
                      Progres Order
                    </p>
                    <OrderStatusStepper currentStatus={transaction.status} />
                  </div>
                </CardContent>
              </Card>

              {/* Detail Transaksi */}
              <Card>
                <CardHeader>
                  <CardTitle>Detail Transaksi</CardTitle>
                  <CardDescription>Informasi lengkap transaksi Anda</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Customer Info */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Informasi Customer
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Nama</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transaction.customer.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">WhatsApp</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transaction.customer.whatsapp}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Kota</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transaction.customer.city}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Label</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transaction.customer.label}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Info */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Informasi Transaksi
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Metode Pembayaran</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transaction.paymentType.name} ({transaction.paymentType.type})
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Metode Transaksi</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transaction.transactionMethod.name}
                        </p>
                      </div>
                      {transaction.platform && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Platform</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {transaction.platform.name}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tanggal Order</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(transaction.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Info */}
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-emerald-900 dark:text-emerald-100">
                      <DollarSign className="w-5 h-5" />
                      Rincian Biaya & Dana
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-emerald-200 dark:border-emerald-800">
                        <span className="text-gray-600 dark:text-gray-400">Nominal Gestun</span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          Rp {transaction.nominal.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-emerald-200 dark:border-emerald-800">
                        <span className="text-gray-600 dark:text-gray-400">Biaya Pembayaran</span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          -Rp {transaction.paymentFee.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-emerald-200 dark:border-emerald-800">
                        <span className="text-gray-600 dark:text-gray-400">Biaya Transaksi</span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          -Rp {transaction.codFee.toLocaleString('id-ID')}
                        </span>
                      </div>
                      {transaction.platformFee > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-emerald-200 dark:border-emerald-800">
                          <span className="text-gray-600 dark:text-gray-400">Biaya Platform</span>
                          <span className="font-medium text-red-600 dark:text-red-400">
                            -Rp {transaction.platformFee.toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-4 bg-white dark:bg-gray-900 rounded-lg px-4 border border-emerald-300 dark:border-emerald-700">
                        <span className="font-bold text-lg text-gray-900 dark:text-white">
                          Estimasi Diterima
                        </span>
                        <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                          Rp {getTotalDiterima().toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/order" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 gap-2">
                    <CreditCard className="w-4 h-4" />
                    Buat Order Baru
                  </Button>
                </Link>
                <Link href="/" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Home className="w-4 h-4 mr-2" />
                    Kembali ke Beranda
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Not Found State */}
          {notFound && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Transaksi Tidak Ditemukan
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-md">
                  ID transaksi yang Anda masukkan tidak valid atau tidak ditemukan di sistem kami. Silakan periksa kembali ID transaksi Anda.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setNotFound(false)}
                    variant="outline"
                  >
                    Coba Lagi
                  </Button>
                  <Link href="/">
                    <Button variant="outline">
                      Kembali ke Beranda
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Card - Shown when no search yet */}
          {!transaction && !notFound && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Cari Order Anda
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                  Masukkan ID transaksi yang Anda dapat setelah melakukan order untuk melihat status dan detail order.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
