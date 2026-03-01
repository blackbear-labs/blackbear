import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if partner exists
    const partner = await db.partner.findUnique({
      where: { id }
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    // Get badge history for last 6 months
    const now = new Date()
    const sixMonthsAgo = new Date(now)
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const badgeHistory = await db.partnerMonthlyStats.findMany({
      where: {
        partnerId: id,
        year: { gte: sixMonthsAgo.getFullYear() }
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ],
      take: 6
    })

    // Format badge history
    const formattedHistory = badgeHistory.map((stat) => ({
      year: stat.year,
      month: stat.month,
      monthName: new Date(stat.year, stat.month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
      rank: stat.rank,
      badge: stat.badge || partner.badge,
      totalProfit: stat.totalProfit
    }))

    // If no history exists, create entry for current month
    if (formattedHistory.length === 0) {
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1

      // Create monthly stats for current month
      const newStat = await db.partnerMonthlyStats.create({
        data: {
          partnerId: id,
          year: currentYear,
          month: currentMonth,
          totalProfit: 0,
          totalVolume: 0,
          totalTransactions: 0,
          badge: partner.badge
        }
      })

      formattedHistory.push({
        year: newStat.year,
        month: newStat.month,
        monthName: new Date(newStat.year, newStat.month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        rank: newStat.rank,
        badge: newStat.badge || partner.badge,
        totalProfit: newStat.totalProfit
      })
    }

    return NextResponse.json({
      badgeHistory: formattedHistory
    })
  } catch (error) {
    console.error('Partner badges error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
