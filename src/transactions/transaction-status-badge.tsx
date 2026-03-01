import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, Search, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TransactionStatusBadgeProps {
  status: string
  className?: string
}

export function TransactionStatusBadge({ status, className }: TransactionStatusBadgeProps) {
  const statusConfig = {
    Pending: {
      icon: Clock,
      label: 'Pending',
      color: 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-400',
      iconColor: 'text-amber-600 dark:text-amber-400'
    },
    Verifikasi: {
      icon: Search,
      label: 'Verifikasi',
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-400',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    Proses: {
      icon: Loader2,
      label: 'Proses',
      color: 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-400',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    Berhasil: {
      icon: CheckCircle2,
      label: 'Berhasil',
      color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-400',
      iconColor: 'text-emerald-600 dark:text-emerald-400'
    },
    Failed: {
      icon: AlertCircle,
      label: 'Gagal',
      color: 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400',
      iconColor: 'text-red-600 dark:text-red-400'
    },
    Completed: {
      icon: CheckCircle2,
      label: 'Selesai',
      color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-400',
      iconColor: 'text-emerald-600 dark:text-emerald-400'
    }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending
  const StatusIcon = config.icon

  return (
    <Badge className={cn('gap-1.5', config.color, className)}>
      <StatusIcon className="w-3 h-3" />
      {config.label}
    </Badge>
  )
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    Pending: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30',
    Verifikasi: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30',
    Proses: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30',
    Berhasil: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30',
    Failed: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30',
    Completed: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
  }
  return colors[status] || colors.Pending
}
