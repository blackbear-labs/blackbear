'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PaymentType {
  id: string
  name: string
  type: string
  flatFeeThreshold: number
  flatFee: number
  percentageFee: number
  isActive: boolean
}

interface PaymentTypesSectionProps {
  onDataChange?: () => void
}

export function PaymentTypesSection({ onDataChange }: PaymentTypesSectionProps) {
  const { toast } = useToast()
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingPayment, setEditingPayment] = useState<PaymentType | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'CC',
    flatFeeThreshold: 1000000,
    flatFee: 0,
    percentageFee: 0,
    isActive: true
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPaymentTypes()
  }, [])

  const fetchPaymentTypes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/payments?includeInactive=true')
      const data = await response.json()
      setPaymentTypes(data.payments || [])
    } catch (error) {
      console.error('Error fetching payment types:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat tipe pembayaran',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'CC',
      flatFeeThreshold: 1000000,
      flatFee: 0,
      percentageFee: 0,
      isActive: true
    })
    setEditingPayment(null)
  }

  const handleAdd = () => {
    resetForm()
    setShowAddDialog(true)
  }

  const handleEdit = (payment: PaymentType) => {
    setEditingPayment(payment)
    setFormData({
      name: payment.name,
      type: payment.type,
      flatFeeThreshold: payment.flatFeeThreshold,
      flatFee: payment.flatFee,
      percentageFee: payment.percentageFee,
      isActive: payment.isActive
    })
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: 'Validasi Error',
        description: 'Nama tipe pembayaran wajib diisi',
        variant: 'destructive'
      })
      return
    }

    if (formData.flatFee < 0) {
      toast({
        title: 'Validasi Error',
        description: 'Flat fee harus >= 0',
        variant: 'destructive'
      })
      return
    }

    if (formData.percentageFee < 0 || formData.percentageFee > 100) {
      toast({
        title: 'Validasi Error',
        description: 'Persentase fee harus antara 0 dan 100',
        variant: 'destructive'
      })
      return
    }

    setSubmitting(true)
    try {
      const url = editingPayment ? `/api/payments/${editingPayment.id}` : '/api/payments'
      const method = editingPayment ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: editingPayment ? 'Tipe Pembayaran Diperbarui' : 'Tipe Pembayaran Dibuat',
          description: editingPayment
            ? 'Tipe pembayaran berhasil diperbarui'
            : 'Tipe pembayaran baru berhasil dibuat',
          variant: 'default'
        })
        setShowAddDialog(false)
        resetForm()
        fetchPaymentTypes()
        onDataChange?.()
      } else {
        throw new Error(data.error || 'Gagal menyimpan tipe pembayaran')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menyimpan tipe pembayaran',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tipe pembayaran ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Tipe Pembayaran Dihapus',
          description: 'Tipe pembayaran berhasil dihapus',
          variant: 'default'
        })
        fetchPaymentTypes()
        onDataChange?.()
      } else {
        throw new Error(data.error || 'Gagal menghapus tipe pembayaran')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menghapus tipe pembayaran',
        variant: 'destructive'
      })
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: isActive ? 'Tipe Pembayaran Diaktifkan' : 'Tipe Pembayaran Dinonaktifkan',
          variant: 'default'
        })
        fetchPaymentTypes()
        onDataChange?.()
      } else {
        throw new Error(data.error || 'Gagal mengubah status')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal mengubah status',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Memuat tipe pembayaran...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Payment Types (CC/Paylater)</CardTitle>
            <Button
              onClick={handleAdd}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Payment Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Flat Fee</TableHead>
                  <TableHead>Percentage Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center text-gray-500">
                        <AlertCircle className="w-12 h-12 mb-2" />
                        <p>Belum ada tipe pembayaran</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paymentTypes.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.type}</Badge>
                      </TableCell>
                      <TableCell>
                        Rp {payment.flatFeeThreshold.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>Rp {payment.flatFee.toLocaleString('id-ID')}</TableCell>
                      <TableCell>{(payment.percentageFee * 100).toFixed(1)}%</TableCell>
                      <TableCell>
                        <Switch
                          checked={payment.isActive}
                          onCheckedChange={(checked) => handleToggleActive(payment.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(payment)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(payment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAddDialog || !!editingPayment} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false)
          setEditingPayment(null)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPayment ? 'Edit Payment Type' : 'Tambah Payment Type Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingPayment
                ? 'Edit informasi tipe pembayaran'
                : 'Isi formulir di bawah untuk membuat tipe pembayaran baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nama *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: BCA CC"
              />
            </div>
            <div>
              <Label>Tipe *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CC">CC (Credit Card)</SelectItem>
                  <SelectItem value="Paylater">Paylater</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Flat Fee Threshold (Rp)</Label>
              <Input
                type="number"
                value={formData.flatFeeThreshold}
                onChange={(e) => setFormData({ ...formData, flatFeeThreshold: Number(e.target.value) })}
                placeholder="Default: 1000000"
              />
              <p className="text-xs text-gray-500 mt-1">
                Transaksi di bawah nominal ini menggunakan flat fee
              </p>
            </div>
            <div>
              <Label>Flat Fee (Rp)</Label>
              <Input
                type="number"
                min="0"
                value={formData.flatFee}
                onChange={(e) => setFormData({ ...formData, flatFee: Number(e.target.value) })}
                placeholder="Default: 0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Fee untuk transaksi di bawah threshold
              </p>
            </div>
            <div>
              <Label>Percentage Fee (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.percentageFee}
                onChange={(e) => setFormData({ ...formData, percentageFee: Number(e.target.value) })}
                placeholder="Default: 0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Fee persentase untuk transaksi di atas threshold
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Label>Status Aktif</Label>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
            <Button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              disabled={submitting}
            >
              {submitting ? 'Menyimpan...' : editingPayment ? 'Update' : 'Buat Payment Type'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
