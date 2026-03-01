import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List customers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const search = searchParams.get('search') || ''
    const partnerId = searchParams.get('partnerId')

    // Build where clause
    const where: any = {}

    // Add search conditions
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { whatsapp: { contains: search } },
        { city: { contains: search } }
      ]
    }

    // Add partner filter - if partnerId is provided, only return customers for that partner
    if (partnerId) {
      where.partnerId = partnerId
    }

    const [customers, total] = await Promise.all([
      db.customer.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          partner: {
            select: {
              name: true
            }
          }
        }
      }),
      db.customer.count({ where })
    ])

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Customers error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, whatsapp, bankName, accountNumber, accountOwner, city, label, partnerId } = body

    // Validation
    if (!name || !whatsapp || !city) {
      return NextResponse.json(
        { error: 'Name, whatsapp, and city are required' },
        { status: 400 }
      )
    }

    // Validate WhatsApp format
    if (!whatsapp.match(/^08\d{8,11}$/)) {
      return NextResponse.json(
        { error: 'WhatsApp format harus 08***' },
        { status: 400 }
      )
    }

    const customer = await db.customer.create({
      data: {
        name,
        whatsapp,
        bankName: bankName || null,
        accountNumber: accountNumber || null,
        accountOwner: accountOwner || null,
        city,
        label: label || 'Regular',
        partnerId: partnerId || null
      }
    })

    return NextResponse.json({ success: true, customer })
  } catch (error) {
    console.error('Customer create error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
