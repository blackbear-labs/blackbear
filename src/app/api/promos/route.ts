import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List promos
export async function GET() {
  try {
    const promos = await db.promo.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ promos })
  } catch (error) {
    console.error('Promos error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create promo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, link, startDate, expireDate } = body

    // Validation
    if (!title || !link || !startDate || !expireDate) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (new Date(expireDate) <= new Date(startDate)) {
      return NextResponse.json(
        { error: 'Expire date must be greater than start date' },
        { status: 400 }
      )
    }

    const promo = await db.promo.create({
      data: {
        title,
        link,
        isActive: false,
        startDate: new Date(startDate),
        expireDate: new Date(expireDate)
      }
    })

    return NextResponse.json({ success: true, promo })
  } catch (error) {
    console.error('Promo create error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
