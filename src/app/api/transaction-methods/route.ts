import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const methods = await db.transactionMethod.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ methods })
  } catch (error) {
    console.error('Transaction methods error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create transaction method
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, feeRate } = body

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'Transaction method name is required' },
        { status: 400 }
      )
    }

    if (feeRate !== undefined && (feeRate < 0 || feeRate > 100)) {
      return NextResponse.json(
        { error: 'Fee rate must be between 0 and 100' },
        { status: 400 }
      )
    }

    const transactionMethod = await db.transactionMethod.create({
      data: {
        name,
        feeRate: feeRate || 0,
        isActive: true
      }
    })

    return NextResponse.json({ success: true, transactionMethod })
  } catch (error) {
    console.error('Transaction method create error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
