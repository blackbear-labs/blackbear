'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { ProfileSection } from '@/components/owner/settings/profile-section'
import { BrandingSection } from '@/components/owner/settings/branding-section'
import { SEOSection } from '@/components/owner/settings/seo-section'
import { ContactSection } from '@/components/owner/settings/contact-section'
import { MaintenanceSection } from '@/components/owner/settings/maintenance-section'
import { PreviewCard } from '@/components/owner/settings/preview-card'
import { Settings, User, Globe, Search, Phone, Eye, Save, RotateCcw, ExternalLink } from 'lucide-react'

interface SiteConfig {
  id: string
  siteTitle: string
  logoUrl: string | null
  faviconUrl: string | null
  metaTitle: string | null
  metaDescription: string | null
  ownerName: string | null
  ownerEmail: string | null
  ownerPassword: string | null
  contactWhatsApp: string | null
  contactInstagram: string | null
  contactFacebook: string | null
  maintenanceMode: boolean
}

const defaultFormData = {
  // Profile
  ownerName: '',
  ownerEmail: '',
  ownerPassword: '',
  confirmPassword: '',
  avatarProfile: '',
  // Branding
  logoUrl: '',
  faviconUrl: '',
  siteTitle: '',
  // SEO
  metaTitle: '',
  metaDescription: '',
  // Contact
  contactWhatsApp: '',
  contactInstagram: '',
  contactFacebook: '',
  // Maintenance
  maintenanceMode: false
}

