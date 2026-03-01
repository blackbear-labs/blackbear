'use client'

import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Calendar, MoreVertical, Eye, Edit, Trash2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Broadcast {
  id: string
  title: string
  description: string
  isActive: boolean
  startDate: string
  expireDate: string
  createdAt: string
}

interface BroadcastTableProps {
  broadcasts: Broadcast[]
  loading: boolean
  onToggleActive: (broadcast: Broadcast) => void
  onEdit: (broadcast: Broadcast) => void
  onDelete: (broadcast: Broadcast) => void
  onViewDescription: (description: string) => void
}

export function BroadcastTable({
  broadcasts,
  loading,
  onToggleActive,
  onEdit,
  onDelete,
  onViewDescription
}: BroadcastTableProps) {
  const getDaysRemaining = (expireDate: string) => {
    const now = new Date()
    const expiry = new Date(expireDate)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getDaysRemainingBadge = (expireDate: string, isActive: boolean) => {
    if (!isActive) {
      return (
        <Badge variant="secondary">
          Inactive
        </Badge>
      )
    }

    const days = getDaysRemaining(expireDate)

    if (days < 0) {
      return (
        <Badge variant="destructive">
          Expired
        </Badge>
      )
    }

    if (days === 0) {
      return (
        <Badge className="bg-amber-500">
          Hari Ini
        </Badge>
      )
    }

    if (days <= 3) {
      return (
        <Badge className="bg-orange-500">
          {days} Hari
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
        {days} Hari
      </Badge>
    )
  }

  const truncateDescription = (desc: string, maxLength: number = 50) => {
    if (desc.length <= maxLength) return desc
    return desc.substring(0, maxLength) + '...'
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">Memuat data broadcast...</p>
      </div>
    )
  }

  if (broadcasts.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 font-medium">Tidak ada broadcast ditemukan</p>
        <p className="text-sm text-gray-400 mt-1">Buat broadcast baru untuk memulai</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Judul Broadcast</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Tanggal Mulai</TableHead>
            <TableHead>Tanggal Berakhir</TableHead>
            <TableHead>Sisa Waktu</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {broadcasts.map((broadcast) => (
            <TableRow key={broadcast.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={broadcast.isActive}
                    onCheckedChange={() => onToggleActive(broadcast)}
                  />
                  <Badge
                    className={
                      broadcast.isActive
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                    }
                  >
                    {broadcast.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="font-medium">{broadcast.title}</TableCell>
              <TableCell className="max-w-xs">
                <div className="flex items-start gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {truncateDescription(broadcast.description)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => onViewDescription(broadcast.description)}
                  >
                    <Eye className="w-3 h-3 text-gray-400" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(broadcast.startDate)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(broadcast.expireDate)}
                </div>
              </TableCell>
              <TableCell>
                {getDaysRemainingBadge(broadcast.expireDate, broadcast.isActive)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(broadcast)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(broadcast)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Hapus
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
