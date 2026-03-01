import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT - Update broadcast (toggle active, edit details)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, isActive, startDate, expireDate, type } = body

    // Validation for date
    if (startDate && expireDate && new Date(expireDate) <= new Date(startDate)) {
      return NextResponse.json(
        { error: 'Expire date must be greater than start date' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (title) updateData.title = title
    if (description) updateData.description = description
    if (type !== undefined) updateData.type = type
    if (isActive !== undefined) updateData.isActive = isActive
    if (startDate) updateData.startDate = new Date(startDate)
    if (expireDate) updateData.expireDate = new Date(expireDate)

    // Get broadcast before update to check if we need to send notifications
    const existingBroadcast = await db.broadcast.findUnique({
      where: { id }
    })

    if (!existingBroadcast) {
      return NextResponse.json(
        { error: 'Broadcast not found' },
        { status: 404 }
      )
    }

    const broadcast = await db.broadcast.update({
      where: { id },
      data: updateData
    })

    // If broadcast is being activated, send notifications to all active partners
    if (isActive === true && existingBroadcast.isActive === false) {
      const activePartners = await db.partner.findMany({
        where: { status: 'Active' }
      })

      // Create notifications for all active partners
      await db.partnerNotification.createMany({
        data: activePartners.map(partner => ({
          partnerId: partner.id,
          type: broadcast.type, // 'broadcast' or 'promo'
          title: broadcast.title,
          description: broadcast.description,
          expireDate: broadcast.expireDate
        }))
      })
    }

    return NextResponse.json({ success: true, broadcast })
  } catch (error) {
    console.error('Broadcast update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete broadcast
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.broadcast.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Broadcast delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
