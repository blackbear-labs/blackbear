import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const payments = await db.paymentType.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Payments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create payment type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, flatFeeThreshold, flatFee, percentageFee, isActive } = body

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'Payment type name is required' },
        { status: 400 }
      )
    }

    if (!type || !['CC', 'Paylater'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be CC or Paylater' },
        { status: 400 }
      )
    }

    if (flatFee !== undefined && flatFee < 0) {
      return NextResponse.json(
        { error: 'Flat fee must be >= 0' },
        { status: 400 }
      )
    }

    if (percentageFee !== undefined && (percentageFee < 0 || percentageFee > 100)) {
      return NextResponse.json(
        { error: 'Percentage fee must be between 0 and 100' },
        { status: 400 }
      )
    }

    const paymentType = await db.paymentType.create({
      data: {
        name,
        type,
        flatFeeThreshold: flatFeeThreshold || 1000000,
        flatFee: flatFee || 0,
        percentageFee: percentageFee || 0,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json({ success: true, paymentType })
  } catch (error) {
    console.error('Payment type create error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
