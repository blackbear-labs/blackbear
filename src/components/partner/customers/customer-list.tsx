'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Eye, Edit, Trash2, MoreVertical, AlertCircle, Phone, MapPin, CreditCard, Activity } from 'lucide-react'
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

interface CustomerListProps {
  customers: Customer[]
  loading: boolean
  onRefresh: () => void
  onViewDetails: (customer: Customer) => void
  onEdit: (customer: Customer) => void
}

export function CustomerList({ customers, loading, onRefresh, onViewDetails, onEdit }: CustomerListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [partnerId, setPartnerId] = useState<string | null>(null)

  // Get current partner ID
  useEffect(() => {
    const session = localStorage.getItem('session')
    if (session) {
      const user = JSON.parse(session)
      setPartnerId(user.partnerId)
    }
  }, [])

  const getLabelColor = (label: string) => {
    switch (label) {
      case 'VIP':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case 'Blacklist':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    }
  }

  const canEditOrDelete = (customer: Customer) => {
    return customer.partnerId === partnerId
  }

  const handleDelete = async (customerId: string, customerName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus customer "${customerName}"?`)) {
      return
    }

    setDeletingId(customerId)
    try {
      const response = await fetch(`/api/customers/${customerId}?partnerId=${partnerId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Gagal menghapus customer')
      }

      toast.success('Customer berhasil dihapus', {
        description: `${customerName} telah dihapus dari daftar customer Anda.`
      })

      onRefresh()
    } catch (error: any) {
      toast.error('Gagal menghapus customer', {
        description: error.message || 'Terjadi kesalahan saat menghapus customer'
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <Card className="border-emerald-100 dark:border-emerald-900">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Memuat customer...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (customers.length === 0) {
    return (
      <Card className="border-emerald-100 dark:border-emerald-900">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">Belum ada customer</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Mulai tambahkan customer baru untuk melihat daftar di sini.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-emerald-100 dark:border-emerald-900 overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-emerald-50 dark:bg-emerald-950/30">
                <TableHead className="font-semibold">Nama</TableHead>
                <TableHead className="font-semibold">No. WA</TableHead>
                <TableHead className="font-semibold">Bank</TableHead>
                <TableHead className="font-semibold">No. Rek</TableHead>
                <TableHead className="font-semibold">Label</TableHead>
                <TableHead className="font-semibold">Kota</TableHead>
                <TableHead className="font-semibold text-right">Profit</TableHead>
                <TableHead className="font-semibold text-right">Transaksi</TableHead>
                <TableHead className="font-semibold text-right">Volume</TableHead>
                <TableHead className="font-semibold text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20">
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{customer.whatsapp}</span>
                    </div>
                  </TableCell>
                  <TableCell>{customer.bankName || '-'}</TableCell>
                  <TableCell>{customer.accountNumber || '-'}</TableCell>
                  <TableCell>
                    <Badge className={getLabelColor(customer.label)}>
                      {customer.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{customer.city}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                    Rp {customer.totalProfit.toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell className="text-right font-medium text-blue-600 dark:text-blue-400">
                    {customer.totalTransactions}
                  </TableCell>
                  <TableCell className="text-right font-medium text-purple-600 dark:text-purple-400">
                    Rp {customer.totalVolume.toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(customer)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Lihat Detail
                        </DropdownMenuItem>
                        {canEditOrDelete(customer) && (
                          <>
                            <DropdownMenuItem onClick={() => onEdit(customer)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Data
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(customer.id, customer.name)}
                              disabled={deletingId === customer.id}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {deletingId === customer.id ? 'Menghapus...' : 'Hapus'}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
