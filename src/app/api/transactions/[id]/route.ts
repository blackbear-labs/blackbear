import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get transaction detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const transaction = await db.transaction.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            whatsapp: true,
            city: true,
            label: true,
            bankName: true,
            accountNumber: true,
            accountOwner: true
          }
        },
        partner: {
          select: {
            id: true,
            name: true,
            bankName: true,
            accountNumber: true,
            accountOwner: true,
            city: true,
            commissionRate: true
          }
        },
        paymentType: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        platform: {
          select: {
            id: true,
            name: true,
            feeRate: true
          }
        },
        transactionMethod: {
          select: {
            id: true,
            name: true,
            feeRate: true
          }
        }
      }
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error('Transaction detail error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
