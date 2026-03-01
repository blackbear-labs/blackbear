import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT - Update payment type
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, flatFee, percentageFee, flatFeeThreshold, isActive } = body

    // Validation
    if (flatFee !== undefined && flatFee < 0) {
      return NextResponse.json(
        { error: 'Flat fee must be >= 0' },
        { status: 400 }
      )
    }

    if (percentageFee !== undefined && (percentageFee < 0 || percentageFee > 100)) {
      return NextResponse.json(
        { error: 'Percentage fee must be between 0 and 100' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (flatFee !== undefined) updateData.flatFee = flatFee
    if (percentageFee !== undefined) updateData.percentageFee = percentageFee
    if (flatFeeThreshold !== undefined) updateData.flatFeeThreshold = flatFeeThreshold
    if (isActive !== undefined) updateData.isActive = isActive

    const paymentType = await db.paymentType.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ success: true, paymentType })
  } catch (error) {
    console.error('Payment type update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete payment type
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.paymentType.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Payment type delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
