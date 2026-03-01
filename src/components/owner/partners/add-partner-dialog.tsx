'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { AlertCircle } from 'lucide-react'

interface AddPartnerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  bankName: string
  accountNumber: string
  tier: string
  status: string
  commissionRate: string
}

export function AddPartnerDialog({ open, onOpenChange, onSuccess }: AddPartnerDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bankName: '',
    accountNumber: '',
    tier: 'Bronze',
    status: 'Active',
    commissionRate: '30'
  })

  const [errors, setErrors] = useState<Partial<FormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Nama wajib diisi'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password wajib diisi'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok'
    }

    // Bank validation
    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Nama bank wajib diisi'
    }

    // Account number validation
    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Nomor rekening wajib diisi'
    }

    // Commission rate validation
    const commissionRate = parseFloat(formData.commissionRate)
    if (isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100) {
      newErrors.commissionRate = 'Komisi harus antara 0-100%'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: 'Validasi Error',
        description: 'Mohon periksa kembali formulir Anda',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          bankName: formData.bankName.trim(),
          accountNumber: formData.accountNumber.trim(),
          accountOwner: formData.name.trim(),
          city: '', // Will be optional or need to add
          tier: formData.tier,
          status: formData.status,
          commissionRate: parseFloat(formData.commissionRate)
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Mitra Berhasil Dibuat!',
          description: `${formData.name} telah ditambahkan`,
          variant: 'default'
        })
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          bankName: '',
          accountNumber: '',
          tier: 'Bronze',
          status: 'Active',
          commissionRate: '30'
        })
        setErrors({})
        onOpenChange(false)
        onSuccess()
      } else {
        if (data.error?.includes('Unique constraint')) {
          throw new Error('Email sudah terdaftar')
        }
        throw new Error(data.error || 'Gagal membuat mitra')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal membuat mitra',
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
          <DialogTitle>Tambah Mitra Baru</DialogTitle>
          <DialogDescription>
            Isi formulir di bawah untuk menambahkan mitra baru
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nama */}
          <div>
            <Label htmlFor="name">
              Nama Lengkap <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nama lengkap mitra"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@contoh.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimal 6 karakter"
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">
                Konfirmasi Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Ulangi password"
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Bank */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bankName">
                Nama Bank <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bankName"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="Contoh: BCA"
                className={errors.bankName ? 'border-red-500' : ''}
              />
              {errors.bankName && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.bankName}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="accountNumber">
                Nomor Rekening <span className="text-red-500">*</span>
              </Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="Nomor rekening"
                className={errors.accountNumber ? 'border-red-500' : ''}
              />
              {errors.accountNumber && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.accountNumber}
                </p>
              )}
            </div>
          </div>

          {/* Tier & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tier">
                Tier/Badge <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.tier}
                onValueChange={(value) => setFormData({ ...formData, tier: value })}
              >
                <SelectTrigger id="tier">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bronze">Bronze</SelectItem>
                  <SelectItem value="Silver">Silver</SelectItem>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Platinum">Platinum</SelectItem>
                  <SelectItem value="Diamond">Diamond</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Komisi */}
          <div>
            <Label htmlFor="commissionRate">
              Komisi % <span className="text-red-500">*</span>
            </Label>
            <Input
              id="commissionRate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.commissionRate}
              onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
              placeholder="30"
              className={errors.commissionRate ? 'border-red-500' : ''}
            />
            {errors.commissionRate && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.commissionRate}
              </p>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Simpan Mitra'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
