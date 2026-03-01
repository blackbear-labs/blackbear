'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { AlertCircle, Loader2 } from 'lucide-react'

interface EditCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: any
  onSuccess: () => void
}

export function EditCustomerDialog({ open, onOpenChange, customer, onSuccess }: EditCustomerDialogProps) {
  const [loading, setLoading] = useState(false)
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
  const [partnerId, setPartnerId] = useState<string | null>(null)

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
    }
  }, [customer])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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

      setErrors({})
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error('Gagal mengupdate customer', {
        description: error.message || 'Terjadi kesalahan saat mengupdate customer'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-emerald-100 dark:border-emerald-900">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Customer</DialogTitle>
          <DialogDescription>
            Perbarui informasi customer di bawah ini.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nama <span className="text-red-500">*</span></Label>
            <Input
              id="edit-name"
              placeholder="Nama lengkap customer"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'border-red-500' : 'border-emerald-200 dark:border-emerald-800'}
            />
            {errors.name && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </p>
            )}
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="edit-whatsapp">No. WA <span className="text-red-500">*</span></Label>
            <Input
              id="edit-whatsapp"
              placeholder="08xxxxxxxxxx"
              value={formData.whatsapp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '')
                setFormData({ ...formData, whatsapp: value })
              }}
              maxLength={13}
              className={errors.whatsapp ? 'border-red-500' : 'border-emerald-200 dark:border-emerald-800'}
            />
            {errors.whatsapp && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.whatsapp}
              </p>
            )}
          </div>

          {/* Bank */}
          <div className="space-y-2">
            <Label htmlFor="edit-bank">Bank</Label>
            <Input
              id="edit-bank"
              placeholder="Nama bank (opsional)"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              className="border-emerald-200 dark:border-emerald-800"
            />
          </div>

          {/* No Rekening */}
          <div className="space-y-2">
            <Label htmlFor="edit-account">No Rekening</Label>
            <Input
              id="edit-account"
              placeholder="Nomor rekening (opsional)"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              className="border-emerald-200 dark:border-emerald-800"
            />
          </div>

          {/* Pemilik Rekening */}
          <div className="space-y-2">
            <Label htmlFor="edit-owner">Pemilik Rekening</Label>
            <Input
              id="edit-owner"
              placeholder="Nama pemilik rekening (opsional)"
              value={formData.accountOwner}
              onChange={(e) => setFormData({ ...formData, accountOwner: e.target.value })}
              className="border-emerald-200 dark:border-emerald-800"
            />
          </div>

          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="edit-label">Label</Label>
            <Select
              value={formData.label}
              onValueChange={(value: 'Regular' | 'VIP') => setFormData({ ...formData, label: value })}
            >
              <SelectTrigger className="border-emerald-200 dark:border-emerald-800">
                <SelectValue placeholder="Pilih label" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Regular">Regular</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Kota */}
          <div className="space-y-2">
            <Label htmlFor="edit-city">Kota <span className="text-red-500">*</span></Label>
            <Input
              id="edit-city"
              placeholder="Kota customer"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className={errors.city ? 'border-red-500' : 'border-emerald-200 dark:border-emerald-800'}
            />
            {errors.city && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.city}
              </p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              disabled={loading}
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
