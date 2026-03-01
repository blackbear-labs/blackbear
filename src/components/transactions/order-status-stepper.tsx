import { cn } from '@/lib/utils'
import { CheckCircle2, Clock, Search, Loader2 } from 'lucide-react'

interface StatusStep {
  key: string
  label: string
  icon: any
}

interface OrderStatusStepperProps {
  currentStatus: string
  className?: string
}

const STEPS: StatusStep[] = [
  { key: 'Pending', label: 'Pending', icon: Clock },
  { key: 'Verifikasi', label: 'Verifikasi', icon: Search },
  { key: 'Proses', label: 'Proses', icon: Loader2 },
  { key: 'Berhasil', label: 'Berhasil', icon: CheckCircle2 }
]

const STATUS_ORDER = ['Pending', 'Verifikasi', 'Proses', 'Berhasil']

export function OrderStatusStepper({ currentStatus, className }: OrderStatusStepperProps) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus)

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex
        const isCurrent = index === currentIndex
        const isPending = index > currentIndex

        const StepIcon = step.icon

        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                  isCompleted && 'border-emerald-500 bg-emerald-500 text-white',
                  isCurrent && 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
                  isPending && 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-400'
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <StepIcon className={cn('w-5 h-5', isCurrent && 'animate-pulse')} />
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium mt-2',
                  isCompleted && 'text-emerald-600 dark:text-emerald-400',
                  isCurrent && 'text-blue-600 dark:text-blue-400 font-semibold',
                  isPending && 'text-gray-400 dark:text-gray-500'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-1 mx-2 rounded-full',
                  index < currentIndex && 'bg-emerald-500',
                  index === currentIndex && 'bg-blue-500',
                  index > currentIndex && 'bg-gray-200 dark:bg-gray-700'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
