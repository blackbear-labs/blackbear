'use client'

import { useEffect, useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Shield, Zap, TrendingUp, Users, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  useEffect(() => {
    // Check maintenance mode
    fetch('/api/site-config')
      .then(res => res.json())
      .then(data => {
        if (data.config?.maintenanceMode) {
          setMaintenanceMode(true)
        }
      })
      .catch(console.error)

    // Set mounted after data fetch using requestAnimationFrame
    requestAnimationFrame(() => {
      setMounted(true)
    })
  }, [])

  if (!mounted) return null

  if (maintenanceMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Sedang Maintenance</CardTitle>
            <CardDescription>
              Platform sedang dalam perbaikan. Silakan coba lagi nanti.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Shield className="w-4 h-4 mr-2" />
              Terpercaya & Aman
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Layanan Gestun Terpercaya
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Tarik tunai kartu kredit & paylater dengan proses cepat, aman, dan transparan.
              Dapatkan dana tunai instan tanpa ribet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/order">
                <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-lg px-8 py-6">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Order Sekarang
                </Button>
              </Link>
              <Link href="/#services">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Pelajari Lebih Lanjut
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Credit Card Style Features */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-2 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <Zap className="w-8 h-8 text-emerald-600" />
                    <span className="text-2xl font-bold text-emerald-600">5 Menit</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Proses Cepat</p>
                </CardContent>
              </Card>
              <Card className="border-2 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-teal-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <Shield className="w-8 h-8 text-teal-600" />
                    <span className="text-2xl font-bold text-teal-600">100%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Aman & Terjamin</p>
                </CardContent>
              </Card>
              <Card className="border-2 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-8 h-8 text-cyan-600" />
                    <span className="text-2xl font-bold text-cyan-600">24/7</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Layanan Nonstop</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Layanan Kami</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Berbagai opsi penarikan dana untuk kebutuhan Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Gestun Kartu Kredit */}
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-8 h-8 text-emerald-600" />
                </div>
                <CardTitle className="text-2xl">Gestun Kartu Kredit</CardTitle>
                <CardDescription className="text-base">
                  Tarik tunai dari limit kartu kredit Anda dengan proses mudah dan cepat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    'Proses 5-10 menit',
                    'Mendukung semua bank',
                    'Tanpa jaminan tambahan',
                    'Transparan & aman'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Gestun Paylater */}
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-teal-600" />
                </div>
                <CardTitle className="text-2xl">Gestun Paylater</CardTitle>
                <CardDescription className="text-base">
                  Cairkan limit paylater dari berbagai platform e-commerce
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    'ShopeePayLater',
                    'Tokopedia PayLater',
                    'Lazada PayLater',
                    'Traveloka PayLater'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-teal-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Partner Section */}
      <section id="about" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Bergabung Sebagai Mitra Black Bear
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Dapatkan penghasilan tambahan dengan menjadi mitra kami. Komisi menarik dan dukungan penuh dari tim kami.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <Users className="w-10 h-10 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">Komisi Menarik</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Dapatkan komisi hingga 30% dari setiap transaksi yang Anda bawa
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Shield className="w-10 h-10 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">Sistem Terpercaya</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Platform yang terbukti aman dengan ribuan transaksi berhasil
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <TrendingUp className="w-10 h-10 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">Dukungan Penuh</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Tim support siap membantu Anda 24/7
                  </p>
                </CardContent>
              </Card>
            </div>

            <Link href="/register">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Daftar Jadi Mitra
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Siap Mencairkan Dana Anda?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Proses cepat, aman, dan transparan. Pesan sekarang dan nikmati layanan terbaik kami.
          </p>
          <Link href="/order">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-white text-emerald-600 hover:bg-gray-100">
              <CreditCard className="w-5 h-5 mr-2" />
              Order Sekarang
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-muted/50 border-t mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
                  <CreditCard className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold">Black Bear</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Layanan gestun terpercaya dengan proses cepat dan aman.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Layanan</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/#services" className="hover:text-foreground">Gestun Kartu Kredit</Link></li>
                <li><Link href="/#services" className="hover:text-foreground">Gestun Paylater</Link></li>
                <li><Link href="/order" className="hover:text-foreground">Order Sekarang</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Perusahaan</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/#about" className="hover:text-foreground">Tentang Kami</Link></li>
                <li><Link href="/register" className="hover:text-foreground">Daftar Mitra</Link></li>
                <li><Link href="/login" className="hover:text-foreground">Masuk</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Hubungi Kami</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>WhatsApp: 0812-3456-7890</li>
                <li>Email: info@blackbear.id</li>
                <li>Senin - Minggu, 24 Jam</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Black Bear. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
