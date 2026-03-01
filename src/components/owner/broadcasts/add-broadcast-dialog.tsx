'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { AlertCircle } from 'lucide-react'
import { BroadcastPreview } from './broadcast-preview'

interface AddBroadcastDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editBroadcast?: {
    id: string
    type?: string
    title: string
    description: string
    isActive: boolean
    startDate: string
    expireDate: string
  } | null
}

interface FormData {
  type: string
  title: string
  description: string
  isActive: boolean
  startDate: string
  expireDate: string
}

export function AddBroadcastDialog({
  open,
  onOpenChange,
  onSuccess,
  editBroadcast
}: AddBroadcastDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    type: 'broadcast',
    title: '',
    description: '',
    isActive: false,
    startDate: '',
    expireDate: ''
  })

  const [errors, setErrors] = useState<Partial<FormData>>({})

  useEffect(() => {
    if (editBroadcast) {
      setFormData({
        type: editBroadcast.type || 'broadcast',
        title: editBroadcast.title,
        description: editBroadcast.description,
        isActive: editBroadcast.isActive,
        startDate: new Date(editBroadcast.startDate).toISOString().split('T')[0],
        expireDate: new Date(editBroadcast.expireDate).toISOString().split('T')[0]
      })
      setShowPreview(true)
    } else {
      setFormData({
        type: 'broadcast',
        title: '',
        description: '',
        isActive: false,
        startDate: '',
        expireDate: ''
      })
      setShowPreview(false)
    }
    setErrors({})
  }, [editBroadcast, open])

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Judul broadcast wajib diisi'
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Deskripsi wajib diisi'
    }

    // Start date validation
    if (!formData.startDate) {
      newErrors.startDate = 'Tanggal mulai wajib diisi'
    }

    // Expire date validation
    if (!formData.expireDate) {
      newErrors.expireDate = 'Tanggal berakhir wajib diisi'
    } else if (formData.startDate && new Date(formData.expireDate) <= new Date(formData.startDate)) {
      newErrors.expireDate = 'Tanggal berakhir harus lebih besar dari tanggal mulai'
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
      const url = editBroadcast
        ? `/api/broadcasts/${editBroadcast.id}`
        : '/api/broadcasts'

      const response = await fetch(url, {
        method: editBroadcast ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          title: formData.title.trim(),
          description: formData.description.trim(),
          isActive: formData.isActive,
          startDate: formData.startDate,
          expireDate: formData.expireDate
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: editBroadcast ? 'Broadcast Berhasil Diupdate!' : 'Broadcast Berhasil Dibuat!',
          description: formData.title,
          variant: 'default'
        })

        // Reset form
        if (!editBroadcast) {
          setFormData({
            type: 'broadcast',
            title: '',
            description: '',
            isActive: false,
            startDate: '',
            expireDate: ''
          })
        }
        setErrors({})
        onOpenChange(false)
        onSuccess()
      } else {
        throw new Error(data.error || 'Gagal menyimpan broadcast')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menyimpan broadcast',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editBroadcast ? 'Edit Broadcast' : 'Buat Broadcast Baru'}
          </DialogTitle>
          <DialogDescription>
            {editBroadcast ? 'Update informasi broadcast' : 'Isi formulir di bawah untuk membuat broadcast baru'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">
                Jenis <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="broadcast">Broadcast</SelectItem>
                  <SelectItem value="promo">Promo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">
                Judul {formData.type === 'broadcast' ? 'Broadcast' : 'Promo'} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={formData.type === 'broadcast' ? 'Contoh: Pengumuman Maintenance' : 'Contoh: Promo Spesial Akhir Tahun'}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">
                Deskripsi <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi lengkap broadcast yang akan dikirim ke partner..."
                rows={5}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Aktifkan {formData.type === 'broadcast' ? 'Broadcast' : 'Promo'}
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              disabled={loading}
            >
              {loading ? 'Memproses...' : editBroadcast ? 'Simpan Perubahan' : 'Buat Broadcast'}
            </Button>
          </div>

          {/* Preview Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Preview</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? 'Sembunyikan' : 'Tampilkan'}
              </Button>
            </div>

            {showPreview && (
              <BroadcastPreview
                title={formData.title}
                description={formData.description}
                startDate={formData.startDate}
                expireDate={formData.expireDate}
                isActive={formData.isActive}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
