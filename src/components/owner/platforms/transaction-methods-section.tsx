'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Edit, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TransactionMethod {
  id: string
  name: string
  feeRate: number
  isActive: boolean
}

interface TransactionMethodsSectionProps {
  onDataChange?: () => void
}

export function TransactionMethodsSection({ onDataChange }: TransactionMethodsSectionProps) {
  const { toast } = useToast()
  const [transactionMethods, setTransactionMethods] = useState<TransactionMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingMethod, setEditingMethod] = useState<TransactionMethod | null>(null)
  const [formData, setFormData] = useState({
    feeRate: 0,
    isActive: true
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTransactionMethods()
  }, [])

  const fetchTransactionMethods = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/transaction-methods')
      const data = await response.json()
      setTransactionMethods(data.methods || [])
    } catch (error) {
      console.error('Error fetching transaction methods:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat metode transaksi',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (method: TransactionMethod) => {
    setEditingMethod(method)
    setFormData({
      feeRate: method.feeRate,
      isActive: method.isActive
    })
    setShowEditDialog(true)
  }

  const handleSubmit = async () => {
    if (!editingMethod) return

    // Validation
    if (formData.feeRate < 0 || formData.feeRate > 100) {
      toast({
        title: 'Validasi Error',
        description: 'Fee rate harus antara 0 dan 100',
        variant: 'destructive'
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/transaction-methods/${editingMethod.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Metode Transaksi Diperbarui',
          description: 'Metode transaksi berhasil diperbarui',
          variant: 'default'
        })
        setShowEditDialog(false)
        setEditingMethod(null)
        fetchTransactionMethods()
        onDataChange?.()
      } else {
        throw new Error(data.error || 'Gagal mengupdate metode transaksi')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal mengupdate metode transaksi',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/transaction-methods/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: isActive ? 'Metode Transaksi Diaktifkan' : 'Metode Transaksi Dinonaktifkan',
          variant: 'default'
        })
        fetchTransactionMethods()
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
              <p className="text-sm text-gray-500">Memuat metode transaksi...</p>
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
          <CardTitle>Transaction Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Fee Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionMethods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex flex-col items-center text-gray-500">
                        <AlertCircle className="w-12 h-12 mb-2" />
                        <p>Belum ada metode transaksi</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactionMethods.map((method) => (
                    <TableRow key={method.id}>
                      <TableCell className="font-medium">{method.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {(method.feeRate * 100).toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={method.isActive}
                          onCheckedChange={(checked) => handleToggleActive(method.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(method)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transaction Method</DialogTitle>
            <DialogDescription>
              Edit fee rate untuk {editingMethod?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Fee Rate (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.feeRate}
                onChange={(e) => setFormData({ ...formData, feeRate: Number(e.target.value) })}
                placeholder="0 - 100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Fee tambahan untuk metode transaksi ini
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
              {submitting ? 'Menyimpan...' : 'Update'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
