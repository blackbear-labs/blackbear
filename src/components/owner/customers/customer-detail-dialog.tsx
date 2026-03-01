'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DollarSign,
  Activity,
  TrendingUp,
  MapPin,
  Phone,
  Building2,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react'

interface Transaction {
  id: string
  nominal: number
  netMargin: number
  ownerProfit: number
  paymentType: { name: string }
  platform: { name: string } | null
  transactionMethod: { name: string }
  createdAt: string
}

interface CustomerDetail {
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
  transactions?: Transaction[]
}

interface CustomerDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: CustomerDetail | null
}

export function CustomerDetailDialog({ open, onOpenChange, customer }: CustomerDetailDialogProps) {
  const [loading, setLoading] = useState(false)
  const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(null)

  useEffect(() => {
    if (open && customer?.id) {
      fetchCustomerDetail(customer.id)
    } else if (!open) {
      setCustomerDetail(null)
    }
  }, [open, customer])

  const fetchCustomerDetail = async (customerId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/customers/${customerId}`)
      const data = await response.json()

      if (data.customer) {
        setCustomerDetail(data.customer)
      }
    } catch (error) {
      console.error('Error fetching customer detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const displayCustomer = customerDetail || customer

  if (!displayCustomer) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Customer</DialogTitle>
          <DialogDescription>
            Informasi lengkap dan statistik customer
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-sm text-gray-500">Memuat data...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Kontribusi Profit
                    </p>
                  </div>
                  <p className="text-xl font-bold text-blue-600">
                    Rp {displayCustomer.totalProfit.toLocaleString('id-ID')}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Transaksi
                    </p>
                  </div>
                  <p className="text-xl font-bold text-emerald-600">
                    {displayCustomer.totalTransactions}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Volume
                    </p>
                  </div>
                  <p className="text-xl font-bold text-purple-600">
                    Rp {displayCustomer.totalVolume.toLocaleString('id-ID')}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Informasi</TabsTrigger>
                <TabsTrigger value="transactions">Transaksi Terbaru</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{displayCustomer.name}</p>
                        <Badge
                          variant={
                            displayCustomer.label === 'VIP' ? 'default' :
                            displayCustomer.label === 'Blacklist' ? 'destructive' :
                            'secondary'
                          }
                          className={
                            displayCustomer.label === 'VIP' ? 'bg-purple-600 hover:bg-purple-700' :
                            displayCustomer.label === 'Blacklist' ? '' :
                            ''
                          }
                        >
                          {displayCustomer.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">WhatsApp:</span>
                        <span className="font-medium">{displayCustomer.whatsapp}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Kota:</span>
                        <span className="font-medium">{displayCustomer.city}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Bank:</span>
                        <span className="font-medium">{displayCustomer.bankName || '-'}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">No. Rekening:</span>
                        <span className="font-medium">{displayCustomer.accountNumber || '-'}</span>
                      </div>

                      <div className="flex items-start gap-2 md:col-span-2">
                        <span className="text-sm text-gray-600">Nama Pemilik:</span>
                        <span className="font-medium">{displayCustomer.accountOwner || '-'}</span>
                      </div>

                      <div className="flex items-start gap-2 md:col-span-2">
                        <User className="w-4 h-4 text-gray-400 mt-0.5" />
                        <span className="text-sm text-gray-600">Partner:</span>
                        <span className="font-medium">
                          {displayCustomer.partner ? displayCustomer.partner.name : 'Tanpa Partner'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Terdaftar Sejak:</span>
                        <span className="font-medium">
                          {new Date(displayCustomer.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transactions">
                <Card>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[400px]">
                      {displayCustomer.transactions && displayCustomer.transactions.length > 0 ? (
                        <div className="divide-y">
                          {displayCustomer.transactions.map((transaction) => (
                            <div
                              key={transaction.id}
                              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold">
                                      Rp {transaction.nominal.toLocaleString('id-ID')}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {transaction.paymentType.name}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {transaction.transactionMethod.name}
                                    {transaction.platform && ` - ${transaction.platform.name}`}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(transaction.createdAt).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-emerald-600">
                                    +Rp {transaction.netMargin.toLocaleString('id-ID')}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Profit: Rp {transaction.ownerProfit.toLocaleString('id-ID')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                          <AlertCircle className="w-12 h-12 mb-4 text-gray-400" />
                          <p>Belum ada transaksi</p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
