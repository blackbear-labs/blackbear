import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Valid status values
const VALID_STATUSES = ['Pending', 'Verifikasi', 'Proses', 'Berhasil'] as const
type TransactionStatus = typeof VALID_STATUSES[number]

// PUT - Update transaction status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    // Validate status
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: Pending, Verifikasi, Proses, Berhasil' },
        { status: 400 }
      )
    }

    // Check if transaction exists
    const transaction = await db.transaction.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            name: true,
            whatsapp: true
          }
        }
      }
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Update status
    const updatedTransaction = await db.transaction.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json({
      success: true,
      transaction: updatedTransaction,
      message: `Status transaksi berhasil diubah menjadi ${status}`
    })
  } catch (error) {
    console.error('Transaction status update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
