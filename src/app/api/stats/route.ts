import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    // Get total stats
    const totalProfit = await db.transaction.aggregate({
      _sum: { ownerProfit: true },
      where: { status: 'Berhasil' }
    })

    const totalVolume = await db.transaction.aggregate({
      _sum: { nominal: true },
      where: { status: 'Berhasil' }
    })

    const totalTransactions = await db.transaction.count({
      where: { status: 'Berhasil' }
    })

    const activePartners = await db.partner.count({
      where: { status: 'Active' }
    })

    const totalCustomers = await db.customer.count()

    // Average profit margin
    const avgMargin = await db.transaction.aggregate({
      _avg: { ownerProfit: true, nominal: true },
      where: { status: 'Berhasil' }
    })

    const avgProfitMargin = avgMargin._avg.nominal && avgMargin._avg.nominal > 0
      ? (avgMargin._avg.ownerProfit || 0) / avgMargin._avg.nominal
      : 0

    // Daily stats (today vs yesterday)
    const todayStats = await db.transaction.aggregate({
      _sum: { ownerProfit: true, nominal: true },
      _count: { id: true },
      where: {
        status: 'Berhasil',
        createdAt: { gte: today }
      }
    })

    const yesterdayStats = await db.transaction.aggregate({
      _sum: { ownerProfit: true, nominal: true },
      _count: { id: true },
      where: {
        status: 'Berhasil',
        createdAt: { gte: yesterday, lt: today }
      }
    })

    // Weekly stats (last 7 days vs previous 7 days)
    const currentWeekStats = await db.transaction.aggregate({
      _sum: { ownerProfit: true, nominal: true },
      _count: { id: true },
      where: {
        status: 'Berhasil',
        createdAt: { gte: sevenDaysAgo }
      }
    })

    const previousWeekStart = new Date(sevenDaysAgo)
    previousWeekStart.setDate(previousWeekStart.getDate() - 7)

    const previousWeekStats = await db.transaction.aggregate({
      _sum: { ownerProfit: true, nominal: true },
      _count: { id: true },
      where: {
        status: 'Berhasil',
        createdAt: { gte: previousWeekStart, lt: sevenDaysAgo }
      }
    })

    // Monthly stats (this month vs last month)
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const thisMonthStats = await db.transaction.aggregate({
      _sum: { ownerProfit: true, nominal: true },
      _count: { id: true },
      where: {
        status: 'Berhasil',
        createdAt: { gte: thisMonthStart }
      }
    })

    const lastMonthStats = await db.transaction.aggregate({
      _sum: { ownerProfit: true, nominal: true },
      _count: { id: true },
      where: {
        status: 'Berhasil',
        createdAt: { gte: lastMonthStart, lt: thisMonthStart }
      }
    })

    // Status distribution
    const statusDistribution = await db.transaction.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { nominal: true, ownerProfit: true }
    })

    // Get recent transactions
    const recentTransactions = await db.transaction.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        partner: true,
        paymentType: true,
        transactionMethod: true
      }
    })

    // Get top 5 partners
    const topPartners = await db.partner.findMany({
      take: 5,
      orderBy: { totalProfit: 'desc' },
      where: { status: 'Active' }
    })

    // Get top 10 customers
    const topCustomers = await db.customer.findMany({
      take: 10,
      orderBy: { totalProfit: 'desc' }
    })

    // City distribution
    const cityDistribution = await db.customer.groupBy({
      by: ['city'],
      _count: { id: true },
      _sum: { totalVolume: true, totalProfit: true },
      orderBy: { _count: { id: 'desc' } }
    })

    // Payment method performance
    const paymentMethods = await db.transactionMethod.findMany({
      where: { isActive: true },
      include: {
        transactions: {
          where: { status: 'Berhasil' }
        }
      }
    })

    const paymentMethodPerformance = paymentMethods.map(pm => ({
      id: pm.id,
      name: pm.name,
      feeRate: pm.feeRate,
      transactionCount: pm.transactions.length,
      totalVolume: pm.transactions.reduce((sum, t) => sum + t.nominal, 0),
      totalProfit: pm.transactions.reduce((sum, t) => sum + t.ownerProfit, 0),
      avgTransactionSize: pm.transactions.length > 0
        ? pm.transactions.reduce((sum, t) => sum + t.nominal, 0) / pm.transactions.length
        : 0
    })).sort((a, b) => b.totalVolume - a.totalVolume)

    // Payment type performance
    const paymentTypes = await db.paymentType.findMany({
      where: { isActive: true },
      include: {
        transactions: {
          where: { status: 'Berhasil' }
        }
      }
    })

    const paymentTypePerformance = paymentTypes.map(pt => ({
      id: pt.id,
      name: pt.name,
      type: pt.type,
      transactionCount: pt.transactions.length,
      totalVolume: pt.transactions.reduce((sum, t) => sum + t.nominal, 0),
      totalProfit: pt.transactions.reduce((sum, t) => sum + t.ownerProfit, 0)
    })).sort((a, b) => b.totalVolume - a.totalVolume)

    // Get monthly stats for the last 6 months
    const monthlyTransactions = await db.transaction.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
        status: 'Berhasil'
      },
      select: {
        createdAt: true,
        ownerProfit: true,
        nominal: true,
        paymentFee: true,
        codFee: true
      },
      orderBy: { createdAt: 'asc' }
    })

    // Aggregate by month
    const monthlyStatsMap = new Map()
    monthlyTransactions.forEach(t => {
      const month = new Date(t.createdAt).toISOString().slice(0, 7) // YYYY-MM
      if (!monthlyStatsMap.has(month)) {
        monthlyStatsMap.set(month, {
          month,
          profit: 0,
          volume: 0,
          transactions: 0,
          totalFees: 0
        })
      }
      const stats = monthlyStatsMap.get(month)
      stats.profit += t.ownerProfit
      stats.volume += t.nominal
      stats.transactions += 1
      stats.totalFees += (t.paymentFee + t.codFee)
    })

    const monthlyStats = Array.from(monthlyStatsMap.values())

    // Calculate growth rates
    const profitGrowth = {
      daily: yesterdayStats._sum.ownerProfit && yesterdayStats._sum.ownerProfit > 0
        ? ((todayStats._sum.ownerProfit || 0) - yesterdayStats._sum.ownerProfit) / yesterdayStats._sum.ownerProfit * 100
        : 0,
      weekly: previousWeekStats._sum.ownerProfit && previousWeekStats._sum.ownerProfit > 0
        ? ((currentWeekStats._sum.ownerProfit || 0) - previousWeekStats._sum.ownerProfit) / previousWeekStats._sum.ownerProfit * 100
        : 0,
      monthly: lastMonthStats._sum.ownerProfit && lastMonthStats._sum.ownerProfit > 0
        ? ((thisMonthStats._sum.ownerProfit || 0) - lastMonthStats._sum.ownerProfit) / lastMonthStats._sum.ownerProfit * 100
        : 0
    }

    const volumeGrowth = {
      daily: yesterdayStats._sum.nominal && yesterdayStats._sum.nominal > 0
        ? ((todayStats._sum.nominal || 0) - yesterdayStats._sum.nominal) / yesterdayStats._sum.nominal * 100
        : 0,
      weekly: previousWeekStats._sum.nominal && previousWeekStats._sum.nominal > 0
        ? ((currentWeekStats._sum.nominal || 0) - previousWeekStats._sum.nominal) / previousWeekStats._sum.nominal * 100
        : 0,
      monthly: lastMonthStats._sum.nominal && lastMonthStats._sum.nominal > 0
        ? ((thisMonthStats._sum.nominal || 0) - lastMonthStats._sum.nominal) / lastMonthStats._sum.nominal * 100
        : 0
    }

    return NextResponse.json({
      stats: {
        totalProfit: totalProfit._sum.ownerProfit || 0,
        totalVolume: totalVolume._sum.nominal || 0,
        totalTransactions,
        activePartners,
        totalCustomers,
        avgProfitMargin
      },
      dailyStats: {
        today: {
          profit: todayStats._sum.ownerProfit || 0,
          volume: todayStats._sum.nominal || 0,
          transactions: todayStats._count.id || 0
        },
        yesterday: {
          profit: yesterdayStats._sum.ownerProfit || 0,
          volume: yesterdayStats._sum.nominal || 0,
          transactions: yesterdayStats._count.id || 0
        }
      },
      weeklyStats: {
        current: {
          profit: currentWeekStats._sum.ownerProfit || 0,
          volume: currentWeekStats._sum.nominal || 0,
          transactions: currentWeekStats._count.id || 0
        },
        previous: {
          profit: previousWeekStats._sum.ownerProfit || 0,
          volume: previousWeekStats._sum.nominal || 0,
          transactions: previousWeekStats._count.id || 0
        }
      },
      monthlyStats: {
        current: {
          profit: thisMonthStats._sum.ownerProfit || 0,
          volume: thisMonthStats._sum.nominal || 0,
          transactions: thisMonthStats._count.id || 0
        },
        previous: {
          profit: lastMonthStats._sum.ownerProfit || 0,
          volume: lastMonthStats._sum.nominal || 0,
          transactions: lastMonthStats._count.id || 0
        }
      },
      growth: {
        profit: profitGrowth,
        volume: volumeGrowth
      },
      statusDistribution,
      recentTransactions,
      topPartners,
      topCustomers,
      cityDistribution,
      paymentMethodPerformance,
      paymentTypePerformance,
      monthlyStats
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

