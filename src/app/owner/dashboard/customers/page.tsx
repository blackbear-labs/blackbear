'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { CustomerTable } from '@/components/owner/customers/customer-table'
import { AddCustomerDialog } from '@/components/owner/customers/add-customer-dialog'
import { CustomerDetailDialog } from '@/components/owner/customers/customer-detail-dialog'
import { CityHeatmap } from '@/components/owner/customers/city-heatmap'

interface Customer {
  id: string
  name: string
  whatsapp: string
  bankName: string | null
  accountNumber: string | null
  accountOwner: string | null
  city: string
  label: string
  partnerId: string | null
  partner?: {
    name: string
  } | null
  totalProfit: number
  totalVolume: number
  totalTransactions: number
  createdAt: string
}

interface CityStat {
  city: string
  count: number
}

export default function CustomersManagementPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [cityStats, setCityStats] = useState<CityStat[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCity, setSelectedCity] = useState<string>('all')
  const [selectedLabel, setSelectedLabel] = useState<string>('all')
  const [selectedPartner, setSelectedPartner] = useState<string>('all')

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: '',
    whatsapp: '',
    bankName: '',
    accountNumber: '',
    accountOwner: '',
    city: '',
    label: 'Regular'
  })
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [customersRes, citiesRes] = await Promise.all([
        fetch('/api/customers').then(r => r.json()),
        fetch('/api/customers/cities').then(r => r.json())
      ])

      setCustomers(customersRes.customers || [])
      setCityStats(citiesRes.cities || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCustomer = async (customer: Customer) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus customer ${customer.name}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Customer Berhasil Dihapus!',
          variant: 'default'
        })
        fetchData()
      } else {
        throw new Error(data.error || 'Gagal menghapus customer')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menghapus customer',
        variant: 'destructive'
      })
    }
  }

  const handleBlacklist = async (customer: Customer) => {
    const newLabel = customer.label === 'Blacklist' ? 'Regular' : 'Blacklist'

    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newLabel })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: `Customer ${newLabel === 'Blacklist' ? 'Diblacklist' : 'Dihapus dari blacklist'}!`,
          variant: 'default'
        })
        fetchData()
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

  const handleViewDetail = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowDetailDialog(true)
  }

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    setEditFormData({
      name: customer.name,
      whatsapp: customer.whatsapp,
      bankName: customer.bankName || '',
      accountNumber: customer.accountNumber || '',
      accountOwner: customer.accountOwner || '',
      city: customer.city,
      label: customer.label
    })
    setShowEditDialog(true)
  }

  const handleUpdateCustomer = async () => {
    // Validation
    if (!editFormData.whatsapp.match(/^08\d{8,11}$/)) {
      toast({
        title: 'Format WhatsApp Salah',
        description: 'WhatsApp harus dimulai dengan 08 dan 10-13 digit',
        variant: 'destructive'
      })
      return
    }

    setEditLoading(true)
    try {
      const response = await fetch(`/api/customers/${selectedCustomer?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Customer Berhasil Diupdate!',
          variant: 'default'
        })
        setShowEditDialog(false)
        setSelectedCustomer(null)
        fetchData()
      } else {
        throw new Error(data.error || 'Gagal update customer')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal update customer',
        variant: 'destructive'
      })
    } finally {
      setEditLoading(false)
    }
  }

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.whatsapp.includes(searchTerm) ||
      customer.city.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCity = selectedCity === 'all' || customer.city === selectedCity
    const matchesLabel = selectedLabel === 'all' || customer.label === selectedLabel

    return matchesSearch && matchesCity && matchesLabel
  })

  // Get unique partners for filter
  const partners = Array.from(
    new Set(
      customers
        .filter(c => c.partner?.name)
        .map(c => c.partner?.name)
    )
  ).filter(Boolean) as string[]

  if (!mounted) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manajemen Customer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola semua customer dan riwayat transaksi mereka
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Customer Baru
            </Button>
          </DialogTrigger>
          <AddCustomerDialog
            open={showAddDialog}
            onOpenChange={setShowAddDialog}
            onSuccess={fetchData}
          />
        </Dialog>
      </div>

      {/* City Heatmap */}
      <CityHeatmap
        cityStats={cityStats}
        totalCustomers={customers.length}
        selectedCity={selectedCity}
        onCitySelect={setSelectedCity}
      />

      {/* Search & Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Cari customer berdasarkan nama, WhatsApp, atau kota..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Select
                value={selectedLabel}
                onValueChange={setSelectedLabel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter Label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Label</SelectItem>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Blacklist">Blacklist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={selectedPartner}
                onValueChange={setSelectedPartner}
                disabled={partners.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter Partner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Partner</SelectItem>
                  {partners.map((partner) => (
                    <SelectItem key={partner} value={partner}>
                      {partner}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Customer</CardTitle>
          <CardDescription>
            Total {filteredCustomers.length} dari {customers.length} customer
            {selectedCity !== 'all' && ` di ${selectedCity}`}
            {selectedLabel !== 'all' && ` (${selectedLabel})`}
            {searchTerm && ` (pencarian: "${searchTerm}")`}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <CustomerTable
            customers={filteredCustomers}
            loading={loading}
            onViewDetail={handleViewDetail}
            onEdit={handleEditClick}
            onBlacklist={handleBlacklist}
            onDelete={handleDeleteCustomer}
          />
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <CustomerDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        customer={selectedCustomer}
      />

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="text-sm font-medium">Nama *</label>
              <Input
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Nama lengkap"
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium">No. WhatsApp *</label>
              <Input
                type="text"
                value={editFormData.whatsapp}
                onChange={(e) => setEditFormData({ ...editFormData, whatsapp: e.target.value })}
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Bank</label>
              <Input
                value={editFormData.bankName}
                onChange={(e) => setEditFormData({ ...editFormData, bankName: e.target.value })}
                placeholder="Contoh: BCA"
              />
            </div>
            <div>
              <label className="text-sm font-medium">No. Rekening</label>
              <Input
                value={editFormData.accountNumber}
                onChange={(e) => setEditFormData({ ...editFormData, accountNumber: e.target.value })}
                placeholder="Nomor rekening"
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium">Nama Pemilik</label>
              <Input
                value={editFormData.accountOwner}
                onChange={(e) => setEditFormData({ ...editFormData, accountOwner: e.target.value })}
                placeholder="Sesuai buku tabungan"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Kota *</label>
              <Input
                value={editFormData.city}
                onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                placeholder="Kota domisili"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Label</label>
              <Select
                value={editFormData.label}
                onValueChange={(value) => setEditFormData({ ...editFormData, label: value })}
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
            {selectedCustomer && (
              <div className="col-span-2">
                <Button
                  onClick={handleUpdateCustomer}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  disabled={editLoading}
                >
                  {editLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
