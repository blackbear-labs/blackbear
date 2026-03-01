'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Lock, User, ArrowRight, Home } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

export default function LoginPage() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'partner'
  })

  useEffect(() => {
    setMounted(true)
    // Check if already logged in
    const session = localStorage.getItem('session')
    if (session) {
      const user = JSON.parse(session)
      if (user.role === 'owner') {
        router.push('/owner/dashboard')
      } else {
        router.push('/partner/dashboard')
      }
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.email || !formData.password) {
      toast({
        title: 'Validasi Error',
        description: 'Email dan password wajib diisi',
        variant: 'destructive'
      })
      return
    }

    if (!formData.email.includes('@')) {
      toast({
        title: 'Format Email Salah',
        description: 'Mohon masukkan email yang valid',
        variant: 'destructive'
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Password Terlalu Pendek',
        description: 'Password minimal 6 karakter',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        // Save session
        localStorage.setItem('session', JSON.stringify(data.user))

        toast({
          title: 'Login Berhasil!',
          description: `Selamat datang, ${data.user.name}`,
          variant: 'default'
        })

        // Redirect based on role
        if (data.user.role === 'owner') {
          router.push('/owner/dashboard')
        } else {
          router.push('/partner/dashboard')
        }
      } else {
        throw new Error(data.error || 'Login gagal')
      }
    } catch (error: any) {
      toast({
        title: 'Login Gagal',
        description: error.message || 'Email atau password salah',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation showOrderButton={false} showAuthButtons={false} />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Breadcrumb */}
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <Home className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Link>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Masuk ke Akun</CardTitle>
              <CardDescription>
                Masuk untuk mengelola transaksi dan dashboard Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Role Selection */}
                <div>
                  <Label>Masuk Sebagai</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'partner' })}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        formData.role === 'partner'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <User className="w-6 h-6 mb-2 mx-auto" />
                      <p className="font-semibold text-center text-sm">Mitra</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'owner' })}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        formData.role === 'owner'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Lock className="w-6 h-6 mb-2 mx-auto" />
                      <p className="font-semibold text-center text-sm">Owner</p>
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email / Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="nama@email.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimal 6 karakter
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  disabled={loading}
                >
                  {loading ? 'Memproses...' : 'Masuk'}
                  {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                  Belum punya akun mitra?{' '}
                  <Link href="/register" className="text-primary hover:underline font-medium">
                    Daftar Sekarang
                  </Link>
                </p>
              </div>

              {/* Demo Credentials Info */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-xs font-semibold mb-2">Akun Demo:</p>
                <p className="text-xs text-muted-foreground">
                  Owner: owner@gestun.com / admin123
                </p>
                <p className="text-xs text-muted-foreground">
                  Mitra: Daftar akun baru melalui form pendaftaran
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
