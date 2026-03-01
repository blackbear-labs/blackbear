'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, UserPlus, Home, ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

export default function RegisterPage() {
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bankName: '',
    accountNumber: '',
    accountOwner: '',
    city: ''
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
    if (!formData.name || !formData.email || !formData.password ||
        !formData.bankName || !formData.accountNumber || !formData.accountOwner || !formData.city) {
      toast({
        title: 'Validasi Error',
        description: 'Semua field wajib diisi',
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

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Password Tidak Cocok',
        description: 'Konfirmasi password harus sama dengan password',
        variant: 'destructive'
      })
      return
    }

    if (!formData.accountNumber.match(/^08\d{8,11}$/)) {
      toast({
        title: 'Format WhatsApp Salah',
        description: 'WhatsApp harus dimulai dengan 08 dan 10-13 digit',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        // Save session
        localStorage.setItem('session', JSON.stringify(data.user))

        toast({
          title: 'Pendaftaran Berhasil!',
          description: `Selamat bergabung, ${data.user.name}`,
          variant: 'default'
        })

        // Redirect to partner dashboard
        router.push('/partner/dashboard')
      } else {
        throw new Error(data.error || 'Pendaftaran gagal')
      }
    } catch (error: any) {
      toast({
        title: 'Pendaftaran Gagal',
        description: error.message || 'Terjadi kesalahan',
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

      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          {/* Breadcrumb */}
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <Home className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Link>

          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Daftar Jadi Mitra Black Bear</h1>
            <p className="text-muted-foreground">
              Bergabunglah bersama kami dan dapatkan komisi menarik dari setiap transaksi
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Form Pendaftaran Mitra</CardTitle>
              <CardDescription>
                Lengkapi data di bawah ini untuk mendaftar sebagai mitra
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Informasi Pribadi</h3>

                  <div>
                    <Label htmlFor="name">Nama Lengkap *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="nama@email.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Minimal 6 karakter</p>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Konfirmasi Password *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bank Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Informasi Bank</h3>

                  <div>
                    <Label htmlFor="bankName">Nama Bank *</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="Contoh: BCA, Mandiri, BNI"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="accountNumber">No. WhatsApp (untuk notifikasi) *</Label>
                    <Input
                      id="accountNumber"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      placeholder="08xxxxxxxxxx"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Format: 08*** (10-13 digit) - Digunakan untuk notifikasi transaksi
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="accountOwner">Nama Pemilik Rekening *</Label>
                    <Input
                      id="accountOwner"
                      value={formData.accountOwner}
                      onChange={(e) => setFormData({ ...formData, accountOwner: e.target.value })}
                      placeholder="Sesuai buku tabungan"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">Kota *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Kota domisili"
                      required
                    />
                  </div>
                </div>

                {/* Benefits */}
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-600" />
                    Keuntungan Menjadi Mitra:
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>Komisi hingga 30% dari setiap transaksi</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>Sistem tier & badge untuk penghargaan</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>Dashboard untuk mengelola customer & transaksi</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>Dukungan 24/7 dari tim kami</span>
                    </li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  disabled={loading}
                >
                  {loading ? 'Memproses...' : 'Daftar Sekarang'}
                  {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                  Sudah punya akun?{' '}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Masuk
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
