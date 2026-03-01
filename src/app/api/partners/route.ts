import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - List partners
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const search = searchParams.get('search') || ''

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { city: { contains: search } }
          ]
        }
      : {}

    const [partners, total] = await Promise.all([
      db.partner.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' }
      }),
      db.partner.count({ where })
    ])

    return NextResponse.json({
      partners,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Partners error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create partner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, bankName, accountNumber, accountOwner, city, tier, status, commissionRate } = body

    // Validation
    if (!name || !email || !password || !bankName || !accountNumber || !accountOwner || !city) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    if (commissionRate < 0 || commissionRate > 100) {
      return NextResponse.json(
        { error: 'Commission rate must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Hash password
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Create user first
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'partner'
      }
    })

    // Create partner with valid userId
    const partner = await db.partner.create({
      data: {
        userId: user.id,
        name,
        email,
        password: hashedPassword,
        bankName,
        accountNumber,
        accountOwner,
        city,
        tier: tier || 'Bronze',
        badge: 'Newcomer',
        commissionRate: commissionRate || 0.30,
        status: status || 'Active'
      }
    })

    // Update user with partnerId
    await db.user.update({
      where: { id: user.id },
      data: { partnerId: partner.id }
    })

    return NextResponse.json({ success: true, partner })
  } catch (error) {
    console.error('Partner create error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
