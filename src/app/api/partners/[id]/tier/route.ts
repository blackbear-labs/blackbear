import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { tier, badge } = body

    // Validation
    if (!tier) {
      return NextResponse.json(
        { error: 'Tier is required' },
        { status: 400 }
      )
    }

    const validTiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']
    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier value' },
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

    // Update partner tier and badge
    const updateData: any = { tier }
    if (badge) {
      updateData.badge = badge
    }

    const updatedPartner = await db.partner.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      partner: updatedPartner
    })
  } catch (error) {
    console.error('Partner tier override error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
