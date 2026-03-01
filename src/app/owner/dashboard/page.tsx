'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Calendar,
  BarChart3,
  Target,
  Clock,
  CheckCircle2,
  Search,
  XCircle,
  Building2,
  MapPin,
  PieChart,
  ArrowRight,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

interface Stats {
  totalProfit: number
  totalVolume: number
  totalTransactions: number
  activePartners: number
  totalCustomers: number
  avgProfitMargin: number
}

interface GrowthRates {
  profit: {
    daily: number
    weekly: number
    monthly: number
  }
  volume: {
    daily: number
    weekly: number
    monthly: number
  }
}

interface DailyStats {
  today: { profit: number; volume: number; transactions: number }
  yesterday: { profit: number; volume: number; transactions: number }
}

interface WeeklyStats {
  current: { profit: number; volume: number; transactions: number }
  previous: { profit: number; volume: number; transactions: number }
}

interface MonthlyStats {
  current: { profit: number; volume: number; transactions: number }
  previous: { profit: number; volume: number; transactions: number }
}

interface StatusDistribution {
  status: string
  _count: { id: number }
  _sum: { nominal: number; ownerProfit: number }
}

interface RecentTransaction {
  id: string
  nominal: number
  ownerProfit: number
  status: string
  customer: { name: string; city: string }
  partner: { name: string } | null
  paymentType: { name: string }
  transactionMethod: { name: string }
  createdAt: string
}

interface TopPartner {
  id: string
  name: string
  totalProfit: number
  totalTransactions: number
  tier: string
}

interface TopCustomer {
  id: string
  name: string
  city: string
  totalProfit: number
  totalVolume: number
  totalTransactions: number
}

interface CityDistribution {
  city: string
  _count: { id: number }
  _sum: { totalVolume: number; totalProfit: number }
}

interface PaymentMethodPerformance {
  id: string
  name: string
  feeRate: number
  transactionCount: number
  totalVolume: number
  totalProfit: number
  avgTransactionSize: number
}

interface MonthlyTrend {
  month: string
  profit: number
  volume: number
  transactions: number
  totalFees: number
}

