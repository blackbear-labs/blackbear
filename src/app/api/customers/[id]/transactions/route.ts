import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get customer transactions filtered by partner
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const partnerId = searchParams.get('partnerId')

    // Verify customer exists
    const customer = await db.customer.findUnique({
      where: { id }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Build where clause for transactions
    const where: any = {
      customerId: id
    }

    // If partnerId is provided, only return transactions via that partner
    if (partnerId) {
      where.partnerId = partnerId
    }

    const transactions = await db.transaction.findMany({
      where,
      include: {
        paymentType: {
          select: {
            name: true
          }
        },
        platform: {
          select: {
            name: true
          }
        },
        transactionMethod: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to 50 most recent transactions
    })

    return NextResponse.json({
      transactions,
      count: transactions.length
    })
  } catch (error) {
    console.error('Customer transactions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
