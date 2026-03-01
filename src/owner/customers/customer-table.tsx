'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreVertical,
  Phone,
  MapPin,
  Eye,
  Edit,
  Trash2,
  UserX,
  AlertCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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

interface CustomerTableProps {
  customers: Customer[]
  loading: boolean
  onViewDetail: (customer: Customer) => void
  onEdit: (customer: Customer) => void
  onBlacklist: (customer: Customer) => void
  onDelete: (customer: Customer) => void
}

export function CustomerTable({
  customers,
  loading,
  onViewDetail,
  onEdit,
  onBlacklist,
  onDelete
}: CustomerTableProps) {
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = (customer: Customer) => {
    setDeletingId(customer.id)
    onDelete(customer)
    setTimeout(() => setDeletingId(null), 1000)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Memuat data customer...
        </p>
      </div>
    )
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          Tidak ada customer ditemukan
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>WA</TableHead>
            <TableHead>Bank</TableHead>
            <TableHead>No Rek</TableHead>
            <TableHead>Nama Pemilik</TableHead>
            <TableHead>Label</TableHead>
            <TableHead>Kota</TableHead>
            <TableHead>Total Kontribusi Profit</TableHead>
            <TableHead>Total Transaksi</TableHead>
            <TableHead>Total Volume</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Phone className="w-3 h-3 text-gray-400" />
                  {customer.whatsapp}
                </div>
              </TableCell>
              <TableCell>{customer.bankName || '-'}</TableCell>
              <TableCell>{customer.accountNumber || '-'}</TableCell>
              <TableCell>{customer.accountOwner || '-'}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    customer.label === 'VIP' ? 'default' :
                    customer.label === 'Blacklist' ? 'destructive' :
                    'secondary'
                  }
                  className={
                    customer.label === 'VIP' ? 'bg-purple-600 hover:bg-purple-700' :
                    customer.label === 'Blacklist' ? '' :
                    ''
                  }
                >
                  {customer.label}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  {customer.city}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-emerald-600 font-semibold">
                  Rp {customer.totalProfit.toLocaleString('id-ID')}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-blue-600 font-semibold">
                  {customer.totalTransactions}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-purple-600 font-semibold">
                  Rp {customer.totalVolume.toLocaleString('id-ID')}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetail(customer)}>
                      <Eye className="w-4 h-4 mr-2" />
                      Lihat Detail
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(customer)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Data
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onBlacklist(customer)}>
                      <UserX className="w-4 h-4 mr-2" />
                      {customer.label === 'Blacklist' ? 'Hapus dari Blacklist' : 'Add to Blacklist'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(customer)}
                      className="text-red-600"
                      disabled={deletingId === customer.id}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {deletingId === customer.id ? 'Menghapus...' : 'Delete / Blacklist'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
