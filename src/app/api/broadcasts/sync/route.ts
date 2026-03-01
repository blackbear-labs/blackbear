import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Sync active broadcasts to partner notifications
export async function POST(request: NextRequest) {
  try {
    // Get all active broadcasts that are currently valid
    const now = new Date()
    const activeBroadcasts = await db.broadcast.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        expireDate: { gte: now }
      }
    })

    // Get all active partners
    const activePartners = await db.partner.findMany({
      where: { status: 'Active' }
    })

    let notificationsCreated = 0

    // For each broadcast, create notifications for all partners
    for (const broadcast of activeBroadcasts) {
      // Get existing notifications for this broadcast to avoid duplicates
      const existingNotifications = await db.partnerNotification.findMany({
        where: {
          title: broadcast.title,
          description: broadcast.description
        }
      })

      // Find partners that don't have this notification yet
      const partnerIdsWithNotification = new Set(
        existingNotifications.map(n => n.partnerId)
      )
      const partnersWithoutNotification = activePartners.filter(
        partner => !partnerIdsWithNotification.has(partner.id)
      )

      // Create notifications for partners that don't have it
      if (partnersWithoutNotification.length > 0) {
        const notificationType = broadcast.type || 'broadcast' // Ensure type is set, default to 'broadcast'

        await db.partnerNotification.createMany({
          data: partnersWithoutNotification.map(partner => ({
            partnerId: partner.id,
            type: notificationType, // Use explicit type
            title: broadcast.title,
            description: broadcast.description,
            expireDate: broadcast.expireDate
          }))
        })

        notificationsCreated += partnersWithoutNotification.length
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${activeBroadcasts.length} active broadcasts, created ${notificationsCreated} new notifications`,
      broadcastsProcessed: activeBroadcasts.length,
      notificationsCreated
    })
  } catch (error) {
    console.error('Broadcast sync error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
