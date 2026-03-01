import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Single customer with stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        partner: {
          select: {
            name: true
          }
        },
        transactions: {
          include: {
            paymentType: {
              select: {
                name: true
              }
            },
            platform: {
              select: {
                name: true
              }
            },
            transactionMethod: {
              select: {
                name: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ customer })
  } catch (error) {
    console.error('Customer get error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, whatsapp, bankName, accountNumber, accountOwner, city, label, partnerId } = body

    // Check if customer exists and get its partnerId
    const existingCustomer = await db.customer.findUnique({
      where: { id },
      select: { partnerId: true }
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // If partnerId is provided, verify this partner owns the customer
    if (partnerId && existingCustomer.partnerId !== partnerId) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki izin untuk mengupdate customer ini' },
        { status: 403 }
      )
    }

    // Validation
    if (whatsapp && !whatsapp.match(/^08\d{8,11}$/)) {
      return NextResponse.json(
        { error: 'WhatsApp format harus 08***' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (whatsapp) updateData.whatsapp = whatsapp
    if (bankName !== undefined) updateData.bankName = bankName
    if (accountNumber !== undefined) updateData.accountNumber = accountNumber
    if (accountOwner !== undefined) updateData.accountOwner = accountOwner
    if (city) updateData.city = city
    if (label) updateData.label = label

    const customer = await db.customer.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ success: true, customer })
  } catch (error) {
    console.error('Customer update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const partnerId = searchParams.get('partnerId')

    // Check if customer exists and get its partnerId
    const customer = await db.customer.findUnique({
      where: { id },
      select: { partnerId: true, name: true }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // If partnerId is provided, verify this partner owns the customer
    if (partnerId && customer.partnerId !== partnerId) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki izin untuk menghapus customer ini' },
        { status: 403 }
      )
    }

    // Delete the customer
    await db.customer.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Customer delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
