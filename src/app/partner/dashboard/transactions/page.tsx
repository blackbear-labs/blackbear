'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TransactionInputForm } from '@/components/partner/transactions/transaction-input-form'
import { PartnerTransactionItem } from '@/components/partner/transactions/transaction-item'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, CreditCard, RefreshCw } from 'lucide-react'
import { TransactionDetailDialog } from '@/components/transactions/transaction-detail-dialog'
import { TransactionStatusBadge } from '@/components/transactions/transaction-status-badge'

interface PartnerInfo {
  id: string
  name: string
  email: string
  commissionRate: number
  tier: string
  badge: string
  totalProfit: number
  totalVolume: number
  totalTransactions: number
}

interface Transaction {
  id: string
  nominal: number
  partnerProfit: number
  status: string
  customer: { name: string }
  paymentType: { name: string }
  platform: { name: string } | null
  transactionMethod: { name: string }
  createdAt: string
}

export default function PartnerTransactionsPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  // Transaction Detail Dialog
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchPartnerInfo()
    fetchTransactions()
  }, [])

  const fetchPartnerInfo = async () => {
    try {
      const session = localStorage.getItem('session')
      if (!session) return

      const user = JSON.parse(session)
      if (!user.partnerId) {
        console.error('No partnerId in session')
        return
      }

      const response = await fetch(`/api/partners/${user.partnerId}`)
      if (response.ok) {
        const data = await response.json()
        setPartnerInfo(data.partner)
      } else {
        console.error('Failed to fetch partner info:', response.status)
      }
    } catch (error) {
      console.error('Error fetching partner info:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const session = localStorage.getItem('session')
      if (!session) return

      const user = JSON.parse(session)
      if (!user.partnerId) return

      const response = await fetch(`/api/partners/${user.partnerId}/stats`)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.recentTransactions || [])
      } else {
        console.error('Failed to fetch transactions:', response.status)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const filteredTransactions = transactions.filter(tx => {
    if (!tx.customer) return false
    const customerName = tx.customer.name || ''
    const paymentTypeName = tx.paymentType?.name || ''
    const platformName = tx.platform?.name || ''

    return (
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paymentTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      platformName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleViewDetail = async (transactionId: string) => {
    setLoadingDetail(true)
    try {
      const response = await fetch(`/api/transactions/${transactionId}`)
      const data = await response.json()

      if (data.transaction) {
        setSelectedTransaction(data.transaction)
        setShowDetailDialog(true)
      }
    } catch (error) {
      console.error('Error fetching transaction detail:', error)
    } finally {
      setLoadingDetail(false)
    }
  }

  if (!mounted) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!partnerInfo) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CreditCard className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Gagal memuat data partner. Silakan login kembali.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Input Transaksi
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Buat transaksi baru untuk customer Anda
          </p>
        </div>
      </div>

      {/* Transaction Input Form */}
      <TransactionInputForm
        partnerId={partnerInfo.id}
        partnerInfo={partnerInfo}
        onSuccess={fetchTransactions}
      />

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Transaksi Terbaru</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Riwayat transaksi Anda
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTransactions}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari ID, nama, atau tipe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Transaction List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm
                    ? 'Tidak ada transaksi yang cocok dengan pencarian'
                    : 'Belum ada transaksi. Mulai buat transaksi pertama Anda!'}
                </p>
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <PartnerTransactionItem
                  key={tx.id}
                  id={tx.id}
                  customerName={tx.customer?.name || 'Unknown'}
                  nominal={tx.nominal}
                  profit={tx.partnerProfit}
                  status={tx.status as 'Completed' | 'Pending' | 'Failed'}
                  paymentType={tx.paymentType?.name || 'Unknown'}
                  createdAt={tx.createdAt}
                  onViewDetail={handleViewDetail}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Detail Dialog */}
      <TransactionDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        transaction={selectedTransaction}
        role="partner"
      />
    </div>
  )
}
