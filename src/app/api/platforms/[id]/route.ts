import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT - Update platform
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, feeRate, isActive } = body

    // Validation
    if (feeRate !== undefined && (feeRate < 0 || feeRate > 100)) {
      return NextResponse.json(
        { error: 'Fee rate must be between 0 and 100' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (feeRate !== undefined) updateData.feeRate = feeRate
    if (isActive !== undefined) updateData.isActive = isActive

    const platform = await db.platform.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ success: true, platform })
  } catch (error) {
    console.error('Platform update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete platform (except default)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.platform.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Platform delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