export default function OwnerSettingsPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [formData, setFormData] = useState(defaultFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setMounted(true)
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/site-config')
      const data = await response.json()

      if (data.config) {
        setConfig(data.config)
        setFormData({
          ownerName: data.config.ownerName || '',
          ownerEmail: data.config.ownerEmail || '',
          ownerPassword: '',
          confirmPassword: '',
          avatarProfile: '',
          logoUrl: data.config.logoUrl || '',
          faviconUrl: data.config.faviconUrl || '',
          siteTitle: data.config.siteTitle || '',
          metaTitle: data.config.metaTitle || '',
          metaDescription: data.config.metaDescription || '',
          contactWhatsApp: data.config.contactWhatsApp || '',
          contactInstagram: data.config.contactInstagram || '',
          contactFacebook: data.config.contactFacebook || '',
          maintenanceMode: data.config.maintenanceMode || false
        })
      }
    } catch (error) {
      console.error('Error fetching config:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat konfigurasi',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Profile validation
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Nama wajib diisi'
    }
    if (!formData.ownerEmail.trim()) {
      newErrors.ownerEmail = 'Email wajib diisi'
    } else if (!formData.ownerEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.ownerEmail = 'Format email tidak valid'
    }
    if (formData.ownerPassword && formData.ownerPassword.length < 6) {
      newErrors.ownerPassword = 'Password minimal 6 karakter'
    }
    if (formData.ownerPassword && formData.ownerPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok'
    }
    if (formData.avatarProfile && !formData.avatarProfile.match(/^https?:\/\/.+/)) {
      newErrors.avatarProfile = 'URL avatar harus dimulai dengan http:// atau https://'
    }

    // Branding validation
    if (!formData.siteTitle.trim()) {
      newErrors.siteTitle = 'Title website wajib diisi'
    }
    if (formData.logoUrl && !formData.logoUrl.match(/^https?:\/\/.+/)) {
      newErrors.logoUrl = 'URL logo harus dimulai dengan http:// atau https://'
    }
    if (formData.faviconUrl && !formData.faviconUrl.match(/^https?:\/\/.+/)) {
      newErrors.faviconUrl = 'URL favicon harus dimulai dengan http:// atau https://'
    }

    // SEO validation
    if (!formData.metaTitle.trim()) {
      newErrors.metaTitle = 'Meta title wajib diisi'
    }
    if (!formData.metaDescription.trim()) {
      newErrors.metaDescription = 'Meta description wajib diisi'
    }

    // Contact validation
    if (!formData.contactWhatsApp.trim()) {
      newErrors.contactWhatsApp = 'WhatsApp wajib diisi'
    } else if (!formData.contactWhatsApp.match(/^08\d{8,11}$/)) {
      newErrors.contactWhatsApp = 'Format WhatsApp harus 08xxxxxxxxxx (10-13 digit)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: 'Validasi Error',
        description: 'Mohon periksa kembali formulir Anda',
        variant: 'destructive'
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteTitle: formData.siteTitle,
          logoUrl: formData.logoUrl || null,
          faviconUrl: formData.faviconUrl || null,
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
          ownerName: formData.ownerName,
          ownerEmail: formData.ownerEmail,
          ownerPassword: formData.ownerPassword || undefined,
          contactWhatsApp: formData.contactWhatsApp,
          contactInstagram: formData.contactInstagram || null,
          contactFacebook: formData.contactFacebook || null,
          maintenanceMode: formData.maintenanceMode
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Berhasil!',
          description: 'Konfigurasi berhasil disimpan',
          variant: 'default'
        })
        fetchConfig()
        // Clear password fields after save
        setFormData(prev => ({
          ...prev,
          ownerPassword: '',
          confirmPassword: ''
        }))
      } else {
        throw new Error(data.error || 'Gagal menyimpan konfigurasi')
      }
    } catch (error: any) {
      console.error('Error saving config:', error)
      toast({
        title: 'Error',
        description: error.message || 'Gagal menyimpan konfigurasi',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (config) {
      setFormData({
        ownerName: config.ownerName || '',
        ownerEmail: config.ownerEmail || '',
        ownerPassword: '',
        confirmPassword: '',
        avatarProfile: '',
        logoUrl: config.logoUrl || '',
        faviconUrl: config.faviconUrl || '',
        siteTitle: config.siteTitle || '',
        metaTitle: config.metaTitle || '',
        metaDescription: config.metaDescription || '',
        contactWhatsApp: config.contactWhatsApp || '',
        contactInstagram: config.contactInstagram || '',
        contactFacebook: config.contactFacebook || '',
        maintenanceMode: config.maintenanceMode || false
      })
      setErrors({})
      toast({
        title: 'Reset',
        description: 'Formulir telah direset ke nilai terakhir',
        variant: 'default'
      })
    }
  }

  const handlePreviewMaintenance = () => {
    window.open('/maintenance', '_blank')
  }

  if (!mounted) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Settings className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Memuat konfigurasi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pengaturan Website
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola konfigurasi tampilan dan fungsionalitas website
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={saving}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">
                <User className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="branding">
                <Globe className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Branding</span>
              </TabsTrigger>
              <TabsTrigger value="seo">
                <Search className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">SEO</span>
              </TabsTrigger>
              <TabsTrigger value="contact">
                <Phone className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Kontak</span>
              </TabsTrigger>
              <TabsTrigger value="maintenance">
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Maintenance</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileSection
                formData={{
                  ownerName: formData.ownerName,
                  ownerEmail: formData.ownerEmail,
                  ownerPassword: formData.ownerPassword,
                  confirmPassword: formData.confirmPassword,
                  avatarProfile: formData.avatarProfile
                }}
                onChange={(data) => setFormData({ ...formData, ...data })}
                errors={errors}
              />
            </TabsContent>

            <TabsContent value="branding">
              <BrandingSection
                formData={{
                  logoUrl: formData.logoUrl,
                  faviconUrl: formData.faviconUrl,
                  siteTitle: formData.siteTitle
                }}
                onChange={(data) => setFormData({ ...formData, ...data })}
                errors={errors}
              />
            </TabsContent>

            <TabsContent value="seo">
              <SEOSection
                formData={{
                  metaTitle: formData.metaTitle,
                  metaDescription: formData.metaDescription
                }}
                onChange={(data) => setFormData({ ...formData, ...data })}
                errors={errors}
              />
            </TabsContent>

            <TabsContent value="contact">
              <ContactSection
                formData={{
                  contactWhatsApp: formData.contactWhatsApp,
                  contactInstagram: formData.contactInstagram,
                  contactFacebook: formData.contactFacebook
                }}
                onChange={(data) => setFormData({ ...formData, ...data })}
                errors={errors}
              />
            </TabsContent>

            <TabsContent value="maintenance">
              <MaintenanceSection
                maintenanceMode={formData.maintenanceMode}
                onChange={(value) => setFormData({ ...formData, maintenanceMode: value })}
              />
            </TabsContent>
          </Tabs>

          {/* Additional Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handlePreviewMaintenance}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Preview Maintenance Page
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open('/', '_blank')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Landing Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Sidebar */}
        <div className="lg:col-span-1">
          <PreviewCard
            data={{
              logoUrl: formData.logoUrl,
              siteTitle: formData.siteTitle,
              contactWhatsApp: formData.contactWhatsApp,
              contactInstagram: formData.contactInstagram,
              contactFacebook: formData.contactFacebook,
              ownerName: formData.ownerName,
              ownerEmail: formData.ownerEmail,
              metaTitle: formData.metaTitle
            }}
          />
        </div>
      </div>
    </div>
  )
}
