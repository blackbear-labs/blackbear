import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const platforms = await db.platform.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ platforms })
  } catch (error) {
    console.error('Platforms error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create platform
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, feeRate } = body

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'Platform name is required' },
        { status: 400 }
      )
    }

    if (feeRate !== undefined && (feeRate < 0 || feeRate > 100)) {
      return NextResponse.json(
        { error: 'Fee rate must be between 0 and 100' },
        { status: 400 }
      )
    }

    const platform = await db.platform.create({
      data: {
        name,
        feeRate: feeRate || 0,
        isActive: true
      }
    })

    return NextResponse.json({ success: true, platform })
  } catch (error) {
    console.error('Platform create error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
