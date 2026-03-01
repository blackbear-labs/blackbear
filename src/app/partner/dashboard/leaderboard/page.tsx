'use client'

import { useState, useEffect } from 'react'
import { LeaderboardTable } from '@/components/partner/leaderboard/leaderboard-table'
import { MonthlyHistory } from '@/components/partner/leaderboard/monthly-history'
import { GamificationSummary } from '@/components/partner/leaderboard/gamification-summary'
import { Trophy, RefreshCw, Search, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface LeaderboardEntry {
  rank: number
  name: string
  totalProfit: number
  tier: string
  totalTransactions?: number
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [tierFilter, setTierFilter] = useState<string>('All')
  const [userName, setUserName] = useState('')
  const [partnerId, setPartnerId] = useState('')

  useEffect(() => {
    checkAuth()
    fetchLeaderboard()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkAuth = () => {
    const session = localStorage.getItem('session')
    if (!session) return

    const user = JSON.parse(session)
    if (user.role !== 'partner') return

    setUserName(user.name)
    setPartnerId(user.partnerId)
  }

  const fetchLeaderboard = async () => {
    try {
      if (!refreshing) setRefreshing(true)
      setError(null)

      const response = await fetch('/api/partners/leaderboard')
      if (!response.ok) {
        throw new Error('Gagal mengambil data leaderboard')
      }

      const data = await response.json()
      setLeaderboard(data.leaderboard || [])
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
      setError('Terjadi kesalahan saat mengambil data leaderboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    await fetchLeaderboard()
  }

  const filteredLeaderboard = leaderboard.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTier = tierFilter === 'All' || item.tier === tierFilter
    return matchesSearch && matchesTier
  })

  const top5Leaderboard = filteredLeaderboard.slice(0, 5)

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Leaderboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Lihat peringkat Anda di antara partner lain
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Gamification Summary */}
      {partnerId && (
        <GamificationSummary partnerId={partnerId} />
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Riwayat Bulanan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-6">
          {/* Search and Filters */}
          <Card className="border-emerald-100 dark:border-emerald-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-600" />
                Filter & Pencarian
              </CardTitle>
              <CardDescription>
                Cari dan filter leaderboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Cari nama partner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['All', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'].map((tier) => (
                    <Badge
                      key={tier}
                      variant={tierFilter === tier ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all duration-200 ${
                        tierFilter === tier
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                      }`}
                      onClick={() => setTierFilter(tier)}
                    >
                      {tier === 'All' ? 'Semua' : tier}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top 5 Global Leaderboard */}
          <Card className="border-emerald-100 dark:border-emerald-900">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Top 5 Leaderboard Global
                  </CardTitle>
                  <CardDescription>
                    Peringkat 5 teratas berdasarkan profit 30 hari
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                    {filteredLeaderboard.length} Partner
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading && !refreshing ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Memuat leaderboard...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                  >
                    Coba Lagi
                  </Button>
                </div>
              ) : top5Leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Belum ada data leaderboard
                  </p>
                </div>
              ) : (
                <LeaderboardTable
                  leaderboard={top5Leaderboard}
                  currentUserName={userName}
                  onRefresh={handleRefresh}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          {partnerId && <MonthlyHistory partnerId={partnerId} />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