export default function OwnerDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [growth, setGrowth] = useState<GrowthRates | null>(null)
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null)
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null)
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null)
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([])
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [topPartners, setTopPartners] = useState<TopPartner[]>([])
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([])
  const [cityDistribution, setCityDistribution] = useState<CityDistribution[]>([])
  const [paymentMethodPerformance, setPaymentMethodPerformance] = useState<PaymentMethodPerformance[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([])
  const [userName, setUserName] = useState('')

  useEffect(() => {
    setMounted(true)
    checkAuth()
    fetchData()
  }, [])

  const checkAuth = () => {
    const session = localStorage.getItem('session')
    if (!session) {
      router.push('/login')
      return
    }

    const user = JSON.parse(session)
    if (user.role !== 'owner') {
      router.push('/partner/dashboard')
      return
    }

    setUserName(user.name)
  }

  const fetchData = async () => {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()

      setStats(data.stats)
      setGrowth(data.growth)
      setDailyStats(data.dailyStats)
      setWeeklyStats(data.weeklyStats)
      setMonthlyStats(data.monthlyStats)
      setStatusDistribution(data.statusDistribution || [])
      setRecentTransactions(data.recentTransactions || [])
      setTopPartners(data.topPartners || [])
      setTopCustomers(data.topCustomers || [])
      setCityDistribution(data.cityDistribution || [])
      setPaymentMethodPerformance(data.paymentMethodPerformance || [])
      setMonthlyTrends(data.monthlyStats || [])
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data dashboard',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Command Center
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview performa bisnis dan aktivitas terkini
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Cards with Growth Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard
              title="Total Profit"
              value={`Rp ${(stats?.totalProfit || 0).toLocaleString('id-ID')}`}
              icon={DollarSign}
              growth={growth?.profit?.monthly || 0}
              growthPeriod="bulan ini"
              color="emerald"
            />
            <KpiCard
              title="Total Volume"
              value={`Rp ${(stats?.totalVolume || 0).toLocaleString('id-ID')}`}
              icon={TrendingUp}
              growth={growth?.volume?.monthly || 0}
              growthPeriod="bulan ini"
              color="blue"
            />
            <KpiCard
              title="Total Transaksi"
              value={(stats?.totalTransactions || 0).toLocaleString()}
              icon={Activity}
              growth={null}
              growthPeriod="-"
              color="purple"
            />
            <KpiCard
              title="Profit Margin"
              value={`${((stats?.avgProfitMargin || 0) * 100).toFixed(1)}%`}
              icon={Target}
              growth={null}
              growthPeriod="rata-rata"
              color="amber"
            />
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SecondaryMetricCard
              title="Mitra Aktif"
              value={stats?.activePartners || 0}
              icon={Users}
              color="indigo"
              description="Total partner yang aktif"
            />
            <SecondaryMetricCard
              title="Total Customer"
              value={stats?.totalCustomers || 0}
              icon={Building2}
              color="rose"
              description="Total pelanggan terdaftar"
            />
            <SecondaryMetricCard
              title="Transaksi Bulan Ini"
              value={monthlyStats?.current?.transactions || 0}
              icon={Calendar}
              color="teal"
              description={`Target: Rp ${((monthlyStats?.current?.profit || 0) * 1.2).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`}
            />
          </div>

          {/* Revenue Trend Chart */}
          <RevenueTrendChart monthlyTrends={monthlyTrends} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <StatusDistributionCard statusDistribution={statusDistribution} />

            {/* Payment Method Performance */}
            <PaymentMethodPerformanceCard paymentMethodPerformance={paymentMethodPerformance} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Transactions */}
            <div className="lg:col-span-2">
              <RecentTransactionsCard recentTransactions={recentTransactions} />
            </div>

            {/* Top Partners */}
            <TopPartnersCard topPartners={topPartners} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Customers */}
            <TopCustomersCard topCustomers={topCustomers} />

            {/* City Distribution */}
            <CityDistributionCard cityDistribution={cityDistribution} />
          </div>

          {/* Smart Alerts */}
          <SmartAlertsCard
            stats={stats}
            topPartners={topPartners}
            growth={growth}
            dailyStats={dailyStats}
          />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
              <CardDescription>Akses cepat ke fitur utama</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <QuickActionButton
                  label="Input Transaksi"
                  icon={CreditCard}
                  href="/owner/dashboard/transactions"
                />
                <QuickActionButton
                  label="Kelola Mitra"
                  icon={Users}
                  href="/owner/dashboard/partners"
                />
                <QuickActionButton
                  label="Lihat Customer"
                  icon={Building2}
                  href="/owner/dashboard/customers"
                />
                <QuickActionButton
                  label="Laporan Detail"
                  icon={BarChart3}
                  href="#"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// KPI Card Component
