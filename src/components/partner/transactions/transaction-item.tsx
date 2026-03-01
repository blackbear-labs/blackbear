'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, XCircle, Eye, Loader2, Search, AlertCircle, Copy } from 'lucide-react'
import { TransactionStatusBadge } from '@/components/transactions/transaction-status-badge'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface TransactionItemProps {
  id: string
  customerName: string
  nominal: number
  profit: number
  status: string
  paymentType: string
  createdAt: string
  onViewDetail?: (id: string) => void
}

export function PartnerTransactionItem({
  id,
  customerName,
  nominal,
  profit,
  status,
  paymentType,
  createdAt,
  onViewDetail,
}: TransactionItemProps) {
  const { toast } = useToast()

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id)
    toast({
      title: 'ID Transaksi Disalin',
      description: `ID ${id} berhasil disalin ke clipboard`,
      variant: 'default'
    })
  }

  const statusConfig = {
    Pending: {
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      badge: 'secondary',
    },
    Verifikasi: {
      icon: Search,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      badge: 'secondary',
    },
    Proses: {
      icon: Loader2,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      badge: 'secondary',
    },
    Berhasil: {
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      badge: 'default',
    },
    Completed: {
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      badge: 'default',
    },
    Failed: {
      icon: AlertCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      badge: 'destructive',
    },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending
  const StatusIcon = config.icon

  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className={`p-2 rounded-lg ${config.bgColor} ${config.color}`}>
        <StatusIcon className={cn('w-5 h-5', status === 'Proses' && 'animate-spin')} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded flex items-center gap-1">
                <span className="truncate max-w-[150px]">{id}</span>
                <button
                  onClick={() => handleCopyId(id)}
                  className="hover:text-primary transition-colors shrink-0"
                  title="Copy ID"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </span>
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {customerName}
              </p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {paymentType}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <TransactionStatusBadge status={status} />
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2 text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {new Date(createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            {new Date(createdAt).toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
          Rp {profit.toLocaleString('id-ID')}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          dari Rp {nominal.toLocaleString('id-ID')}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
        onClick={() => onViewDetail?.(id)}
      >
        <Eye className="w-4 h-4" />
      </Button>
    </div>
  )
}
