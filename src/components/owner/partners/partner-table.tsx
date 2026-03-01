'use client'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Mail, MapPin, AlertCircle } from 'lucide-react'
import { PartnerActions } from './partner-actions'

interface Partner {
  id: string
  name: string
  email: string
  bankName: string
  accountNumber: string
  city: string
  tier: string
  commissionRate: number
  status: string
  totalProfit: number
  totalVolume: number
  totalTransactions: number
  createdAt: string
}

interface PartnerTableProps {
  partners: Partner[]
  loading: boolean
  onViewDetails: (partner: Partner) => void
  onToggleStatus: (partner: Partner) => void
  onOverrideTier: (partner: Partner) => void
  onSendAnnouncement: (partner: Partner) => void
}

const tierColors: Record<string, { bg: string; text: string; border: string }> = {
  Bronze: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
  Silver: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700' },
  Gold: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800' },
  Platinum: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700' },
  Diamond: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800' },
}

export function PartnerTable({
  partners,
  loading,
  onViewDetails,
  onToggleStatus,
  onOverrideTier,
  onSendAnnouncement
}: PartnerTableProps) {
  const getTierBadge = (tier: string) => {
    const colors = tierColors[tier] || tierColors.Bronze
    return (
      <Badge
        variant="outline"
        className={`${colors.bg} ${colors.text} ${colors.border} font-medium`}
      >
        {tier}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    if (status === 'Active') {
      return (
        <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
          Active
        </Badge>
      )
    }
    return (
      <Badge variant="destructive">
        Suspended
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">Memuat data mitra...</p>
      </div>
    )
  }

  if (partners.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 font-medium">Tidak ada mitra ditemukan</p>
        <p className="text-sm text-gray-400 mt-1">Coba ubah filter atau tambah mitra baru</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Bank</TableHead>
            <TableHead>Kota</TableHead>
            <TableHead>Tier / Badge</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Komisi %</TableHead>
            <TableHead>Total Profit</TableHead>
            <TableHead>Total Transaksi</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {partners.map((partner) => (
            <TableRow key={partner.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <TableCell className="font-medium">{partner.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate max-w-[150px]">{partner.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div className="font-medium">{partner.bankName}</div>
                  <div className="text-xs text-gray-500">{partner.accountNumber}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{partner.city}</span>
                </div>
              </TableCell>
              <TableCell>{getTierBadge(partner.tier)}</TableCell>
              <TableCell>{getStatusBadge(partner.status)}</TableCell>
              <TableCell>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {partner.commissionRate}%
                </span>
              </TableCell>
              <TableCell>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Rp {partner.totalProfit.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                </span>
              </TableCell>
              <TableCell>
                <span className="font-medium">{partner.totalTransactions}</span>
              </TableCell>
              <TableCell className="text-right">
                <PartnerActions
                  partner={partner}
                  onViewDetails={onViewDetails}
                  onToggleStatus={onToggleStatus}
                  onOverrideTier={onOverrideTier}
                  onSendAnnouncement={onSendAnnouncement}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
