import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT - Update promo (toggle active, edit details)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, link, isActive, startDate, expireDate } = body

    // Validation for date
    if (startDate && expireDate && new Date(expireDate) <= new Date(startDate)) {
      return NextResponse.json(
        { error: 'Expire date must be greater than start date' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (title) updateData.title = title
    if (link) updateData.link = link
    if (isActive !== undefined) updateData.isActive = isActive
    if (startDate) updateData.startDate = new Date(startDate)
    if (expireDate) updateData.expireDate = new Date(expireDate)

    const promo = await db.promo.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ success: true, promo })
  } catch (error) {
    console.error('Promo update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete promo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.promo.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Promo delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
