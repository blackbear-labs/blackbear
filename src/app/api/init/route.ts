import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, createOwnerIfNotExists } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Create owner if not exists
    await createOwnerIfNotExists()

    // Seed Payment Types
    const existingPayments = await db.paymentType.count()
    if (existingPayments === 0) {
      await db.paymentType.createMany({
        data: [
          {
            name: 'Kartu Kredit - BCA',
            type: 'CC',
            flatFeeThreshold: 1000000,
            flatFee: 75000,
            percentageFee: 0.08
          },
          {
            name: 'Kartu Kredit - Mandiri',
            type: 'CC',
            flatFeeThreshold: 1000000,
            flatFee: 75000,
            percentageFee: 0.08
          },
          {
            name: 'Kartu Kredit - BNI',
            type: 'CC',
            flatFeeThreshold: 1000000,
            flatFee: 75000,
            percentageFee: 0.08
          },
          {
            name: 'Kartu Kredit - BRI',
            type: 'CC',
            flatFeeThreshold: 1000000,
            flatFee: 70000,
            percentageFee: 0.075
          },
          {
            name: 'ShopeePayLater',
            type: 'Paylater',
            flatFeeThreshold: 1000000,
            flatFee: 80000,
            percentageFee: 0.085
          },
          {
            name: 'Tokopedia PayLater',
            type: 'Paylater',
            flatFeeThreshold: 1000000,
            flatFee: 80000,
            percentageFee: 0.085
          },
          {
            name: 'Lazada PayLater',
            type: 'Paylater',
            flatFeeThreshold: 1000000,
            flatFee: 80000,
            percentageFee: 0.085
          },
          {
            name: 'Traveloka PayLater',
            type: 'Paylater',
            flatFeeThreshold: 1000000,
            flatFee: 75000,
            percentageFee: 0.08
          }
        ]
      })
    }

    // Seed Transaction Methods
    const existingMethods = await db.transactionMethod.count()
    if (existingMethods === 0) {
      await db.transactionMethod.createMany({
        data: [
          {
            name: 'Online',
            feeRate: 0.02 // 2% additional fee
          },
          {
            name: 'COD',
            feeRate: 0.04 // 4% additional fee
          }
        ]
      })
    }

    // Seed Platforms (Marketplace fees for margin reduction)
    const existingPlatforms = await db.platform.count()
    if (existingPlatforms === 0) {
      await db.platform.createMany({
        data: [
          {
            name: 'Shopee',
            feeRate: 0.02 // 2% reduction from margin
          },
          {
            name: 'Tokopedia',
            feeRate: 0.02
          },
          {
            name: 'Lazada',
            feeRate: 0.03
          },
          {
            name: 'Bukalapak',
            feeRate: 0.025
          },
          {
            name: 'Traveloka',
            feeRate: 0.04
          },
          {
            name: 'Tiket.com',
            feeRate: 0.04
          },
          {
            name: 'Direct/No Platform',
            feeRate: 0
          }
        ]
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Initial data seeded successfully'
    })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
