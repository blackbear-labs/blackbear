import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List broadcasts
export async function GET() {
  try {
    const broadcasts = await db.broadcast.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ broadcasts })
  } catch (error) {
    console.error('Broadcasts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create broadcast
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, startDate, expireDate, type } = body

    // Validation
    if (!title || !description || !startDate || !expireDate) {
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

    const broadcast = await db.broadcast.create({
      data: {
        type: type || 'broadcast', // Default to 'broadcast' if not provided
        title,
        description,
        isActive: false,
        startDate: new Date(startDate),
        expireDate: new Date(expireDate)
      }
    })

    return NextResponse.json({ success: true, broadcast })
  } catch (error) {
    console.error('Broadcast create error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
