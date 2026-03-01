import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT - Mark notification as read
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; notificationId: string }> }
) {
  try {
    const { id, notificationId } = await params

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

    // Check if notification exists and belongs to partner
    const notification = await db.partnerNotification.findFirst({
      where: {
        id: notificationId,
        partnerId: id
      }
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    // Update notification as read
    const updatedNotification = await db.partnerNotification.update({
      where: { id: notificationId },
      data: { isRead: true }
    })

    return NextResponse.json({
      success: true,
      notification: updatedNotification
    })
  } catch (error) {
    console.error('Mark notification read error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