function KpiCard({
  title,
  value,
  icon: Icon,
  growth,
  growthPeriod,
  color
}: {
  title: string
  value: string
  icon: any
  growth: number | null
  growthPeriod: string
  color: string
}) {
  const colorClasses = {
    emerald: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
    blue: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white',
    purple: 'bg-gradient-to-br from-violet-500 to-purple-600 text-white',
    amber: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white',
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{value}</p>
            {growth !== null && (
              <div className="flex items-center">
                {growth >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-600 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-rose-600 mr-1" />
                )}
                <span className={`text-sm ${growth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% {growthPeriod}
                </span>
              </div>
            )}
            {growth === null && (
              <p className="text-xs text-muted-foreground">{growthPeriod}</p>
            )}
          </div>
          <div className={`p-4 rounded-xl ${colorClasses[color as keyof typeof colorClasses]} shadow-md`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Secondary Metric Card Component
function SecondaryMetricCard({
  title,
  value,
  icon: Icon,
  color,
  description
}: {
  title: string
  value: number
  icon: any
  color: string
  description: string
}) {
  const colorClasses = {
    indigo: 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white',
    rose: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white',
    teal: 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white',
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className={`p-4 rounded-xl ${colorClasses[color as keyof typeof colorClasses]} shadow-md`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Revenue Trend Chart Component
function RevenueTrendChart({ monthlyTrends }: { monthlyTrends: MonthlyTrend[] }) {
  const maxProfit = Math.max(...monthlyTrends.map(t => t.profit || 0), 1)
  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-emerald-600" />
          Tren Revenue (6 Bulan Terakhir)
        </CardTitle>
        <CardDescription>
          Tren profit dan volume transaksi per bulan
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {!monthlyTrends || monthlyTrends.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Belum ada data</p>
        ) : (
          <div className="space-y-4">
            {/* Chart Visualization */}
            <div className="relative h-48 flex items-end gap-2 border-b pb-4">
              {monthlyTrends.map((trend, index) => {
                const profit = trend.profit || 0
                const height = maxProfit > 0 ? (profit / maxProfit) * 100 : 0
                const [year, month] = trend.month.split('-').map(Number)
                return (
                  <div key={trend.month} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all hover:from-emerald-700 hover:to-emerald-500 relative group"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    >
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        Rp {profit.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground mt-2">
                      {monthNames[month] || month}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Profit</p>
                <p className="font-semibold text-emerald-600">
                  Rp {monthlyTrends.reduce((sum, t) => sum + (t.profit || 0), 0).toLocaleString('id-ID')}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Volume</p>
                <p className="font-semibold text-blue-600">
                  Rp {monthlyTrends.reduce((sum, t) => sum + (t.volume || 0), 0).toLocaleString('id-ID')}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Transaksi</p>
                <p className="font-semibold text-purple-600">
                  {monthlyTrends.reduce((sum, t) => sum + (t.transactions || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Status Distribution Card Component
function StatusDistributionCard({ statusDistribution }: { statusDistribution: StatusDistribution[] }) {
  const statusConfig: Record<string, { icon: any; color: string; bgColor: string; barColor: string }> = {
    Pending: { 
      icon: Clock, 
      color: 'text-amber-600 dark:text-amber-400', 
      bgColor: 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800',
      barColor: 'bg-gradient-to-r from-amber-400 to-orange-500'
    },
    Verifikasi: { 
      icon: Search, 
      color: 'text-blue-600 dark:text-blue-400', 
      bgColor: 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800',
      barColor: 'bg-gradient-to-r from-blue-400 to-indigo-500'
    },
    Proses: { 
      icon: RefreshCw, 
      color: 'text-violet-600 dark:text-violet-400', 
      bgColor: 'bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200 dark:border-violet-800',
      barColor: 'bg-gradient-to-r from-violet-400 to-purple-500'
    },
    Berhasil: { 
      icon: CheckCircle2, 
      color: 'text-emerald-600 dark:text-emerald-400', 
      bgColor: 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800',
      barColor: 'bg-gradient-to-r from-emerald-400 to-teal-500'
    },
  }

  const total = statusDistribution.reduce((sum, s) => sum + (s._count?.id || 0), 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PieChart className="w-5 h-5 mr-2 text-purple-600" />
          Distribusi Status Transaksi
        </CardTitle>
        <CardDescription>
          Status transaksi saat ini
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {!statusDistribution || statusDistribution.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Belum ada data</p>
        ) : (
          <div className="space-y-3">
            {statusDistribution.map((status) => {
              const config = statusConfig[status.status] || statusConfig['Pending']
              const Icon = config.icon
              const count = status._count?.id || 0
              const percentage = total > 0 ? (count / total) * 100 : 0

              return (
                <div key={status.status} className="flex items-center gap-4 p-3 rounded-xl border transition-all hover:shadow-sm">
                  <div className={`p-3 rounded-xl ${config.bgColor} border`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{status.status}</span>
                      <span className="text-xs text-muted-foreground font-medium">{count} transaksi</span>
                    </div>
                    <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${config.barColor} rounded-full transition-all shadow-sm`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold w-16 text-right bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">{percentage.toFixed(0)}%</span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Payment Method Performance Card Component
function PaymentMethodPerformanceCard({ paymentMethodPerformance }: { paymentMethodPerformance: PaymentMethodPerformance[] }) {
  const totalVolume = paymentMethodPerformance.reduce((sum, pm) => sum + (pm.totalVolume || 0), 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-violet-600" />
          Performa Metode Transaksi
        </CardTitle>
        <CardDescription>
          Volume dan profit per metode transaksi
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {!paymentMethodPerformance || paymentMethodPerformance.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Belum ada data</p>
        ) : (
          <div className="space-y-4">
            {paymentMethodPerformance.map((method, index) => {
              const volume = method.totalVolume || 0
              const profit = method.totalProfit || 0
              const txCount = method.transactionCount || 0
              const percentage = totalVolume > 0 ? (volume / totalVolume) * 100 : 0

              const gradientColors = [
                'from-violet-500 to-purple-600',
                'from-blue-500 to-indigo-600',
                'from-cyan-500 to-blue-600',
                'from-teal-500 to-cyan-600',
                'from-emerald-500 to-teal-600',
              ]

              return (
                <div key={method.id} className="p-4 rounded-xl border bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradientColors[index % gradientColors.length]} flex items-center justify-center text-white shadow-sm`}>
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{method.name}</p>
                        <p className="text-xs text-muted-foreground font-medium">
                          {txCount} transaksi • Fee: {((method.feeRate || 0) * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                        Rp {profit.toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-muted-foreground">{percentage.toFixed(0)}% volume</p>
                    </div>
                  </div>
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${gradientColors[index % gradientColors.length]} rounded-full transition-all shadow-sm`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Recent Transactions Card Component
function RecentTransactionsCard({ recentTransactions }: { recentTransactions: RecentTransaction[] }) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Pending: 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 dark:from-amber-900/30 dark:to-orange-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      Verifikasi: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      Proses: 'bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 dark:from-violet-900/30 dark:to-purple-900/30 dark:text-violet-400 border-violet-200 dark:border-violet-800',
      Berhasil: 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 dark:from-emerald-900/30 dark:to-teal-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    }
    return colors[status] || colors['Pending']
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <CardDescription>10 transaksi terakhir</CardDescription>
          </div>
          <Link href="/owner/dashboard/transactions">
            <Button variant="ghost" size="sm" className="gap-1 hover:bg-violet-100 dark:hover:bg-violet-900/30">
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {!recentTransactions || recentTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Belum ada transaksi</p>
          ) : (
            recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 hover:shadow-md transition-all">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{tx.customer?.name || 'Unknown'}</p>
                    <Badge className={`text-xs ${getStatusColor(tx.status || 'Pending')} border`}>
                      {tx.status || 'Pending'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {tx.paymentType?.name || '-'} • {tx.transactionMethod?.name || '-'}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Rp {(tx.ownerProfit || 0).toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('id-ID') : '-'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Top Partners Card Component
function TopPartnersCard({ topPartners }: { topPartners: TopPartner[] }) {
  const rankStyles = [
    { bg: 'bg-gradient-to-br from-yellow-400 to-amber-500', shadow: 'shadow-yellow-200 dark:shadow-yellow-900/30' },
    { bg: 'bg-gradient-to-br from-slate-300 to-gray-400', shadow: 'shadow-gray-200 dark:shadow-gray-900/30' },
    { bg: 'bg-gradient-to-br from-amber-600 to-orange-600', shadow: 'shadow-amber-200 dark:shadow-amber-900/30' },
    { bg: 'bg-gradient-to-br from-slate-400 to-slate-500', shadow: 'shadow-slate-200 dark:shadow-slate-900/30' },
    { bg: 'bg-gradient-to-br from-slate-500 to-slate-600', shadow: 'shadow-slate-200 dark:shadow-slate-900/30' },
  ]

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Top 5 Mitra</CardTitle>
            <CardDescription>Berdasarkan total profit</CardDescription>
          </div>
          <Link href="/owner/dashboard/partners">
            <Button variant="ghost" size="sm" className="gap-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/30">
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {!topPartners || topPartners.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Belum ada data mitra</p>
          ) : (
            topPartners.map((partner, index) => (
              <div key={partner.id} className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${rankStyles[index].bg} ${rankStyles[index].shadow} text-white flex items-center justify-center font-bold text-sm shadow-md`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{partner.name}</p>
                    <p className="text-xs text-muted-foreground font-medium">{partner.tier || '-'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    Rp {(partner.totalProfit || 0).toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-muted-foreground">{partner.totalTransactions || 0} tx</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Top Customers Card Component
function TopCustomersCard({ topCustomers }: { topCustomers: TopCustomer[] }) {
  const gradientColors = [
    'from-rose-500 to-pink-600',
    'from-pink-500 to-rose-600',
    'from-fuchsia-500 to-pink-600',
    'from-purple-500 to-fuchsia-600',
    'from-violet-500 to-purple-600',
    'from-indigo-500 to-violet-600',
    'from-blue-500 to-indigo-600',
    'from-cyan-500 to-blue-600',
    'from-teal-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
  ]

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Top 10 Customer</CardTitle>
            <CardDescription>Berdasarkan total profit</CardDescription>
          </div>
          <Link href="/owner/dashboard/customers">
            <Button variant="ghost" size="sm" className="gap-1 hover:bg-rose-100 dark:hover:bg-rose-900/30">
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {!topCustomers || topCustomers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Belum ada data customer</p>
          ) : (
            topCustomers.map((customer, index) => (
              <div key={customer.id} className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientColors[index % gradientColors.length]} text-white flex items-center justify-center font-bold text-sm shadow-md`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{customer.name}</p>
                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {customer.city || '-'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                    Rp {(customer.totalProfit || 0).toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-muted-foreground">{customer.totalTransactions || 0} tx</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// City Distribution Card Component
function CityDistributionCard({ cityDistribution }: { cityDistribution: CityDistribution[] }) {
  const totalCustomers = cityDistribution.reduce((sum, city) => sum + (city._count?.id || 0), 0)
  const topCities = cityDistribution.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-rose-600" />
          Distribusi Kota
        </CardTitle>
        <CardDescription>
          Customer terbanyak per kota
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {!cityDistribution || cityDistribution.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Belum ada data</p>
        ) : (
          <div className="space-y-3">
            {topCities.map((city) => {
              const count = city._count?.id || 0
              const profit = city._sum?.totalProfit || 0
              const percentage = totalCustomers > 0 ? (count / totalCustomers) * 100 : 0

              return (
                <div key={city.city} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{city.city || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">
                        {count} customer • Rp {profit.toLocaleString('id-ID')} profit
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-rose-600">{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Smart Alerts Card Component
function SmartAlertsCard({
  stats,
  topPartners,
  growth,
  dailyStats
}: {
  stats: Stats | null
  topPartners: TopPartner[]
  growth: GrowthRates | null
  dailyStats: DailyStats | null
}) {
  const alerts = []

  // Profit growth alert
  if (growth && growth.profit.monthly !== undefined && growth.profit.monthly !== null) {
    if (growth.profit.monthly > 0) {
      alerts.push({
        type: 'success' as const,
        title: 'Profit Meningkat',
        message: `Profit bulan ini naik ${growth.profit.monthly.toFixed(1)}% dibandingkan bulan lalu`
      })
    } else if (growth.profit.monthly < 0) {
      alerts.push({
        type: 'warning' as const,
        title: 'Profit Menurun',
        message: `Profit bulan ini turun ${Math.abs(growth.profit.monthly).toFixed(1)}% dibandingkan bulan lalu`
      })
    }
  }

  // Top partner alert
  if (topPartners && topPartners.length > 0) {
    alerts.push({
      type: 'info' as const,
      title: 'Top Performer',
      message: `${topPartners[0].name} adalah mitra terbaik dengan profit Rp ${(topPartners[0].totalProfit || 0).toLocaleString('id-ID')}`
    })
  }

  // Daily performance alert
  if (dailyStats && dailyStats.today && dailyStats.today.transactions > 0) {
    alerts.push({
      type: 'success' as const,
      title: 'Hari Ini Produktif',
      message: `${dailyStats.today.transactions} transaksi hari ini dengan profit Rp ${(dailyStats.today.profit || 0).toLocaleString('id-ID')}`
    })
  }

  // Average margin alert
  if (stats && stats.avgProfitMargin && stats.avgProfitMargin > 0.05) {
    alerts.push({
      type: 'success' as const,
      title: 'Margin Sehat',
      message: `Profit margin rata-rata ${(stats.avgProfitMargin * 100).toFixed(1)}% di atas target`
    })
  }

  if (alerts.length === 0) {
    alerts.push({
      type: 'info' as const,
      title: 'Selamat Datang',
      message: 'Mulai transaksi untuk melihat insight bisnis Anda'
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-amber-600" />
          Smart Insights
        </CardTitle>
        <CardDescription>
          Insight dan notifikasi penting untuk bisnis Anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <AlertItem key={index} type={alert.type} title={alert.title} message={alert.message} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function AlertItem({
  type,
  title,
  message
}: {
  type: 'success' | 'warning' | 'info'
  title: string
  message: string
}) {
  const typeClasses = {
    success: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
    info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
  }

  const iconColor = {
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    info: 'text-blue-600 dark:text-blue-400',
  }

  const icons = {
    success: CheckCircle2,
    warning: AlertTriangle,
    info: Search,
  }

  const Icon = icons[type]

  return (
    <div className={`p-4 rounded-lg border ${typeClasses[type]}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 ${iconColor[type]}`} />
        <div className="flex-1">
          <p className="font-semibold text-sm mb-1">{title}</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  )
}

function QuickActionButton({
  label,
  icon: Icon,
  href
}: {
  label: string
  icon: any
  href: string
}) {
  return (
    <Button
      variant="outline"
      className="h-auto flex-col py-4 gap-2"
      asChild
    >
      <a href={href}>
        <Icon className="w-6 h-6" />
        <span className="text-xs">{label}</span>
      </a>
    </Button>
  )
}
