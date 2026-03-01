import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    // Get top 5 partners by monthly stats or total stats
    const topPartners = await db.partner.findMany({
      take: 5,
      orderBy: { totalProfit: 'desc' },
      where: { status: 'Active' }
    })

    const leaderboard = topPartners.map((partner, index) => ({
      rank: index + 1,
      name: partner.name,
      totalProfit: partner.totalProfit,
      tier: partner.tier
    }))

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
