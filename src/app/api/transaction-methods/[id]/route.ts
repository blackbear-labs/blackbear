import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT - Update transaction method
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

    const transactionMethod = await db.transactionMethod.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ success: true, transactionMethod })
  } catch (error) {
    console.error('Transaction method update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete transaction method
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.transactionMethod.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Transaction method delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
