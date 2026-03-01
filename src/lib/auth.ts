import { db } from './db'

export interface LoginCredentials {
  email: string
  password: string
  role: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  bankName: string
  accountNumber: string
  accountOwner: string
  city: string
}

export interface SessionUser {
  id: string
  email: string
  name: string
  role: string
  partnerId?: string | null
}

// Simple password hashing (for demo - use bcrypt in production)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hashed = await hashPassword(password)
  return hashed === hashedPassword
}

export async function login({ email, password, role }: LoginCredentials): Promise<SessionUser | null> {
  const user = await db.user.findUnique({
    where: { email },
    include: { partner: true }
  })

  if (!user) {
    return null
  }

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    return null
  }

  if (user.role !== role) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    partnerId: user.partnerId
  }
}

export async function registerPartner(data: RegisterData): Promise<SessionUser | null> {
  // Check if email already exists
  const existingUser = await db.user.findUnique({
    where: { email: data.email }
  })

  if (existingUser) {
    return null
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password)

  // Create user first
  const user = await db.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: 'partner'
    }
  })

  // Create partner profile with valid userId
  const partner = await db.partner.create({
    data: {
      userId: user.id,
      name: data.name,
      email: data.email,
      password: hashedPassword,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      accountOwner: data.accountOwner,
      city: data.city,
      tier: 'Bronze',
      badge: 'Newcomer',
      commissionRate: 0.30,
      status: 'Active'
    }
  })

  // Update user with partnerId
  await db.user.update({
    where: { id: user.id },
    data: { partnerId: partner.id }
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    partnerId: partner.id
  }
}

export async function createOwnerIfNotExists() {
  const existingOwner = await db.user.findFirst({
    where: { role: 'owner' }
  })

  if (existingOwner) {
    return existingOwner
  }

  const hashedPassword = await hashPassword('admin123')

  const owner = await db.user.create({
    data: {
      email: 'owner@gestun.com',
      password: hashedPassword,
      name: 'Platform Owner',
      role: 'owner'
    }
  })

  // Create site config
  await db.siteConfig.create({
    data: {
      siteTitle: 'Black Bear Gestun',
      ownerName: 'Platform Owner',
      ownerEmail: 'owner@gestun.com',
      ownerPassword: hashedPassword
    }
  })

  return owner
}

export async function getSession(): Promise<SessionUser | null> {
  // Simple session check - in production use proper JWT or cookies
  if (typeof window === 'undefined') {
    return null
  }

  const sessionStr = localStorage.getItem('session')
  if (!sessionStr) {
    return null
  }

  try {
    return JSON.parse(sessionStr) as SessionUser
  } catch {
    return null
  }
}

export async function setSession(user: SessionUser) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('session', JSON.stringify(user))
  }
}

export async function clearSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('session')
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  return getSession()
}

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('session') !== null
}
