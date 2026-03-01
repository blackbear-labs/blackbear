'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

interface AddCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddCustomerDialog({ open, onOpenChange, onSuccess }: AddCustomerDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    bankName: '',
    accountNumber: '',
    accountOwner: '',
    city: '',
    label: 'Regular'
  })

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.whatsapp || !formData.city) {
      toast({
        title: 'Validasi Error',
        description: 'Nama, WhatsApp, dan Kota wajib diisi',
        variant: 'destructive'
      })
      return
    }

    if (!formData.whatsapp.match(/^08\d{8,11}$/)) {
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
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Customer Berhasil Dibuat!',
          description: `${formData.name} telah ditambahkan`,
          variant: 'default'
        })
        onOpenChange(false)
        // Reset form
        setFormData({
          name: '',
          whatsapp: '',
          bankName: '',
          accountNumber: '',
          accountOwner: '',
          city: '',
          label: 'Regular'
        })
        onSuccess()
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Customer Baru</DialogTitle>
          <DialogDescription>
            Isi formulir di bawah untuk menambahkan customer baru
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Nama *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nama lengkap"
            />
          </div>
          <div className="col-span-2">
            <Label>No. WA *</Label>
            <Input
              type="text"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="08xxxxxxxxxx (10-13 digit)"
            />
          </div>
          <div>
            <Label>Bank</Label>
            <Input
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              placeholder="Contoh: BCA"
            />
          </div>
          <div>
            <Label>No. Rekening</Label>
            <Input
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              placeholder="Nomor rekening"
            />
          </div>
          <div className="col-span-2">
            <Label>Nama Pemilik</Label>
            <Input
              value={formData.accountOwner}
              onChange={(e) => setFormData({ ...formData, accountOwner: e.target.value })}
              placeholder="Sesuai buku tabungan"
            />
          </div>
          <div>
            <Label>Kota *</Label>
            <Input
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Kota domisili"
            />
          </div>
          <div>
            <Label>Label</Label>
            <Select
              value={formData.label}
              onValueChange={(value) => setFormData({ ...formData, label: value })}
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
          <div className="col-span-2">
            <Button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan Customer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
