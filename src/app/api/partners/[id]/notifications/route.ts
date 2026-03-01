import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get partner notifications
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'pengumuman', 'promo', 'broadcast', or undefined (all)

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

    // Build where clause
    const whereClause: any = {
      partnerId: id
    }

    // Filter by type if specified
    if (type && type !== 'all') {
      whereClause.type = type
    }

    // Fetch all notifications first
    const allNotifications = await db.partnerNotification.findMany({
      where: { partnerId: id },
      orderBy: { createdAt: 'desc' }
    })

    // Filter manually if type is specified
    let notifications = allNotifications
    if (type && type !== 'all') {
      notifications = allNotifications.filter(n => n.type === type)
    }

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Partner notifications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
