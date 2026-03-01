'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  User,
  Phone,
  MapPin,
  Building,
  CreditCard,
  DollarSign,
  Calendar,
  TrendingUp,
  ArrowRightLeft
} from 'lucide-react'
import { TransactionStatusBadge } from './transaction-status-badge'
import { OrderStatusStepper } from './order-status-stepper'

interface CustomerDetail {
  id: string
  name: string
  whatsapp: string
  city: string
  label: string
  bankName?: string | null
  accountNumber?: string | null
  accountOwner?: string | null
}

interface TransactionDetail {
  id: string
  nominal: number
  netMargin: number
  partnerProfit: number
  ownerProfit: number
  paymentFee: number
  codFee: number
  platformFee: number
  status: string
  createdAt: string
  customer: CustomerDetail
  partner?: {
    id: string
    name: string
    bankName: string
    accountNumber: string
    accountOwner: string
    city: string
    commissionRate: number
  } | null
  paymentType: {
    id: string
    name: string
    type: string
  }
  platform: {
    id: string
    name: string
    feeRate: number
  } | null
  transactionMethod: {
    id: string
    name: string
    feeRate: number
  }
}

interface TransactionDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: TransactionDetail | null
  role: 'owner' | 'partner'
  partnerData?: {
    bankName: string
    accountNumber: string
    accountOwner: string
  } | null
}

export function TransactionDetailDialog({
  open,
  onOpenChange,
  transaction,
  role,
  partnerData
}: TransactionDetailDialogProps) {
  if (!transaction) return null

  // Customer bank details (this is the recipient)
  const customerBank = transaction.customer.bankName
  const customerAccount = transaction.customer.accountNumber
  const customerAccountOwner = transaction.customer.accountOwner

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Detail Transaksi
          </DialogTitle>
          <DialogDescription>
            Informasi lengkap transaksi dan detail rekening
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Order */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Status Order
                </CardTitle>
                <TransactionStatusBadge status={transaction.status} />
              </div>
            </CardHeader>
            <CardContent>
              <OrderStatusStepper currentStatus={transaction.status} />
            </CardContent>
          </Card>

          {/* Transaction Overview */}
          <Card className="border-emerald-200 dark:border-emerald-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Ringkasan Transaksi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nominal</p>
                  <p className="font-bold text-lg">Rp {transaction.nominal.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Net Margin</p>
                  <p className="font-bold text-lg text-emerald-600">
                    Rp {transaction.netMargin.toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Profit {role === 'owner' ? 'Owner' : 'Partner'}</p>
                  <p className="font-bold text-lg text-blue-600">
                    Rp {(role === 'owner' ? transaction.ownerProfit : transaction.partnerProfit).toLocaleString('id-ID')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tanggal</p>
                  <p className="font-semibold text-sm">
                    {new Date(transaction.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fee Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                Rincian Biaya
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Payment Fee ({transaction.paymentType.name})</span>
                  </div>
                  <span className="font-semibold text-red-600">
                    -Rp {transaction.paymentFee.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Transaction Fee ({transaction.transactionMethod.name})</span>
                  </div>
                  <span className="font-semibold text-red-600">
                    -Rp {transaction.codFee.toLocaleString('id-ID')}
                  </span>
                </div>
                {transaction.platform && (
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Platform Fee ({transaction.platform.name})</span>
                    </div>
                    <span className="font-semibold text-red-600">
                      -Rp {transaction.platformFee.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg px-3">
                  <span className="font-semibold">Total Margin</span>
                  <span className="font-bold text-emerald-600">
                    Rp {transaction.netMargin.toLocaleString('id-ID')}
                  </span>
                </div>
                {transaction.partner && role === 'owner' && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="flex items-center justify-between py-2 px-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <span className="text-sm">Profit Partner ({transaction.partner.commissionRate}%)</span>
                      <span className="font-bold text-blue-600">
                        Rp {transaction.partnerProfit.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                      <span className="text-sm">Profit Owner</span>
                      <span className="font-bold text-purple-600">
                        Rp {transaction.ownerProfit.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Details */}
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Data Customer
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{transaction.customer.label}</Badge>
                  <Badge variant={transaction.customer.label === 'VIP' ? 'default' : transaction.customer.label === 'Blacklist' ? 'destructive' : 'secondary'}>
                    {transaction.customer.label}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nama Lengkap</p>
                    <p className="font-semibold">{transaction.customer.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">No. WhatsApp</p>
                    <p className="font-semibold">{transaction.customer.whatsapp}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Kota</p>
                    <p className="font-semibold">{transaction.customer.city}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recipient Details (Customer's Bank Account) */}
            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Rekening Penerima
                </CardTitle>
                <CardDescription>
                  Rekening Customer (Penerima Transfer)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {customerBank ? (
                  <>
                    <div className="flex items-start gap-3">
                      <Building className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Bank</p>
                        <p className="font-semibold">{customerBank}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">No. Rekening</p>
                        <p className="font-semibold text-lg tracking-wider text-emerald-600">
                          {customerAccount}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <User className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Pemilik Rekening</p>
                        <p className="font-semibold">{customerAccountOwner}</p>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                        Total yang Harus Diterima
                      </p>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        Rp {(transaction.nominal - transaction.paymentFee - transaction.codFee).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Customer belum memiliki data rekening
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Transaction Flow Info */}
          <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-950/30 dark:to-emerald-950/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-blue-600">Customer</p>
                  <p className="text-xs text-gray-600">Pengirim</p>
                </div>
                <ArrowRightLeft className="w-5 h-5 text-gray-400" />
                <div className="text-center">
                  <p className="font-semibold text-purple-600">Payment System</p>
                  <p className="text-xs text-gray-600">{transaction.paymentType.name}</p>
                </div>
                <ArrowRightLeft className="w-5 h-5 text-gray-400" />
                <div className="text-center">
                  <p className="font-semibold text-emerald-600">Customer</p>
                  <p className="text-xs text-gray-600">Penerima (Rekening Sendiri)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
