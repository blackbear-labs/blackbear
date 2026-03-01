import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, link, expireDays, type } = body

    // Validation
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    // Check if partner exists
    const partner = await db.partner.findUnique({
      where: { id }
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    // Calculate expire date (default 7 days)
    const expireDate = new Date()
    expireDate.setDate(expireDate.getDate() + (expireDays || 7))

    // Create notification
    const notification = await db.partnerNotification.create({
      data: {
        partnerId: id,
        type: type || 'pengumuman', // Default to 'pengumuman' if not provided
        title,
        description,
        link: link || null,
        isRead: false,
        expireDate
      }
    })

    return NextResponse.json({
      success: true,
      notification
    })
  } catch (error) {
    console.error('Partner announcement error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
