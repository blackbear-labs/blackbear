'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  Phone,
  MapPin,
  CreditCard,
  DollarSign,
  Activity,
  TrendingUp,
  Edit,
  AlertCircle,
  Loader2,
  Calendar,
  Building2,
  User
} from 'lucide-react'

interface CustomerDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: any
  onRefresh: () => void
}

interface Transaction {
  id: string
  nominal: number
  paymentFee: number
  codFee: number
  platformFee: number
  netMargin: number
  partnerProfit: number
  ownerProfit: number
  status: string
  createdAt: string
  paymentType: { name: string }
  platform: { name: string } | null
  transactionMethod: { name: string }
}

export function CustomerDetailDialog({ open, onOpenChange, customer, onRefresh }: CustomerDetailDialogProps) {
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [partnerId, setPartnerId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    bankName: '',
    accountNumber: '',
    accountOwner: '',
    label: 'Regular' as 'Regular' | 'VIP',
    city: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const session = localStorage.getItem('session')
    if (session) {
      const user = JSON.parse(session)
      setPartnerId(user.partnerId)
    }
  }, [])

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        whatsapp: customer.whatsapp,
        bankName: customer.bankName || '',
        accountNumber: customer.accountNumber || '',
        accountOwner: customer.accountOwner || '',
        label: customer.label as 'Regular' | 'VIP',
        city: customer.city
      })
      setEditing(false)
      setErrors({})
    }
  }, [customer])

  useEffect(() => {
    if (customer && open) {
      fetchTransactions()
    }
  }, [customer, open])

  const fetchTransactions = async () => {
    if (!customer) return

    setTransactionsLoading(true)
    try {
      const response = await fetch(`/api/customers/${customer.id}/transactions?partnerId=${partnerId}`)
      const data = await response.json()

      if (response.ok) {
        setTransactions(data.transactions || [])
      } else {
        console.error('Failed to fetch transactions:', data.error)
        setTransactions([])
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setTransactions([])
    } finally {
      setTransactionsLoading(false)
    }
  }

  const canEdit = () => {
    return customer && customer.partnerId === partnerId
  }

  const getLabelColor = (label: string) => {
    switch (label) {
      case 'VIP':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case 'Blacklist':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nama wajib diisi'
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'No. WA wajib diisi'
    } else if (!formData.whatsapp.match(/^08\d{8,11}$/)) {
      newErrors.whatsapp = 'Format WA harus 08*** (10-13 digit)'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Kota wajib diisi'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          partnerId
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengupdate customer')
      }

      toast.success('Customer berhasil diperbarui!', {
        description: `${formData.name} telah diperbarui.`
      })

      setEditing(false)
      onRefresh()
      onOpenChange(false)
    } catch (error: any) {
      toast.error('Gagal mengupdate customer', {
        description: error.message || 'Terjadi kesalahan saat mengupdate customer'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!customer) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden border-emerald-100 dark:border-emerald-900">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Detail Customer</DialogTitle>
              <DialogDescription className="mt-1">
                Informasi lengkap dan transaksi customer
              </DialogDescription>
            </div>
            <Badge className={getLabelColor(customer.label)}>
              {customer.label}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-140px)] pr-4">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="info">Informasi</TabsTrigger>
              <TabsTrigger value="transactions">Transaksi</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-blue-50 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Total Kontribusi Profit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      Rp {customer.totalProfit.toLocaleString('id-ID')}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-emerald-50 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Total Transaksi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{customer.totalTransactions}</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-purple-50 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Total Volume
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      Rp {customer.totalVolume.toLocaleString('id-ID')}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Customer Information */}
              <Card className="border-emerald-100 dark:border-emerald-900">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Informasi Customer</CardTitle>
                    {canEdit() && !editing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditing(true)}
                        className="border-emerald-200 dark:border-emerald-800 text-emerald-600 hover:bg-emerald-50"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editing && canEdit() ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">Nama <span className="text-red-500">*</span></Label>
                        <Input
                          id="edit-name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-whatsapp">No. WA <span className="text-red-500">*</span></Label>
                        <Input
                          id="edit-whatsapp"
                          value={formData.whatsapp}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '')
                            setFormData({ ...formData, whatsapp: value })
                          }}
                          maxLength={13}
                          className={errors.whatsapp ? 'border-red-500' : ''}
                        />
                        {errors.whatsapp && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.whatsapp}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-bank">Bank</Label>
                          <Input
                            id="edit-bank"
                            value={formData.bankName}
                            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-account">No. Rekening</Label>
                          <Input
                            id="edit-account"
                            value={formData.accountNumber}
                            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-owner">Pemilik Rekening</Label>
                        <Input
                          id="edit-owner"
                          value={formData.accountOwner}
                          onChange={(e) => setFormData({ ...formData, accountOwner: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-label">Label</Label>
                          <Select
                            value={formData.label}
                            onValueChange={(value: 'Regular' | 'VIP') => setFormData({ ...formData, label: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Regular">Regular</SelectItem>
                              <SelectItem value="VIP">VIP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-city">Kota <span className="text-red-500">*</span></Label>
                          <Input
                            id="edit-city"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className={errors.city ? 'border-red-500' : ''}
                          />
                          {errors.city && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.city}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditing(false)
                            setFormData({
                              name: customer.name,
                              whatsapp: customer.whatsapp,
                              bankName: customer.bankName || '',
                              accountNumber: customer.accountNumber || '',
                              accountOwner: customer.accountOwner || '',
                              label: customer.label,
                              city: customer.city
                            })
                            setErrors({})
                          }}
                          disabled={loading}
                        >
                          Batal
                        </Button>
                        <Button
                          onClick={handleSave}
                          disabled={loading}
                          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Menyimpan...
                            </>
                          ) : (
                            'Simpan Perubahan'
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Nama</p>
                              <p className="font-medium">{customer.name}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">WhatsApp</p>
                              <p className="font-medium">{customer.whatsapp}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Kota</p>
                              <p className="font-medium">{customer.city}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Bank</p>
                              <p className="font-medium">{customer.bankName || '-'}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">No. Rekening</p>
                              <p className="font-medium">{customer.accountNumber || '-'}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Pemilik Rekening</p>
                              <p className="font-medium">{customer.accountOwner || '-'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Terdaftar sejak</p>
                            <p className="font-medium">{formatDate(customer.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              <Card className="border-emerald-100 dark:border-emerald-900">
                <CardHeader>
                  <CardTitle>Transaksi Via Saya</CardTitle>
                </CardHeader>
                <CardContent>
                  {transactionsLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Memuat transaksi...</p>
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 mb-1">Belum ada transaksi</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Belum ada transaksi yang dilakukan via partner ini
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-lg">
                                Rp {tx.nominal.toLocaleString('id-ID')}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {tx.paymentType.name} • {tx.transactionMethod.name}
                                {tx.platform && ` • ${tx.platform.name}`}
                              </p>
                            </div>
                            <Badge
                              className={
                                tx.status === 'Completed'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              }
                            >
                              {tx.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-gray-200 dark:border-gray-600">
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Partner Profit</p>
                              <p className="font-medium text-emerald-600 dark:text-emerald-400">
                                Rp {tx.partnerProfit.toLocaleString('id-ID')}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Tanggal</p>
                              <p className="font-medium">{formatDate(tx.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
