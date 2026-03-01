'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  DollarSign,
  Activity,
  TrendingUp,
  Plus,
  Search,
  UserPlus,
  Calculator,
  AlertCircle,
  Eye,
  ArrowRight,
  Clock,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Copy
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { TransactionDetailDialog } from '@/components/transactions/transaction-detail-dialog'
import { TransactionStatusBadge } from '@/components/transactions/transaction-status-badge'
import { OrderStatusStepper } from '@/components/transactions/order-status-stepper'

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

interface Partner {
  id: string
  name: string
  commissionRate: number
  tier: string
}

interface Customer {
  id: string
  name: string
  whatsapp: string
  city: string
  label: string
  bankName?: string | null
  accountNumber?: string | null
  accountOwner?: string | null
}

interface Transaction {
  id: string
  nominal: number
  netMargin: number
  partnerProfit: number
  ownerProfit: number
  status: string
  createdAt: string
  customer: { name: string }
  partner: { name: string } | null
  paymentType: { name: string }
  platform: { name: string } | null
  transactionMethod: { name: string }
}

export default function OwnerTransactionsPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  // Data states
  const [customers, setCustomers] = useState<Customer[]>([])
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([])
  const [transactionMethods, setTransactionMethods] = useState<TransactionMethod[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Transaction Detail Dialog
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Status Update Dialog
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Stats
  const [stats, setStats] = useState({
    totalProfit: 0,
    totalTransactions: 0,
    totalVolume: 0
  })

  // Form state
  const [showNewTransaction, setShowNewTransaction] = useState(false)
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Customer
    customerId: '',
    newCustomerName: '',
    newCustomerWa: '',
    newCustomerBank: '',
    newCustomerRekening: '',
    newCustomerPemilik: '',
    newCustomerKota: '',
    newCustomerLabel: 'Regular',
    // Transaction
    nominal: '',
    paymentTypeId: '',
    transactionMethodId: '',
    platformId: '',
    partnerId: ''
  })

  // Calculation
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
    setMounted(true)
    fetchData()
  }, [])

  useEffect(() => {
    calculateTransaction()
  }, [formData, paymentTypes, transactionMethods, platforms, partners])

  const fetchData = async () => {
    try {
      const [customersRes, payments, methods, plats, partnersRes, transactionsRes, statsRes] = await Promise.all([
        fetch('/api/customers').then(r => r.json()),
        fetch('/api/payments').then(r => r.json()),
        fetch('/api/transaction-methods').then(r => r.json()),
        fetch('/api/platforms').then(r => r.json()),
        fetch('/api/partners').then(r => r.json()),
        fetch('/api/transactions/list').then(r => r.json()),
        fetch('/api/stats').then(r => r.json())
      ])

      setCustomers(customersRes.customers || [])
      setPaymentTypes(payments.payments || [])
      setTransactionMethods(methods.methods || [])
      setPlatforms(plats.platforms || [])
      setPartners(partnersRes.partners || [])
      setTransactions(transactionsRes.transactions || [])
      setStats(statsRes.stats || { totalProfit: 0, totalTransactions: 0, totalVolume: 0 })
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const calculateTransaction = () => {
    const nominal = parseFloat(formData.nominal) || 0
    const paymentType = paymentTypes.find(p => p.id === formData.paymentTypeId)
    const transactionMethod = transactionMethods.find(m => m.id === formData.transactionMethodId)
    const platform = platforms.find(p => p.id === formData.platformId)
    const partner = partners.find(p => p.id === formData.partnerId)

    if (!paymentType || !transactionMethod || nominal <= 0) {
      setCalculation(null)
      return
    }

    // Calculate payment fee (flat or percentage)
    let paymentFee = 0
    if (nominal < paymentType.flatFeeThreshold) {
      paymentFee = paymentType.flatFee
    } else {
      paymentFee = nominal * paymentType.percentageFee
    }

    const codFee = nominal * transactionMethod.feeRate
    const platformFee = platform ? nominal * platform.feeRate : 0
    const netMargin = paymentFee + codFee - platformFee
    const partnerRate = partner ? partner.commissionRate / 100 : 0
    const partnerProfit = netMargin * partnerRate
    const ownerProfit = netMargin - partnerProfit

    setCalculation({
      paymentFee,
      codFee,
      platformFee,
      netMargin,
      partnerProfit,
      ownerProfit,
      totalDiterima: nominal - paymentFee - codFee
    })
  }

  const handleCreateCustomer = async () => {
    // Validation
    if (!formData.newCustomerName || !formData.newCustomerWa || !formData.newCustomerKota) {
      toast({
        title: 'Validasi Error',
        description: 'Nama, WhatsApp, dan Kota wajib diisi',
        variant: 'destructive'
      })
      return
    }

    if (!formData.newCustomerWa.match(/^08\d{8,11}$/)) {
      toast({
        title: 'Format WhatsApp Salah',
        description: 'WhatsApp harus dimulai dengan 08 dan 10-13 digit',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.newCustomerName,
          whatsapp: formData.newCustomerWa,
          bankName: formData.newCustomerBank || null,
          accountNumber: formData.newCustomerRekening || null,
          accountOwner: formData.newCustomerPemilik || null,
          city: formData.newCustomerKota,
          label: formData.newCustomerLabel
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Customer Berhasil Dibuat!',
          variant: 'default'
        })
        setShowNewCustomer(false)
        // Reset form
        setFormData({
          ...formData,
          newCustomerName: '',
          newCustomerWa: '',
          newCustomerBank: '',
          newCustomerRekening: '',
          newCustomerPemilik: '',
          newCustomerKota: '',
          newCustomerLabel: 'Regular'
        })
        fetchData()
      } else {
        throw new Error(data.error || 'Gagal membuat customer')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal membuat customer',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitTransaction = async () => {
    // Validation
    if (!formData.nominal || !formData.paymentTypeId || !formData.transactionMethodId) {
      toast({
        title: 'Validasi Error',
        description: 'Nominal, Payment Type, dan Metode Transaksi wajib diisi',
        variant: 'destructive'
      })
      return
    }

    if (!formData.customerId && !formData.newCustomerName) {
      toast({
        title: 'Validasi Error',
        description: 'Pilih customer atau buat customer baru',
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
          name: formData.newCustomerName || '',
          whatsapp: formData.newCustomerWa || '',
          bankName: formData.newCustomerBank || '',
          accountNumber: formData.newCustomerRekening || '',
          accountOwner: formData.newCustomerPemilik || '',
          city: formData.newCustomerKota || '',
          nominal: parseFloat(formData.nominal),
          paymentTypeId: formData.paymentTypeId,
          transactionMethodId: formData.transactionMethodId,
          platformId: formData.platformId || undefined, // Jika empty, kirim undefined
          partnerId: formData.partnerId || undefined // Jika empty, kirim undefined
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Transaksi Berhasil!',
          description: `Profit: Rp ${data.transaction.partnerProfit?.toLocaleString('id-ID') || data.transaction.ownerProfit?.toLocaleString('id-ID') || 0}`,
          variant: 'default'
        })
        setShowNewTransaction(false)
        // Reset form
        setFormData({
          customerId: '',
          newCustomerName: '',
          newCustomerWa: '',
          newCustomerBank: '',
          newCustomerRekening: '',
          newCustomerPemilik: '',
          newCustomerKota: '',
          newCustomerLabel: 'Regular',
          nominal: '',
          paymentTypeId: '',
          transactionMethodId: '',
          platformId: '',
          partnerId: ''
        })
        setCalculation(null)
        fetchData()
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
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch =
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.paymentType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.transactionMethod.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Compute status stats
  const statusStats = {
    pending: transactions.filter(t => t.status === 'Pending').length,
    verifikasi: transactions.filter(t => t.status === 'Verifikasi').length,
    proses: transactions.filter(t => t.status === 'Proses').length,
    berhasil: transactions.filter(t => t.status === 'Berhasil').length
  }

  const handleUpdateStatus = async () => {
    if (!selectedTransaction || !newStatus) return

    setUpdatingStatus(true)
    try {
      const response = await fetch(`/api/transactions/${selectedTransaction.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Status Berhasil Diupdate!',
          description: data.message,
          variant: 'default'
        })
        setShowUpdateDialog(false)
        setNewStatus('')
        fetchData()
      } else {
        throw new Error(data.error || 'Gagal mengupdate status')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal mengupdate status',
        variant: 'destructive'
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const openUpdateDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setNewStatus(transaction.status)
    setShowUpdateDialog(true)
  }

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id)
    toast({
      title: 'ID Transaksi Disalin',
      description: `ID ${id} berhasil disalin ke clipboard`,
      variant: 'default'
    })
  }

  const handleViewDetail = async (transactionId: string) => {
    setLoadingDetail(true)
    try {
      const response = await fetch(`/api/transactions/${transactionId}`)
      const data = await response.json()

      if (data.transaction) {
        setSelectedTransaction(data.transaction)
        setShowDetailDialog(true)
      } else {
        toast({
          title: 'Error',
          description: 'Gagal mengambil detail transaksi',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error fetching transaction detail:', error)
      toast({
        title: 'Error',
        description: 'Gagal mengambil detail transaksi',
        variant: 'destructive'
      })
    } finally {
      setLoadingDetail(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manajemen Transaksi
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola semua transaksi dan input transaksi baru
          </p>
        </div>
        <Dialog open={showNewTransaction} onOpenChange={setShowNewTransaction}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Input Transaksi Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Input Transaksi Baru</DialogTitle>
              <DialogDescription>
                Isi formulir di bawah untuk membuat transaksi baru
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Customer Selection */}
              <div>
                <Label>Customer</Label>
                <div className="flex gap-2 mt-2">
                  <Select
                    value={formData.customerId}
                    onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih customer atau buat baru" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} - {c.whatsapp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={showNewCustomer} onOpenChange={setShowNewCustomer}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <UserPlus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Tambah Customer Baru</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Nama *</Label>
                          <Input
                            value={formData.newCustomerName}
                            onChange={(e) => setFormData({ ...formData, newCustomerName: e.target.value })}
                            placeholder="Nama lengkap"
                          />
                        </div>
                        <div>
                          <Label>No. WhatsApp *</Label>
                          <Input
                            value={formData.newCustomerWa}
                            onChange={(e) => setFormData({ ...formData, newCustomerWa: e.target.value })}
                            placeholder="08xxxxxxxxxx"
                          />
                        </div>
                        <div>
                          <Label>Bank</Label>
                          <Input
                            value={formData.newCustomerBank}
                            onChange={(e) => setFormData({ ...formData, newCustomerBank: e.target.value })}
                            placeholder="Contoh: BCA"
                          />
                        </div>
                        <div>
                          <Label>No. Rekening</Label>
                          <Input
                            value={formData.newCustomerRekening}
                            onChange={(e) => setFormData({ ...formData, newCustomerRekening: e.target.value })}
                            placeholder="Nomor rekening"
                          />
                        </div>
                        <div>
                          <Label>Nama Pemilik</Label>
                          <Input
                            value={formData.newCustomerPemilik}
                            onChange={(e) => setFormData({ ...formData, newCustomerPemilik: e.target.value })}
                            placeholder="Sesuai buku tabungan"
                          />
                        </div>
                        <div>
                          <Label>Kota *</Label>
                          <Input
                            value={formData.newCustomerKota}
                            onChange={(e) => setFormData({ ...formData, newCustomerKota: e.target.value })}
                            placeholder="Kota domisili"
                          />
                        </div>
                        <div>
                          <Label>Label</Label>
                          <Select
                            value={formData.newCustomerLabel}
                            onValueChange={(value) => setFormData({ ...formData, newCustomerLabel: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Regular">Regular</SelectItem>
                              <SelectItem value="VIP">VIP</SelectItem>
                              <SelectItem value="Blacklist">Blacklist</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          onClick={handleCreateCustomer} 
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                          disabled={loading}
                        >
                          {loading ? 'Menyimpan...' : 'Simpan Customer'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Nominal */}
              <div>
                <Label>Nominal Transaksi *</Label>
                <Input
                  type="number"
                  value={formData.nominal}
                  onChange={(e) => setFormData({ ...formData, nominal: e.target.value })}
                  placeholder="Contoh: 1500000"
                />
              </div>

              {/* Payment Type */}
              <div>
                <Label>Payment Type *</Label>
                <Select
                  value={formData.paymentTypeId}
                  onValueChange={(value) => setFormData({ ...formData, paymentTypeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentTypes.map((pt) => (
                      <SelectItem key={pt.id} value={pt.id}>
                        {pt.name} ({pt.type})
                        <span className="text-xs text-gray-500 ml-2">
                          {pt.flatFeeThreshold > 0 && `< Rp${pt.flatFeeThreshold.toLocaleString('id-ID')}: Rp${pt.flatFee.toLocaleString('id-ID')}`}
                          {pt.percentageFee > 0 && `>= Rp${pt.flatFeeThreshold.toLocaleString('id-ID')}: ${pt.percentageFee * 100}%`}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Transaction Method */}
              <div>
                <Label>Metode Transaksi *</Label>
                <Select
                  value={formData.transactionMethodId}
                  onValueChange={(value) => setFormData({ ...formData, transactionMethodId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih metode transaksi" />
                  </SelectTrigger>
                  <SelectContent>
                    {transactionMethods.map((tm) => (
                      <SelectItem key={tm.id} value={tm.id}>
                        {tm.name} (+{(tm.feeRate * 100).toFixed(0)}% fee)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Platform */}
              <div>
                <Label>Platform (Opsional)</Label>
                <Select
                  value={formData.platformId}
                  onValueChange={(value) => setFormData({ ...formData, platformId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} (-{p.feeRate * 100}% margin)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Partner */}
              <div>
                <Label>Mitra (Opsional)</Label>
                <Select
                  value={formData.partnerId}
                  onValueChange={(value) => setFormData({ ...formData, partnerId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih mitra atau tanpa mitra" />
                  </SelectTrigger>
                  <SelectContent>
                    {partners.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.tier}) - Komisi {p.commissionRate}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Calculation Display */}
              {calculation && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <Calculator className="w-5 h-5 text-emerald-600" />
                    Kalkulasi
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Payment Fee: <span className="font-semibold">-Rp {calculation.paymentFee.toLocaleString('id-ID')}</span></div>
                    <div>Transaction Fee: <span className="font-semibold">-Rp {calculation.codFee.toLocaleString('id-ID')}</span></div>
                    <div>Platform Fee: <span className="font-semibold">-Rp {calculation.platformFee.toLocaleString('id-ID')}</span></div>
                    <div>Net Margin: <span className="font-semibold text-emerald-600">Rp {calculation.netMargin.toLocaleString('id-ID')}</span></div>
                    {formData.partnerId && (
                      <>
                        <div>Partner Profit: <span className="font-semibold text-blue-600">Rp {calculation.partnerProfit.toLocaleString('id-ID')}</span></div>
                        <div>Owner Profit: <span className="font-semibold text-purple-600">Rp {calculation.ownerProfit.toLocaleString('id-ID')}</span></div>
                      </>
                    )}
                  </div>
                  <div className="pt-2 border-t">
                    Total Diterima: <span className="font-bold text-lg text-emerald-600">Rp {calculation.totalDiterima.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleSubmitTransaction} 
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Buat Transaksi'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Profit</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  Rp {stats.totalProfit.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Transaksi</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats.totalTransactions}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Volume</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  Rp {stats.totalVolume.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Order Berhasil</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {statusStats.berhasil}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pending</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {statusStats.pending}
                </p>
              </div>
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Verifikasi</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {statusStats.verifikasi}
                </p>
              </div>
              <Search className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Proses</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {statusStats.proses}
                </p>
              </div>
              <Loader2 className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Berhasil</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {statusStats.berhasil}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="transactions">Daftar Transaksi</TabsTrigger>
          <TabsTrigger value="margin">Margin Payment</TabsTrigger>
          <TabsTrigger value="platform">Platform Fee</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle>Daftar Transaksi</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Cari ID, nama, atau tipe..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Verifikasi">Verifikasi</SelectItem>
                      <SelectItem value="Proses">Proses</SelectItem>
                      <SelectItem value="Berhasil">Berhasil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">
                      {searchTerm || statusFilter !== 'all'
                        ? 'Tidak ada transaksi yang cocok dengan filter'
                        : 'Belum ada transaksi'}
                    </p>
                  </div>
                ) : (
                  filteredTransactions.map((tx) => (
                    <div key={tx.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded flex items-center gap-2">
                                <span>ID: {tx.id}</span>
                                <button
                                  onClick={() => handleCopyId(tx.id)}
                                  className="hover:text-primary transition-colors"
                                  title="Copy ID"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </span>
                              <p className="font-semibold text-gray-900 dark:text-white">{tx.customer.name}</p>
                              <TransactionStatusBadge status={tx.status} />
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <span>{tx.paymentType.name}</span>
                              <span>•</span>
                              <span>{tx.transactionMethod.name}</span>
                              {tx.platform && (
                                <>
                                  <span>•</span>
                                  <span>{tx.platform.name}</span>
                                </>
                              )}
                              <span>•</span>
                              <span>{new Date(tx.createdAt).toLocaleDateString('id-ID')}</span>
                            </div>
                            {tx.partner && (
                              <Badge variant="outline" className="mt-2">
                                {tx.partner.name}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                              Rp {tx.nominal.toLocaleString('id-ID')}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Profit: Rp {tx.netMargin.toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t lg:mt-0 lg:pt-0 lg:border-t-0 lg:border-l lg:pl-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetail(tx.id)}
                          disabled={loadingDetail}
                          className="gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Detail
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openUpdateDialog(tx)}
                          className="gap-1 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
                        >
                          <ArrowRight className="w-4 h-4" />
                          Update Status
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="margin">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Types (CC & Paylater)</CardTitle>
                <CardDescription>Fee structure untuk setiap payment type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {paymentTypes.map((pt) => (
                    <div key={pt.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">{pt.name}</p>
                        <Badge variant="outline">{pt.type}</Badge>
                      </div>
                      <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                        <p>Threshold: Rp {pt.flatFeeThreshold.toLocaleString('id-ID')}</p>
                        <p>Flat Fee: Rp {pt.flatFee.toLocaleString('id-ID')}</p>
                        <p>Percentage Fee: {(pt.percentageFee * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Methods</CardTitle>
                <CardDescription>Fee untuk metode transaksi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {transactionMethods.map((tm) => (
                    <div key={tm.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <p className="font-semibold">{tm.name}</p>
                      <Badge variant="secondary">+{(tm.feeRate * 100).toFixed(0)}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="platform">
          <Card>
            <CardHeader>
              <CardTitle>Platform Fee (Margin Reduction)</CardTitle>
              <CardDescription>Pengurangan margin dari setiap marketplace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {platforms.map((p) => (
                  <div key={p.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-red-600 font-semibold mt-2">
                      -{(p.feeRate * 100).toFixed(1)}% margin
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle>Forecast & Prediksi (30 Hari)</CardTitle>
              <CardDescription>Estimasi berdasarkan data historis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 border rounded-lg bg-blue-50 dark:bg-blue-950/30 hover:shadow-lg transition-shadow">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Estimasi Profit</p>
                  <p className="text-2xl font-bold text-blue-600">
                    Rp {(stats.totalProfit * 1.2).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">+20% dari bulan ini</p>
                </div>
                <div className="p-6 border rounded-lg bg-emerald-50 dark:bg-emerald-950/30 hover:shadow-lg transition-shadow">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Estimasi Volume</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    Rp {(stats.totalVolume * 1.25).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">+25% dari bulan ini</p>
                </div>
                <div className="p-6 border rounded-lg bg-purple-50 dark:bg-purple-950/30 hover:shadow-lg transition-shadow">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Estimasi Transaksi</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.ceil(stats.totalTransactions * 1.3)}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">+30% dari bulan ini</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Detail Dialog */}
      <TransactionDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        transaction={selectedTransaction}
        role="owner"
      />

      {/* Update Status Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Status Order</DialogTitle>
            <DialogDescription>
              Ubah status order untuk {selectedTransaction?.customer.name}
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold text-lg">{selectedTransaction.customer.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedTransaction.paymentType.name} - {selectedTransaction.transactionMethod.name}
                    </p>
                  </div>
                  <p className="font-bold text-lg text-emerald-600">
                    Rp {selectedTransaction.nominal.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <OrderStatusStepper currentStatus={selectedTransaction.status} />
                </div>
              </div>

              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Pilih Status Baru</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="Verifikasi">
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-blue-500" />
                        Verifikasi
                      </div>
                    </SelectItem>
                    <SelectItem value="Proses">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-purple-500" />
                        Proses
                      </div>
                    </SelectItem>
                    <SelectItem value="Berhasil">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Berhasil
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newStatus && newStatus !== selectedTransaction.status && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                  <strong>Info:</strong> Status akan diubah dari <span className="font-semibold mx-1">{selectedTransaction.status}</span> ke <span className="font-semibold mx-1">{newStatus}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowUpdateDialog(false)}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus || newStatus === selectedTransaction.status}
                  className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
                >
                  {updatingStatus ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Memproses...
                    </>
                  ) : (
                    'Update Status'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
