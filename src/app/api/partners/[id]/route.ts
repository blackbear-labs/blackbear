import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Single partner
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const partner = await db.partner.findUnique({
      where: { id }
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ partner })
  } catch (error) {
    console.error('Partner get error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update partner
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, email, commissionRate, status, tier, badge } = body

    // Validation
    if (commissionRate !== undefined && (commissionRate < 0 || commissionRate > 100)) {
      return NextResponse.json(
        { error: 'Commission rate must be between 0 and 100' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (commissionRate !== undefined) updateData.commissionRate = commissionRate
    if (status) updateData.status = status
    if (tier) updateData.tier = tier
    if (badge) updateData.badge = badge

    const partner = await db.partner.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ success: true, partner })
  } catch (error) {
    console.error('Partner update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete partner
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Delete partner's user
    const partner = await db.partner.findUnique({
      where: { id }
    })

    if (partner) {
      await db.user.delete({
        where: { id: partner.userId }
      })
    }

    // Delete partner
    await db.partner.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Partner delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
