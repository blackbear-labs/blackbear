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
import { ExternalLink, Calendar, AlertCircle, Clock } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreVertical, Edit, Trash2 } from 'lucide-react'

interface Promo {
  id: string
  title: string
  link: string
  isActive: boolean
  startDate: string
  expireDate: string
  createdAt: string
}

interface PromoTableProps {
  promos: Promo[]
  loading: boolean
  onToggleActive: (promo: Promo) => void
  onEdit: (promo: Promo) => void
  onDelete: (promo: Promo) => void
}

export function PromoTable({
  promos,
  loading,
  onToggleActive,
  onEdit,
  onDelete
}: PromoTableProps) {
  const getStatusBadge = (isActive: boolean, startDate: string, expireDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(expireDate)

    if (!isActive) {
      return (
        <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700">
          Inactive
        </Badge>
      )
    }

    if (now < start) {
      return (
        <Badge variant="outline" className="border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20">
          Scheduled
        </Badge>
      )
    }

    if (now > end) {
      return (
        <Badge variant="destructive">
          Expired
        </Badge>
      )
    }

    return (
      <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
        Active
      </Badge>
    )
  }

  const getDaysRemaining = (isActive: boolean, expireDate: string): number | null => {
    if (!isActive) return null

    const now = new Date()
    const end = new Date(expireDate)

    if (now > end) return 0

    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getDaysRemainingBadge = (daysRemaining: number | null) => {
    if (daysRemaining === null) {
      return <span className="text-gray-400">-</span>
    }

    if (daysRemaining <= 0) {
      return (
        <div className="flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
          <span className="text-red-600 dark:text-red-400 text-sm font-medium">Expired</span>
        </div>
      )
    }

    if (daysRemaining <= 7) {
      return (
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-amber-600 dark:text-amber-400 text-sm font-medium">{daysRemaining} hari</span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1">
        <Clock className="w-3.5 h-3.5 text-green-500" />
        <span className="text-green-600 dark:text-green-400 text-sm font-medium">{daysRemaining} hari</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">Memuat data promo...</p>
      </div>
    )
  }

  if (promos.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 font-medium">Tidak ada promo ditemukan</p>
        <p className="text-sm text-gray-400 mt-1">Buat promo baru untuk memulai</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead>Judul Promo</TableHead>
            <TableHead>Link Canva / GDrive</TableHead>
            <TableHead>Tanggal Mulai</TableHead>
            <TableHead>Tanggal Berakhir</TableHead>
            <TableHead className="w-[120px]">Sisa Waktu</TableHead>
            <TableHead className="text-right w-[80px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {promos.map((promo) => {
            const daysRemaining = getDaysRemaining(promo.isActive, promo.expireDate)

            return (
              <TableRow key={promo.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={promo.isActive}
                      onCheckedChange={() => onToggleActive(promo)}
                    />
                    {getStatusBadge(promo.isActive, promo.startDate, promo.expireDate)}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{promo.title}</TableCell>
                <TableCell>
                  <a
                    href={promo.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1.5 text-sm font-medium hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Buka Link
                  </a>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{new Date(promo.startDate).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{new Date(promo.expireDate).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {getDaysRemainingBadge(daysRemaining)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(promo)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(promo)}
                        className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
