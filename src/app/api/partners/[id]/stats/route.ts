import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get partner stats
    const partner = await db.partner.findUnique({
      where: { id }
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    // Get current month stats
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    // Get or create monthly stats
    let monthlyStats = await db.partnerMonthlyStats.findUnique({
      where: {
        partnerId_year_month: {
          partnerId: id,
          year,
          month
        }
      }
    })

    // If no monthly stats exist, create one
    if (!monthlyStats) {
      monthlyStats = await db.partnerMonthlyStats.create({
        data: {
          partnerId: id,
          year,
          month,
          totalProfit: 0,
          totalVolume: 0,
          totalTransactions: 0,
          badge: partner.badge
        }
      })
    }

    // Get recent transactions
    const recentTransactions = await db.transaction.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      where: { partnerId: id },
      include: { customer: true, paymentType: true }
    })

    // Calculate pending volume (transactions with status not 'Completed')
    const pendingTransactions = await db.transaction.findMany({
      where: {
        partnerId: id,
        status: { not: 'Completed' }
      }
    })

    const pendingVolume = pendingTransactions.reduce((sum, tx) => sum + tx.nominal, 0)

    // Calculate tier progress
    const tierRules = {
      Bronze: { min: 0, max: 5000000, next: 'Silver', nextMin: 5000000 },
      Silver: { min: 5000000, max: 15000000, next: 'Gold', nextMin: 15000000 },
      Gold: { min: 15000000, max: 50000000, next: 'Platinum', nextMin: 50000000 },
      Platinum: { min: 50000000, max: 100000000, next: 'Diamond', nextMin: 100000000 },
      Diamond: { min: 100000000, max: Infinity, next: null, nextMin: null }
    }

    const currentTier = partner.tier
    const tierInfo = tierRules[currentTier as keyof typeof tierRules] || tierRules.Bronze
    const nextTier = tierInfo.next
    const currentProfit = monthlyStats.totalProfit

    // Calculate required profit for next tier
    let requiredProfit = 0
    let gap = 0

    if (nextTier) {
      requiredProfit = tierInfo.nextMin!
      gap = Math.max(0, requiredProfit - currentProfit)
    }

    // Get rank from monthly stats
    const rank = monthlyStats.rank || 0

    return NextResponse.json({
      stats: {
        totalProfit: monthlyStats.totalProfit,
        totalVolume: monthlyStats.totalVolume,
        totalTransactions: monthlyStats.totalTransactions,
        pendingVolume
      },
      tier: {
        current: currentTier,
        next: nextTier,
        currentProfit,
        requiredProfit: nextTier ? requiredProfit : currentProfit,
        gap,
        badge: partner.badge,
        rank
      },
      recentTransactions
    })
  } catch (error) {
    console.error('Partner stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
