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
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Platform {
  id: string
  name: string
  feeRate: number
  isActive: boolean
}

interface PlatformsSectionProps {
  onDataChange?: () => void
}

export function PlatformsSection({ onDataChange }: PlatformsSectionProps) {
  const { toast } = useToast()
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    feeRate: 0,
    isActive: true
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPlatforms()
  }, [])

  const fetchPlatforms = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/platforms')
      const data = await response.json()
      setPlatforms(data.platforms || [])
    } catch (error) {
      console.error('Error fetching platforms:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat platform',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      feeRate: 0,
      isActive: true
    })
    setEditingPlatform(null)
  }

  const handleAdd = () => {
    resetForm()
    setShowAddDialog(true)
  }

  const handleEdit = (platform: Platform) => {
    setEditingPlatform(platform)
    setFormData({
      name: platform.name,
      feeRate: platform.feeRate,
      isActive: platform.isActive
    })
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: 'Validasi Error',
        description: 'Nama platform wajib diisi',
        variant: 'destructive'
      })
      return
    }

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
      const url = editingPlatform ? `/api/platforms/${editingPlatform.id}` : '/api/platforms'
      const method = editingPlatform ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: editingPlatform ? 'Platform Diperbarui' : 'Platform Dibuat',
          description: editingPlatform
            ? 'Platform berhasil diperbarui'
            : 'Platform baru berhasil dibuat',
          variant: 'default'
        })
        setShowAddDialog(false)
        resetForm()
        fetchPlatforms()
        onDataChange?.()
      } else {
        throw new Error(data.error || 'Gagal menyimpan platform')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menyimpan platform',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus platform ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/platforms/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Platform Dihapus',
          description: 'Platform berhasil dihapus',
          variant: 'default'
        })
        fetchPlatforms()
        onDataChange?.()
      } else {
        throw new Error(data.error || 'Gagal menghapus platform')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menghapus platform',
        variant: 'destructive'
      })
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/platforms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: isActive ? 'Platform Diaktifkan' : 'Platform Dinonaktifkan',
          variant: 'default'
        })
        fetchPlatforms()
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
              <p className="text-sm text-gray-500">Memuat platform...</p>
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
            <CardTitle>Platforms</CardTitle>
            <Button
              onClick={handleAdd}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Platform
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Fee Rate (Margin Reduction)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {platforms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex flex-col items-center text-gray-500">
                        <AlertCircle className="w-12 h-12 mb-2" />
                        <p>Belum ada platform</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  platforms.map((platform) => (
                    <TableRow key={platform.id}>
                      <TableCell className="font-medium">{platform.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          -{(platform.feeRate * 100).toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={platform.isActive}
                          onCheckedChange={(checked) => handleToggleActive(platform.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(platform)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(platform.id)}
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

      <Dialog open={showAddDialog || !!editingPlatform} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false)
          setEditingPlatform(null)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPlatform ? 'Edit Platform' : 'Tambah Platform Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingPlatform
                ? 'Edit informasi platform'
                : 'Isi formulir di bawah untuk membuat platform baru'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nama *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Shopee"
              />
            </div>
            <div>
              <Label>Fee Rate (%) - Margin Reduction</Label>
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
                Persentase pengurangan margin dari platform ini
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
              {submitting ? 'Menyimpan...' : editingPlatform ? 'Update' : 'Buat Platform'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
