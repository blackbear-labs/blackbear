'use client'

import { useState, useEffect } from 'react'
import { PartnerStatsCards } from '@/components/partner/stats/partner-stats-cards'
import { TierProgressCard } from '@/components/partner/stats/tier-progress-card'
import { LeaderboardCard } from '@/components/partner/stats/leaderboard-card'
import { BadgeHistory } from '@/components/partner/stats/badge-history'
import { PartnerTransactionItem } from '@/components/partner/transactions/transaction-item'
import { AnnouncementBanner } from '@/components/partner/notifications/announcement-banner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DollarSign,
  Activity,
  TrendingUp,
  Target,
  CreditCard,
  Users,
  Trophy,
  Plus,
} from 'lucide-react'

interface PartnerStats {
  totalProfit: number
  totalVolume: number
  totalTransactions: number
  pendingVolume: number
}

interface TierInfo {
  current: string
  next: string | null
  currentProfit: number
  requiredProfit: number
  gap: number
  badge: string
  rank: number
}

interface Transaction {
  id: string
  nominal: number
  partnerProfit: number
  customer: { name: string }
  paymentType: { name: string }
  createdAt: string
}

export default function PartnerDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<PartnerStats | null>(null)
  const [tierInfo, setTierInfo] = useState<TierInfo | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [userName, setUserName] = useState('')
  const [partnerId, setPartnerId] = useState('')

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [])

  const checkAuth = () => {
    const session = localStorage.getItem('session')
    if (!session) return

    const user = JSON.parse(session)
    if (user.role !== 'partner') return

    setUserName(user.name)
    setPartnerId(user.partnerId)
  }

  const fetchData = async () => {
    try {
      const session = localStorage.getItem('session')
      if (!session) return

      const user = JSON.parse(session)

      // Fetch partner stats
      const statsResponse = await fetch(`/api/partners/${user.partnerId}/stats`)
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
        setTierInfo(statsData.tier)
        setRecentTransactions(statsData.recentTransactions || [])
      }

    } catch (error) {
      console.error('Error fetching partner data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Selamat Datang, {userName}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Berikut ringkasan performa bisnis Anda hari ini
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Memuat data...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Announcement Banner */}
          {partnerId && <AnnouncementBanner partnerId={partnerId} />}

          {/* Stats Cards */}
          {stats && <PartnerStatsCards stats={stats} />}

          {/* Quick Actions */}
          <Card className="border-emerald-100 dark:border-emerald-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                Aksi Cepat
              </CardTitle>
              <CardDescription>
                Akses cepat ke fitur utama
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickActionButton
                  label="Input Transaksi"
                  icon={CreditCard}
                  href="/partner/dashboard/transactions"
                />
                <QuickActionButton
                  label="Kelola Customer"
                  icon={Users}
                  href="/partner/dashboard/customers"
                />
                <QuickActionButton
                  label="Lihat Leaderboard"
                  icon={Trophy}
                  href="/partner/dashboard/leaderboard"
                />
                <QuickActionButton
                  label="Pengaturan"
                  icon={Plus}
                  href="/partner/dashboard/settings"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tier Progress */}
            <div className="lg:col-span-2">
              {tierInfo && (
                <TierProgressCard
                  currentTier={tierInfo.current}
                  nextTier={tierInfo.next}
                  currentProfit={tierInfo.currentProfit}
                  requiredProfit={tierInfo.requiredProfit}
                  badge={tierInfo.badge}
                  rank={tierInfo.rank}
                />
              )}
            </div>

            {/* Leaderboard Top 5 */}
            <div>
              <LeaderboardCard
                currentUserName={userName}
                maxItems={5}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <Card className="border-emerald-100 dark:border-emerald-900">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Transaksi Terbaru</CardTitle>
                    <CardDescription>5 transaksi terakhir Anda</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/partner/dashboard/transactions">Lihat Semua</a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {recentTransactions.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                      Belum ada transaksi
                    </p>
                  ) : (
                    recentTransactions.slice(0, 5).map((tx) => (
                      <PartnerTransactionItem
                        key={tx.id}
                        id={tx.id}
                        customerName={tx.customer.name}
                        nominal={tx.nominal}
                        profit={tx.partnerProfit}
                        status="Completed"
                        paymentType={tx.paymentType.name}
                        createdAt={tx.createdAt}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Badge History */}
            {partnerId && <BadgeHistory partnerId={partnerId} />}
          </div>
        </div>
      )}
    </div>
  )
}

function QuickActionButton({ label, icon: Icon, href }: { label: string; icon: any; href: string }) {
  return (
    <Button
      variant="outline"
      className="h-auto flex-col py-4 gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200 group"
      asChild
    >
      <a href={href}>
        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-200">
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
      </a>
    </Button>
  )
}
