'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Megaphone, Bell, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { AddPromoDialog } from '@/components/owner/promos/add-promo-dialog'
import { PromoTable } from '@/components/owner/promos/promo-table'

interface Promo {
  id: string
  title: string
  link: string
  isActive: boolean
  startDate: string
  expireDate: string
  createdAt: string
}

export default function PromosManagementPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [promos, setPromos] = useState<Promo[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [promoToDelete, setPromoToDelete] = useState<Promo | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchPromos()
  }, [])

  const fetchPromos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/promos')
      const data = await response.json()
      setPromos(data.promos || [])
    } catch (error) {
      console.error('Error fetching promos:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data promo',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (promo: Promo) => {
    const newStatus = !promo.isActive

    try {
      const response = await fetch(`/api/promos/${promo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus })
      })

      const data = await response.json()

      if (data.success) {
        // Show push notification toast
        if (newStatus) {
          // Promo activated - show notification about partners being notified
          toast({
            title: (
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-500" />
                <span>Promo Diaktifkan & Notifikasi Terkirim!</span>
              </div>
            ),
            description: (
              <div className="mt-2">
                <p className="font-medium">{promo.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Notifikasi telah dikirim ke semua partner tentang promo baru ini
                </p>
              </div>
            ),
            variant: 'default',
          })
        } else {
          // Promo deactivated - show notification about promo ending
          toast({
            title: (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Promo Dinonaktifkan!</span>
              </div>
            ),
            description: (
              <div className="mt-2">
                <p className="font-medium">{promo.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Notifikasi telah dikirim ke partner bahwa promo telah berakhir
                </p>
              </div>
            ),
            variant: 'default',
          })
        }

        fetchPromos()
      } else {
        throw new Error(data.error || 'Gagal update status')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal update status',
        variant: 'destructive'
      })
    }
  }

  const handleEditClick = (promo: Promo) => {
    setSelectedPromo(promo)
    setShowEditDialog(true)
  }

  const handleDeleteClick = (promo: Promo) => {
    setPromoToDelete(promo)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!promoToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/promos/${promoToDelete.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Promo Berhasil Dihapus!</span>
            </div>
          ),
          description: promoToDelete.title,
          variant: 'default',
        })
        setShowDeleteDialog(false)
        setPromoToDelete(null)
        fetchPromos()
      } else {
        throw new Error(data.error || 'Gagal menghapus promo')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menghapus promo',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
    }
  }

  // Stats calculations
  const totalPromos = promos.length
  const activePromos = promos.filter(p => p.isActive).length
  const inactivePromos = promos.filter(p => !p.isActive).length
  const expiringSoon = promos.filter(p => {
    if (!p.isActive) return false
    const now = new Date()
    const expireDate = new Date(p.expireDate)
    const diffTime = expireDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 && diffDays <= 7
  }).length

  if (!mounted) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manajemen Promo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola semua promo materi dan kirim notifikasi ke partner
          </p>
        </div>
        <AddPromoDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSuccess={fetchPromos}
        />
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Buat Promo Baru
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Promo</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalPromos}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Megaphone className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Promo Aktif</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {activePromos}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Promo Inactive</p>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {inactivePromos}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Akan Berakhir (7 hari)</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {expiringSoon}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                <Bell className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promos Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Promo</CardTitle>
          <CardDescription>
            Menampilkan {promos.length} promo terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <PromoTable
            promos={promos}
            loading={loading}
            onToggleActive={handleToggleActive}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <AddPromoDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={fetchPromos}
        editData={selectedPromo}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Hapus Promo
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus promo ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          {promoToDelete && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white">
                  {promoToDelete.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(promoToDelete.startDate).toLocaleDateString('id-ID')} - {new Date(promoToDelete.expireDate).toLocaleDateString('id-ID')}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteDialog(false)
                    setPromoToDelete(null)
                  }}
                  className="flex-1"
                  disabled={deleting}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
                  variant="destructive"
                  className="flex-1"
                  disabled={deleting}
                >
                  {deleting ? 'Menghapus...' : 'Hapus Promo'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
