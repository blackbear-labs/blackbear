import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      whatsapp,
      bankName,
      accountNumber,
      accountOwner,
      city,
      nominal,
      paymentTypeId,
      transactionMethodId,
      platformId,
      partnerId
    } = body

    // Validation
    if (!name || !whatsapp || !nominal || !paymentTypeId || !transactionMethodId) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      )
    }

    // Validate WhatsApp format
    if (!whatsapp.match(/^08\d{8,11}$/)) {
      return NextResponse.json(
        { error: 'WhatsApp format harus 08***' },
        { status: 400 }
      )
    }

    // Validate nominal
    if (nominal <= 0) {
      return NextResponse.json(
        { error: 'Nominal harus lebih dari 0' },
        { status: 400 }
      )
    }

    // Get payment type
    const paymentType = await db.paymentType.findUnique({
      where: { id: paymentTypeId }
    })

    if (!paymentType) {
      return NextResponse.json(
        { error: 'Payment type not found' },
        { status: 404 }
      )
    }

    // Get transaction method
    const transactionMethod = await db.transactionMethod.findUnique({
      where: { id: transactionMethodId }
    })

    if (!transactionMethod) {
      return NextResponse.json(
        { error: 'Transaction method not found' },
        { status: 404 }
      )
    }

    // Get platform if provided
    let platform = null
    if (platformId) {
      platform = await db.platform.findUnique({
        where: { id: platformId }
      })
    }

    // Calculate fees
    let paymentFee = 0
    if (nominal < paymentType.flatFeeThreshold) {
      paymentFee = paymentType.flatFee
    } else {
      paymentFee = nominal * paymentType.percentageFee
    }

    const codFee = nominal * transactionMethod.feeRate
    const platformFee = platform ? nominal * platform.feeRate : 0
    const netMargin = paymentFee + codFee - platformFee

    // Create or find customer
    let customer = await db.customer.findFirst({
      where: {
        whatsapp,
        ...(partnerId && { partnerId })
      }
    })

    if (!customer) {
      customer = await db.customer.create({
        data: {
          name,
          whatsapp,
          bankName: bankName || null,
          accountNumber: accountNumber || null,
          accountOwner: accountOwner || null,
          city: city || '',
          label: 'Regular',
          partnerId: partnerId || null
        }
      })
    }

    // Create transaction
    const transaction = await db.transaction.create({
      data: {
        customerId: customer.id,
        partnerId: partnerId || null,
        nominal,
        paymentTypeId,
        platformId: platformId || null,
        transactionMethodId,
        paymentFee,
        codFee,
        platformFee,
        netMargin,
        partnerProfit: partnerId ? netMargin * 0.30 : 0, // Default 30% commission
        ownerProfit: partnerId ? netMargin * 0.70 : netMargin
      }
    })

    // Update customer stats
    await db.customer.update({
      where: { id: customer.id },
      data: {
        totalProfit: { increment: transaction.ownerProfit },
        totalVolume: { increment: nominal },
        totalTransactions: { increment: 1 }
      }
    })

    // Update partner stats if applicable
    if (partnerId) {
      await db.partner.update({
        where: { id: partnerId },
        data: {
          totalProfit: { increment: transaction.partnerProfit },
          totalVolume: { increment: nominal },
          totalTransactions: { increment: 1 }
        }
      })

      // Update monthly stats
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1

      // Find existing stats for this month
      const existingStats = await db.partnerMonthlyStats.findFirst({
        where: {
          partnerId,
          year,
          month
        }
      })

      if (existingStats) {
        await db.partnerMonthlyStats.update({
          where: { id: existingStats.id },
          data: {
            totalProfit: { increment: transaction.partnerProfit },
            totalVolume: { increment: nominal },
            totalTransactions: { increment: 1 }
          }
        })
      } else {
        await db.partnerMonthlyStats.create({
          data: {
            partnerId,
            year,
            month,
            totalProfit: transaction.partnerProfit,
            totalVolume: nominal,
            totalTransactions: 1
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        customerName: customer.name,
        nominal: transaction.nominal,
        paymentFee,
        codFee,
        platformFee,
        netMargin,
        totalDiterima: nominal - paymentFee - codFee
      }
    })
  } catch (error) {
    console.error('Transaction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
