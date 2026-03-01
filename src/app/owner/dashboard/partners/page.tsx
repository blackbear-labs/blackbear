'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Search, Mail, MapPin, Crown, Megaphone, DollarSign, Users } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { AddPartnerDialog } from '@/components/owner/partners/add-partner-dialog'
import { PartnerTable } from '@/components/owner/partners/partner-table'
import { GamificationRules } from '@/components/owner/partners/gamification-rules'
import { Label } from '@/components/ui/label'

interface Partner {
  id: string
  name: string
  email: string
  bankName: string
  accountNumber: string
  accountOwner: string
  city: string
  tier: string
  badge: string
  commissionRate: number
  status: string
  totalProfit: number
  totalVolume: number
  totalTransactions: number
  createdAt: string
}

export default function PartnersManagementPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [partners, setPartners] = useState<Partner[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showTierDialog, setShowTierDialog] = useState(false)
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Forms
  const [tierFormData, setTierFormData] = useState({
    tier: 'Bronze',
    commissionRate: 30
  })
  const [announcementFormData, setAnnouncementFormData] = useState({
    title: '',
    description: '',
    expireDays: '7'
  })

  useEffect(() => {
    setMounted(true)
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/partners')
      const data = await response.json()
      setPartners(data.partners || [])
    } catch (error) {
      console.error('Error fetching partners:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data mitra',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter partners
  const filteredPartners = partners.filter(partner => {
    const matchesSearch = 
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.city.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTier = tierFilter === 'all' || partner.tier === tierFilter
    const matchesStatus = statusFilter === 'all' || partner.status === statusFilter

    return matchesSearch && matchesTier && matchesStatus
  })

  // Stats calculations
  const totalPartners = partners.length
  const activePartners = partners.filter(p => p.status === 'Active').length
  const suspendedPartners = partners.filter(p => p.status === 'Suspended').length
  const totalPartnerProfit = partners.reduce((sum, p) => sum + p.totalProfit, 0)

  // Action handlers
  const handleViewDetails = (partner: Partner) => {
    setSelectedPartner(partner)
    setShowDetailsDialog(true)
  }

  const handleToggleStatus = async (partner: Partner) => {
    const newStatus = partner.status === 'Active' ? 'Suspended' : 'Active'
    const endpoint = newStatus === 'Active' ? `/api/partners/${partner.id}/activate` : `/api/partners/${partner.id}/suspend`

    try {
      const response = await fetch(endpoint, { method: 'POST' })
      const data = await response.json()

      if (data.success) {
        toast({
          title: `Mitra ${newStatus === 'Active' ? 'Diaktifkan' : 'Disuspend'}!`,
          description: `${partner.name} telah ${newStatus === 'Active' ? 'diaktifkan' : 'disuspend'}`,
          variant: 'default'
        })
        fetchPartners()
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

  const handleOverrideTier = (partner: Partner) => {
    setSelectedPartner(partner)
    setTierFormData({
      tier: partner.tier,
      commissionRate: partner.commissionRate
    })
    setShowTierDialog(true)
  }

  const handleTierSubmit = async () => {
    if (!selectedPartner) return

    try {
      const response = await fetch(`/api/partners/${selectedPartner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: tierFormData.tier,
          commissionRate: tierFormData.commissionRate
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Tier Berhasil Diupdate!',
          description: `Tier ${selectedPartner.name} telah diubah ke ${tierFormData.tier}`,
          variant: 'default'
        })
        setShowTierDialog(false)
        setSelectedPartner(null)
        fetchPartners()
      } else {
        throw new Error(data.error || 'Gagal update tier')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal update tier',
        variant: 'destructive'
      })
    }
  }

  const handleSendAnnouncement = (partner: Partner) => {
    setSelectedPartner(partner)
    setAnnouncementFormData({ title: '', description: '', expireDays: '7' })
    setShowAnnouncementDialog(true)
  }

  const handleAnnouncementSubmit = async () => {
    if (!selectedPartner || !announcementFormData.title || !announcementFormData.description) {
      toast({
        title: 'Validasi Error',
        description: 'Judul dan deskripsi wajib diisi',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch(`/api/partners/${selectedPartner.id}/announcement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: announcementFormData.title,
          description: announcementFormData.description,
          expireDays: parseInt(announcementFormData.expireDays) || 7
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Pengumuman Terkirim!',
          description: `Pengumuman telah dikirim ke ${selectedPartner.name}`,
          variant: 'default'
        })
        setShowAnnouncementDialog(false)
        setSelectedPartner(null)
        setAnnouncementFormData({ title: '', description: '', expireDays: '7' })
      } else {
        throw new Error(data.error || 'Gagal mengirim pengumuman')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal mengirim pengumuman',
        variant: 'destructive'
      })
    }
  }

  if (!mounted) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manajemen Mitra
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola semua mitra dan pengaturan komisi mereka
          </p>
        </div>
        <AddPartnerDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSuccess={fetchPartners}
        />
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Mitra Baru
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Mitra</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalPartners}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Mitra Aktif</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {activePartners}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Mitra Suspended</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {suspendedPartners}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Profit Mitra</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  Rp {totalPartnerProfit.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Cari mitra berdasarkan nama, email, atau kota..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label>Filter Tier</Label>
                    <Select
                      value={tierFilter}
                      onValueChange={setTierFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Semua Tier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Tier</SelectItem>
                        <SelectItem value="Bronze">Bronze</SelectItem>
                        <SelectItem value="Silver">Silver</SelectItem>
                        <SelectItem value="Gold">Gold</SelectItem>
                        <SelectItem value="Platinum">Platinum</SelectItem>
                        <SelectItem value="Diamond">Diamond</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Filter Status</Label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Semua Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Partners Table */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar Mitra</CardTitle>
              <CardDescription>
                Menampilkan {filteredPartners.length} dari {partners.length} mitra
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <PartnerTable
                partners={filteredPartners}
                loading={loading}
                onViewDetails={handleViewDetails}
                onToggleStatus={handleToggleStatus}
                onOverrideTier={handleOverrideTier}
                onSendAnnouncement={handleSendAnnouncement}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <GamificationRules />
        </div>
      </div>

      {/* Tier Override Dialog */}
      <Dialog open={showTierDialog} onOpenChange={setShowTierDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-600" />
              Override Tier & Komisi
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Tier/Badge</Label>
              <Select
                value={tierFormData.tier}
                onValueChange={(value) => setTierFormData({ ...tierFormData, tier: value })}
              >
                <SelectTrigger>
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
              <Label>Komisi (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={tierFormData.commissionRate}
                onChange={(e) => setTierFormData({ ...tierFormData, commissionRate: parseFloat(e.target.value) || 0 })}
                placeholder="30"
              />
            </div>
            {selectedPartner && (
              <Button 
                onClick={handleTierSubmit} 
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                Simpan Perubahan
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Announcement Dialog */}
      <Dialog open={showAnnouncementDialog} onOpenChange={setShowAnnouncementDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600" />
              Kirim Pengumuman
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Judul *</Label>
              <Input
                value={announcementFormData.title}
                onChange={(e) => setAnnouncementFormData({ ...announcementFormData, title: e.target.value })}
                placeholder="Judul pengumuman"
              />
            </div>
            <div>
              <Label>Deskripsi *</Label>
              <Input
                value={announcementFormData.description}
                onChange={(e) => setAnnouncementFormData({ ...announcementFormData, description: e.target.value })}
                placeholder="Isi pengumuman"
              />
            </div>
            <div>
              <Label>Expire (Hari)</Label>
              <Input
                type="number"
                min="1"
                max="30"
                value={announcementFormData.expireDays}
                onChange={(e) => setAnnouncementFormData({ ...announcementFormData, expireDays: e.target.value })}
                placeholder="7"
              />
            </div>
            {selectedPartner && (
              <Button 
                onClick={handleAnnouncementSubmit} 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Kirim Pengumuman
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Mitra</DialogTitle>
          </DialogHeader>

          {selectedPartner && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Nama</Label>
                  <p className="font-semibold mt-1">{selectedPartner.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium mt-1 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {selectedPartner.email}
                  </p>
                </div>
                <div>
                  <Label>Bank</Label>
                  <p className="font-medium mt-1">{selectedPartner.bankName}</p>
                </div>
                <div>
                  <Label>Nomor Rekening</Label>
                  <p className="font-medium mt-1">{selectedPartner.accountNumber}</p>
                </div>
                <div>
                  <Label>Kota</Label>
                  <p className="font-medium mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {selectedPartner.city}
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <Badge variant={selectedPartner.status === 'Active' ? 'default' : 'destructive'}>
                      {selectedPartner.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label>Tier</Label>
                  <div className="mt-1">
                    <Badge variant="outline">{selectedPartner.tier}</Badge>
                  </div>
                </div>
                <div>
                  <Label>Komisi</Label>
                  <p className="font-semibold mt-1 text-blue-600">{selectedPartner.commissionRate}%</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <h4 className="font-semibold">Statistik</h4>
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">Total Profit</p>
                    <p className="font-bold text-emerald-600">
                      Rp {selectedPartner.totalProfit.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">Total Transaksi</p>
                    <p className="font-bold">{selectedPartner.totalTransactions}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">Total Volume</p>
                    <p className="font-bold text-purple-600">
                      Rp {selectedPartner.totalVolume.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">Badge</p>
                    <p className="font-semibold">{selectedPartner.badge}</p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 border-t pt-3">
                Terdaftar sejak: {new Date(selectedPartner.createdAt).toLocaleDateString('id-ID')}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
