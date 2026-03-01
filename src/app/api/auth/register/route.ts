import { NextRequest, NextResponse } from 'next/server'
import { registerPartner } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, confirmPassword, bankName, accountNumber, accountOwner, city } = body

    // Validation
    if (!name || !email || !password || !bankName || !accountNumber || !accountOwner || !city) {
      return NextResponse.json(
        { error: 'All fields are required' },
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

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    // Validate WhatsApp format (08***)
    if (!accountNumber.match(/^08\d{8,11}$/)) {
      return NextResponse.json(
        { error: 'Account number must start with 08 and be 10-13 digits' },
        { status: 400 }
      )
    }

    const user = await registerPartner({
      name,
      email,
      password,
      bankName,
      accountNumber,
      accountOwner,
      city
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    return NextResponse.json({
      success: true,
      user
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
