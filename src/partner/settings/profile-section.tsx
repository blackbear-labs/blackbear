'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Loader2, AlertCircle, CheckCircle2, User, Mail, Lock, Globe, Instagram, Facebook, MessageCircle } from 'lucide-react'

interface Partner {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
  tier: string
  badge: string
  commissionRate: number
  status: string
  createdAt: string
}

interface SiteConfig {
  logoUrl?: string | null
  faviconUrl?: string | null
  siteTitle?: string | null
  contactWhatsApp?: string | null
  contactInstagram?: string | null
  contactFacebook?: string | null
  maintenanceMode?: boolean
}

interface ProfileSectionProps {
  partner: Partner
  siteConfig: SiteConfig
  onRefresh: () => void
}

export function ProfileSection({ partner, siteConfig, onRefresh }: ProfileSectionProps) {
  const [loading, setLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(partner.avatarUrl || '')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})

  const getTierBadgeColor = (tier: string) => {
    const colors: Record<string, string> = {
      'Bronze': 'bg-amber-500',
      'Silver': 'bg-gray-500',
      'Gold': 'bg-yellow-500',
      'Platinum': 'bg-slate-500',
      'Diamond': 'bg-cyan-500'
    }
    return colors[tier] || 'bg-gray-500'
  }

  const handleAvatarUpdate = async () => {
    if (!avatarUrl.trim()) {
      toast.error('URL Avatar tidak boleh kosong')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/partners/${partner.id}/avatar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengupdate avatar')
      }

      toast.success('Avatar berhasil diupdate!')
      onRefresh()
    } catch (error: any) {
      toast.error('Gagal mengupdate avatar', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const validatePasswordForm = () => {
    const errors: Record<string, string> = {}

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Password saat ini wajib diisi'
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'Password baru wajib diisi'
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password baru minimal 6 karakter'
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Konfirmasi password wajib diisi'
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Password tidak cocok'
    }

    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePasswordForm()) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/partners/${partner.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengubah password')
      }

      toast.success('Password berhasil diubah!')

      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setPasswordErrors({})
      setShowPasswordForm(false)
    } catch (error: any) {
      toast.error('Gagal mengubah password', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card className="border-emerald-100 dark:border-emerald-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            Informasi Profil
          </CardTitle>
          <CardDescription>
            Informasi dasar profil partner Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-start gap-4">
            <Avatar className="w-20 h-20 border-2 border-emerald-200 dark:border-emerald-800">
              <AvatarImage src={partner.avatarUrl || undefined} alt={partner.name} />
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-lg font-semibold">
                {partner.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Label htmlFor="avatarUrl">URL Avatar Profil</Label>
              <div className="flex gap-2">
                <Input
                  id="avatarUrl"
                  placeholder="https://example.com/avatar.jpg"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="border-emerald-200 dark:border-emerald-800"
                />
                <Button
                  onClick={handleAvatarUpdate}
                  disabled={loading || avatarUrl === partner.avatarUrl}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan'}
                </Button>
              </div>
              {avatarUrl && avatarUrl !== partner.avatarUrl && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Globe className="w-3 h-3" />
                  <span>Preview avatar akan muncul di atas</span>
                </div>
              )}
            </div>
          </div>

          {/* Name (Display Only) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                value={partner.name}
                readOnly
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed"
              />
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={partner.email}
                readOnly
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500">Email tidak dapat diubah setelah dibuat</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card className="border-emerald-100 dark:border-emerald-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            Ubah Password
          </CardTitle>
          <CardDescription>
            Ganti password akun Anda secara berkala untuk keamanan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showPasswordForm ? (
            <Button
              onClick={() => setShowPasswordForm(true)}
              variant="outline"
              className="border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            >
              <Lock className="w-4 h-4 mr-2" />
              Ganti Password
            </Button>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Password Saat Ini</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className={passwordErrors.currentPassword ? 'border-red-500' : 'border-emerald-200 dark:border-emerald-800'}
                  placeholder="Masukkan password saat ini"
                />
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">Password Baru</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className={passwordErrors.newPassword ? 'border-red-500' : 'border-emerald-200 dark:border-emerald-800'}
                  placeholder="Minimal 6 karakter"
                />
                {passwordErrors.newPassword && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {passwordErrors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className={passwordErrors.confirmPassword ? 'border-red-500' : 'border-emerald-200 dark:border-emerald-800'}
                  placeholder="Ulangi password baru"
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {passwordErrors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordForm(false)
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    })
                    setPasswordErrors({})
                  }}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mengubah...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Ubah Password
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Website Branding (View Only) */}
      <Card className="border-emerald-100 dark:border-emerald-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600" />
            Branding Website
          </CardTitle>
          <CardDescription>
            Informasi branding website (hanya lihat)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Logo */}
            <div className="space-y-2">
              <Label>Logo Website</Label>
              {siteConfig.logoUrl ? (
                <div className="p-2 border rounded-lg bg-white dark:bg-gray-800">
                  <img
                    src={siteConfig.logoUrl}
                    alt="Logo Website"
                    className="max-h-16 mx-auto object-contain"
                  />
                </div>
              ) : (
                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 text-center text-sm text-gray-500">
                  Tidak ada logo
                </div>
              )}
            </div>

            {/* Favicon */}
            <div className="space-y-2">
              <Label>Favicon</Label>
              {siteConfig.faviconUrl ? (
                <div className="p-2 border rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center">
                  <img
                    src={siteConfig.faviconUrl}
                    alt="Favicon"
                    className="w-8 h-8 object-contain"
                  />
                </div>
              ) : (
                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 text-center text-sm text-gray-500">
                  Tidak ada favicon
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>Judul Website</Label>
              <Input
                value={siteConfig.siteTitle || '-'}
                readOnly
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information (View Only) */}
      <Card className="border-emerald-100 dark:border-emerald-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            Informasi Kontak
          </CardTitle>
          <CardDescription>
            Informasi kontak website (hanya lihat)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* WhatsApp */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Label>
              <Input
                value={siteConfig.contactWhatsApp || '-'}
                readOnly
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed"
              />
            </div>

            {/* Instagram */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Instagram className="w-4 h-4" />
                Instagram
              </Label>
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={siteConfig.contactInstagram || '-'}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed pl-10"
                />
              </div>
            </div>

            {/* Facebook */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Facebook className="w-4 h-4" />
                Facebook
              </Label>
              <div className="relative">
                <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={siteConfig.contactFacebook || '-'}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partner Settings (View Only) */}
      <Card className="border-emerald-100 dark:border-emerald-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-600" />
            Pengaturan Akun
          </CardTitle>
          <CardDescription>
            Informasi pengaturan akun partner Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Maintenance Mode */}
            <div className="space-y-2">
              <Label>Status Maintenance</Label>
              <Badge
                variant={siteConfig.maintenanceMode ? "destructive" : "default"}
                className="w-full justify-center py-2"
              >
                {siteConfig.maintenanceMode ? 'Aktif' : 'Nonaktif'}
              </Badge>
              <p className="text-xs text-gray-500">
                Dikontrol oleh owner
              </p>
            </div>

            {/* Tier/Badge */}
            <div className="space-y-2">
              <Label>Tier / Badge</Label>
              <div className="flex flex-col gap-1">
                <Badge className={`${getTierBadgeColor(partner.tier)} w-full justify-center py-2`}>
                  {partner.tier}
                </Badge>
                <Badge variant="outline" className="w-full justify-center border-emerald-200 dark:border-emerald-800">
                  {partner.badge}
                </Badge>
              </div>
            </div>

            {/* Commission Rate */}
            <div className="space-y-2">
              <Label>Komisi</Label>
              <Input
                value={`${(partner.commissionRate * 100).toFixed(0)}%`}
                readOnly
                className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 font-semibold cursor-not-allowed text-center"
              />
              <p className="text-xs text-gray-500">
                Dikontrol oleh owner
              </p>
            </div>

            {/* Registration Date */}
            <div className="space-y-2">
              <Label>Tanggal Registrasi</Label>
              <Input
                value={formatDate(partner.createdAt)}
                readOnly
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Account Status */}
          <div className="pt-2">
            <Label>Status Akun</Label>
            <div className="mt-2">
              <Badge
                variant={partner.status === 'Active' ? "default" : "destructive"}
                className={partner.status === 'Active' 
                  ? 'bg-emerald-500 hover:bg-emerald-600' 
                  : ''}
              >
                {partner.status === 'Active' ? 'Aktif' : 'Ditangguhkan'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
