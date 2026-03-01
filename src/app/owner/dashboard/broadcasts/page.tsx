'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Bell, Megaphone, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { AddBroadcastDialog } from '@/components/owner/broadcasts/add-broadcast-dialog'
import { BroadcastTable } from '@/components/owner/broadcasts/broadcast-table'
import { BroadcastPreview } from '@/components/owner/broadcasts/broadcast-preview'

interface Broadcast {
  id: string
  title: string
  description: string
  isActive: boolean
  startDate: string
  expireDate: string
  createdAt: string
}

export default function BroadcastsManagementPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDescriptionDialog, setShowDescriptionDialog] = useState(false)
  const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null)
  const [selectedDescription, setSelectedDescription] = useState('')
  const [editingBroadcast, setEditingBroadcast] = useState<Broadcast | null>(null)

  useEffect(() => {
    setMounted(true)
    fetchBroadcasts()
  }, [])

  const fetchBroadcasts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/broadcasts')
      const data = await response.json()
      setBroadcasts(data.broadcasts || [])
    } catch (error) {
      console.error('Error fetching broadcasts:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data broadcast',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Stats calculations
  const totalBroadcasts = broadcasts.length
  const activeBroadcasts = broadcasts.filter(b => b.isActive).length
  const inactiveBroadcasts = broadcasts.filter(b => !b.isActive).length

  // Calculate active broadcasts that are currently valid (within date range)
  const getCurrentlyValidBroadcasts = () => {
    const now = new Date()
    return broadcasts.filter(b =>
      b.isActive &&
      new Date(b.startDate) <= now &&
      new Date(b.expireDate) >= now
    )
  }
  const currentlyValidBroadcasts = getCurrentlyValidBroadcasts().length

  // Action handlers
  const handleToggleActive = async (broadcast: Broadcast) => {
    const newStatus = !broadcast.isActive

    try {
      const response = await fetch(`/api/broadcasts/${broadcast.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: `Broadcast ${newStatus ? 'Diaktifkan' : 'Dinonaktifkan'}!`,
          description: newStatus
            ? `Notifikasi telah dikirim ke semua partner aktif`
            : `${broadcast.title} telah dinonaktifkan`,
          variant: 'default'
        })
        fetchBroadcasts()
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

  const handleEdit = (broadcast: Broadcast) => {
    setEditingBroadcast(broadcast)
    setSelectedBroadcast(broadcast)
  }

  const handleDelete = (broadcast: Broadcast) => {
    setSelectedBroadcast(broadcast)
    setShowDescriptionDialog(true)
    setSelectedDescription(`Apakah Anda yakin ingin menghapus broadcast "${broadcast.title}"? Tindakan ini tidak dapat dibatalkan.`)
  }

  const confirmDelete = async () => {
    if (!selectedBroadcast) return

    try {
      const response = await fetch(`/api/broadcasts/${selectedBroadcast.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Broadcast Berhasil Dihapus!',
          description: `${selectedBroadcast.title} telah dihapus`,
          variant: 'default'
        })
        setShowDescriptionDialog(false)
        setSelectedBroadcast(null)
        fetchBroadcasts()
      } else {
        throw new Error(data.error || 'Gagal menghapus broadcast')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menghapus broadcast',
        variant: 'destructive'
      })
    }
  }

  const handleViewDescription = (description: string) => {
    setSelectedDescription(description)
    setShowDescriptionDialog(true)
  }

  const handleEditSuccess = () => {
    setEditingBroadcast(null)
    setSelectedBroadcast(null)
  }

  if (!mounted) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manajemen Broadcast
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola broadcast dan notifikasi untuk partner
          </p>
        </div>
          <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Buat Broadcast Baru
        </Button>
      </div>

      {/* Add/Edit Broadcast Dialog */}
      <AddBroadcastDialog
        open={showAddDialog || editingBroadcast !== null}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false)
            setEditingBroadcast(null)
          } else {
            setShowAddDialog(true)
          }
        }}
        onSuccess={handleEditSuccess}
        editBroadcast={editingBroadcast}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Broadcast</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalBroadcasts}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Bell className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Broadcast Aktif</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {activeBroadcasts}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <Send className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Sedang Berjalan</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {currentlyValidBroadcasts}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Broadcast Inaktif</p>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {inactiveBroadcasts}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Broadcasts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Broadcast</CardTitle>
          <CardDescription>
            Kelola semua broadcast dan notifikasi untuk partner
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <BroadcastTable
            broadcasts={broadcasts}
            loading={loading}
            onToggleActive={handleToggleActive}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDescription={handleViewDescription}
          />
        </CardContent>
      </Card>

      {/* View Description / Delete Confirmation Dialog */}
      <Dialog open={showDescriptionDialog} onOpenChange={setShowDescriptionDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            {selectedBroadcast && selectedDescription.includes('Apakah Anda yakin') ? (
              <>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  Hapus Broadcast
                </DialogTitle>
                <DialogDescription>
                  {selectedDescription}
                </DialogDescription>
              </>
            ) : (
              <>
                <DialogTitle className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-blue-600" />
                  Deskripsi Lengkap
                </DialogTitle>
              </>
            )}
          </DialogHeader>

          {selectedBroadcast && selectedDescription.includes('Apakah Anda yakin') ? (
            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDescriptionDialog(false)
                  setSelectedBroadcast(null)
                }}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                Hapus Broadcast
              </Button>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                {selectedDescription}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
