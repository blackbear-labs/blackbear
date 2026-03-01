'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CustomerSearch } from '@/components/partner/customers/customer-search'
import { AddCustomerDialog } from '@/components/partner/customers/add-customer-dialog'
import { CustomerList } from '@/components/partner/customers/customer-list'
import { CustomerDetailDialog } from '@/components/partner/customers/customer-detail-dialog'
import { EditCustomerDialog } from '@/components/partner/customers/edit-customer-dialog'
import { Users, Plus, AlertCircle, DollarSign, Activity, TrendingUp, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Customer {
  id: string
  name: string
  whatsapp: string
  bankName: string | null
  accountNumber: string | null
  accountOwner: string | null
  label: string
  city: string
  totalProfit: number
  totalVolume: number
  totalTransactions: number
  partnerId: string | null
  createdAt: string
}

interface Stats {
  totalCustomers: number
  totalProfit: number
  totalTransactions: number
  totalVolume: number
}

export default function PartnerCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [partnerId, setPartnerId] = useState<string | null>(null)

  useEffect(() => {
    const session = localStorage.getItem('session')
    if (!session) {
      toast.error('Sesi tidak ditemukan', {
        description: 'Silakan login kembali.'
      })
      return
    }

    const user = JSON.parse(session)
    if (user.role !== 'partner') {
      toast.error('Akses ditolak', {
        description: 'Halaman ini hanya untuk partner.'
      })
      return
    }

    setPartnerId(user.partnerId)
  }, [])

  useEffect(() => {
    if (partnerId) {
      fetchCustomers()
      fetchStats()
    }
  }, [partnerId])

  useEffect(() => {
    if (searchQuery) {
      const filtered = customers.filter((customer) =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.whatsapp.includes(searchQuery)
      )
      setFilteredCustomers(filtered)
    } else {
      setFilteredCustomers(customers)
    }
  }, [searchQuery, customers])

  const fetchCustomers = async () => {
    if (!partnerId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/customers?partnerId=${partnerId}`)
      const data = await response.json()

      if (response.ok) {
        setCustomers(data.customers || [])
      } else {
        toast.error('Gagal memuat customer', {
          description: data.error || 'Terjadi kesalahan saat memuat data customer'
        })
      }
    } catch (error) {
      toast.error('Gagal memuat customer', {
        description: 'Terjadi kesalahan saat memuat data customer'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    if (!partnerId) return

    try {
      const response = await fetch(`/api/customers?partnerId=${partnerId}`)
      const data = await response.json()

      if (response.ok && data.customers) {
        const totalCustomers = data.customers.length
        const totalProfit = data.customers.reduce((sum: number, c: Customer) => sum + (c.totalProfit || 0), 0)
        const totalTransactions = data.customers.reduce((sum: number, c: Customer) => sum + (c.totalTransactions || 0), 0)
        const totalVolume = data.customers.reduce((sum: number, c: Customer) => sum + (c.totalVolume || 0), 0)

        setStats({
          totalCustomers,
          totalProfit,
          totalTransactions,
          totalVolume
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer)
    setDetailDialogOpen(true)
  }

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setEditDialogOpen(true)
  }

  const handleRefresh = () => {
    fetchCustomers()
    fetchStats()
  }

  const handleAddSuccess = () => {
    handleRefresh()
  }

  const handleEditSuccess = () => {
    handleRefresh()
    setEditDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Kelola Customer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola customer dan pantau kontribusi profit mereka
          </p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Customer
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-emerald-100 dark:border-emerald-900">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Total Customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalCustomers}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Customer terdaftar
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 dark:border-emerald-900">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Total Kontribusi Profit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                Rp {stats.totalProfit.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Dari semua customer
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 dark:border-emerald-900">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                Total Transaksi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalTransactions}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Transaksi tercatat
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-100 dark:border-emerald-900">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                Total Volume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                Rp {stats.totalVolume.toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total transaksi
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search & Filter */}
      <Card className="border-emerald-100 dark:border-emerald-900">
        <CardHeader>
          <CardTitle>Pencarian Customer</CardTitle>
          <CardDescription>
            Cari customer berdasarkan nama atau nomor WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerSearch onSearch={handleSearch} />
          {searchQuery && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Menampilkan {filteredCustomers.length} dari {customers.length} customer
            </p>
          )}
        </CardContent>
      </Card>

      {/* Customer List */}
      {loading ? (
        <Card className="border-emerald-100 dark:border-emerald-900">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Memuat data customer...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <CustomerList
          customers={filteredCustomers}
          loading={loading}
          onRefresh={handleRefresh}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
        />
      )}

      {/* Add Customer Dialog */}
      <AddCustomerDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleAddSuccess}
      />

      {/* Customer Detail Dialog */}
      <CustomerDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        customer={selectedCustomer}
        onRefresh={handleRefresh}
      />

      {/* Edit Customer Dialog */}
      <EditCustomerDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        customer={selectedCustomer}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}
