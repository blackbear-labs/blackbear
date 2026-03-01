'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { Menu, X, Sun, Moon, CreditCard, Shield, Users, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { usePathname } from 'next/navigation'

interface NavigationProps {
  showOrderButton?: boolean
  showAuthButtons?: boolean
}

export function Navigation({ showOrderButton = true, showAuthButtons = true }: NavigationProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Use requestAnimationFrame to defer state update
    requestAnimationFrame(() => {
      setMounted(true)
    })
  }, [])

  const navLinks = [
    { name: 'Beranda', href: '/' },
    { name: 'Layanan', href: '/#services' },
    { name: 'Tentang', href: '/#about' },
    { name: 'Kontak', href: '/#contact' }
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">Black Bear</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="w-5 h-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute w-5 h-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/track">
                <Button variant="outline" className="gap-2">
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Tracking</span>
                </Button>
              </Link>
              {showOrderButton && (
                <Link href="/order">
                  <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                    Order Sekarang
                  </Button>
                </Link>
              )}
              {showAuthButtons && (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Masuk</Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline">Daftar Mitra</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-6 h-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="text-lg font-medium transition-colors hover:text-primary py-2"
                    >
                      {link.name}
                    </Link>
                  ))}
                  <div className="border-t pt-4 space-y-2">
                    <Link href="/track" className="block">
                      <Button variant="outline" className="w-full gap-2">
                        <Search className="w-4 h-4" />
                        Tracking
                      </Button>
                    </Link>
                    {showOrderButton && (
                      <Link href="/order" className="block">
                        <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                          Order Sekarang
                        </Button>
                      </Link>
                    )}
                    {showAuthButtons && (
                      <>
                        <Link href="/login" className="block">
                          <Button variant="outline" className="w-full">
                            Masuk
                          </Button>
                        </Link>
                        <Link href="/register" className="block">
                          <Button variant="ghost" className="w-full">
                            Daftar Mitra
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
