import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    // Update partner status to Active
    const updatedPartner = await db.partner.update({
      where: { id },
      data: { status: 'Active' }
    })

    return NextResponse.json({
      success: true,
      partner: updatedPartner
    })
  } catch (error) {
    console.error('Partner activate error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
