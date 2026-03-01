'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { AlertCircle } from 'lucide-react'

interface AddPromoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editData?: {
    id: string
    title: string
    link: string
    isActive: boolean
    startDate: string
    expireDate: string
  } | null
}

interface FormData {
  title: string
  link: string
  isActive: boolean
  startDate: string
  expireDate: string
}

export function AddPromoDialog({ open, onOpenChange, onSuccess, editData }: AddPromoDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    title: editData?.title || '',
    link: editData?.link || '',
    isActive: editData?.isActive ?? false,
    startDate: editData ? new Date(editData.startDate).toISOString().split('T')[0] : '',
    expireDate: editData ? new Date(editData.expireDate).toISOString().split('T')[0] : ''
  })

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const isEditMode = !!editData

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Judul promo wajib diisi'
    }

    // Link validation
    if (!formData.link.trim()) {
      newErrors.link = 'Link wajib diisi'
    } else if (!isValidUrl(formData.link.trim())) {
      newErrors.link = 'Format URL tidak valid'
    }

    // Start date validation
    if (!formData.startDate) {
      newErrors.startDate = 'Tanggal mulai wajib diisi'
    }

    // Expire date validation
    if (!formData.expireDate) {
      newErrors.expireDate = 'Tanggal berakhir wajib diisi'
    }

    // Date comparison validation
    if (formData.startDate && formData.expireDate) {
      const startDate = new Date(formData.startDate)
      const expireDate = new Date(formData.expireDate)

      if (expireDate <= startDate) {
        newErrors.expireDate = 'Tanggal berakhir harus lebih besar dari tanggal mulai'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
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
      const endpoint = isEditMode ? `/api/promos/${editData.id}` : '/api/promos'
      const method = isEditMode ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: isEditMode ? 'Promo Berhasil Diupdate!' : 'Promo Berhasil Dibuat!',
          description: formData.title,
          variant: 'default'
        })

        // Reset form
        if (!isEditMode) {
          setFormData({
            title: '',
            link: '',
            isActive: false,
            startDate: '',
            expireDate: ''
          })
        }

        setErrors({})
        onOpenChange(false)
        onSuccess()
      } else {
        throw new Error(data.error || 'Gagal menyimpan promo')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menyimpan promo',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Reset form when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Clear errors when closing
      setErrors({})
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Promo' : 'Buat Promo Baru'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update informasi promo yang ada' : 'Isi formulir di bawah untuk membuat promo baru'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Judul Promo */}
          <div>
            <Label htmlFor="title">
              Judul Promo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: Promo Cashback Akhir Tahun"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Link Canva / GDrive */}
          <div>
            <Label htmlFor="link">
              Link Canva / GDrive <span className="text-red-500">*</span>
            </Label>
            <Input
              id="link"
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://canva.com/design/... atau https://drive.google.com/..."
              className={errors.link ? 'border-red-500' : ''}
            />
            {errors.link && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.link}
              </p>
            )}
          </div>

          {/* Status Toggle */}
          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isActive" className="text-base font-medium">
                Status Aktif
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Aktifkan promo untuk mengirim notifikasi ke partner
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>

          {/* Tanggal Mulai */}
          <div>
            <Label htmlFor="startDate">
              Tanggal Mulai <span className="text-red-500">*</span>
            </Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className={errors.startDate ? 'border-red-500' : ''}
            />
            {errors.startDate && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.startDate}
              </p>
            )}
          </div>

          {/* Tanggal Berakhir */}
          <div>
            <Label htmlFor="expireDate">
              Tanggal Berakhir <span className="text-red-500">*</span>
            </Label>
            <Input
              id="expireDate"
              type="date"
              value={formData.expireDate}
              onChange={(e) => setFormData({ ...formData, expireDate: e.target.value })}
              className={errors.expireDate ? 'border-red-500' : ''}
            />
            {errors.expireDate && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.expireDate}
              </p>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            disabled={loading}
          >
            {loading ? 'Memproses...' : isEditMode ? 'Simpan Perubahan' : 'Buat Promo'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
