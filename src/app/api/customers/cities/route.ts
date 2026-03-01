import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - City distribution for heatmap
export async function GET() {
  try {
    const customers = await db.customer.findMany({
      select: {
        city: true
      }
    })

    // Group by city and count
    const cityMap = new Map<string, number>()
    customers.forEach(customer => {
      const count = cityMap.get(customer.city) || 0
      cityMap.set(customer.city, count + 1)
    })

    const cityStats = Array.from(cityMap.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      success: true,
      cities: cityStats
    })
  } catch (error) {
    console.error('Cities error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
