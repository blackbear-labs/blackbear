'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, Instagram, Facebook, AlertCircle, ExternalLink } from 'lucide-react'

interface ContactSectionProps {
  formData: {
    contactWhatsApp: string
    contactInstagram: string
    contactFacebook: string
  }
  onChange: (data: any) => void
  errors: any
}

export function ContactSection({ formData, onChange, errors }: ContactSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-green-600" />
          <CardTitle>Kontak Informasi</CardTitle>
        </div>
        <CardDescription>
          Kelola informasi kontak untuk pelanggan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="contactWhatsApp" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            WhatsApp Contact <span className="text-red-500">*</span>
          </Label>
          <Input
            id="contactWhatsApp"
            type="tel"
            value={formData.contactWhatsApp}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '')
              onChange({ ...formData, contactWhatsApp: value })
            }}
            placeholder="08xxxxxxxxxx"
            className={errors.contactWhatsApp ? 'border-red-500' : ''}
          />
          {errors.contactWhatsApp && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.contactWhatsApp}
            </p>
          )}
          {formData.contactWhatsApp && !errors.contactWhatsApp && (
            <a
              href={`https://wa.me/${formData.contactWhatsApp.replace(/^0/, '62')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-600 hover:underline flex items-center gap-1 mt-1"
            >
              <ExternalLink className="w-3 h-3" />
              Buka WhatsApp: {formData.contactWhatsApp}
            </a>
          )}
        </div>

        <div>
          <Label htmlFor="contactInstagram" className="flex items-center gap-2">
            <Instagram className="w-4 h-4" />
            Instagram (Opsional)
          </Label>
          <Input
            id="contactInstagram"
            value={formData.contactInstagram}
            onChange={(e) => onChange({ ...formData, contactInstagram: e.target.value })}
            placeholder="username only (tanpa @)"
            className={errors.contactInstagram ? 'border-red-500' : ''}
          />
          {errors.contactInstagram && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.contactInstagram}
            </p>
          )}
          {formData.contactInstagram && !errors.contactInstagram && (
            <a
              href={`https://instagram.com/${formData.contactInstagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-pink-600 hover:underline flex items-center gap-1 mt-1"
            >
              <ExternalLink className="w-3 h-3" />
              Buka Instagram: @{formData.contactInstagram.replace('@', '')}
            </a>
          )}
        </div>

        <div>
          <Label htmlFor="contactFacebook" className="flex items-center gap-2">
            <Facebook className="w-4 h-4" />
            Facebook (Opsional)
          </Label>
          <Input
            id="contactFacebook"
            value={formData.contactFacebook}
            onChange={(e) => onChange({ ...formData, contactFacebook: e.target.value })}
            placeholder="username or page name"
            className={errors.contactFacebook ? 'border-red-500' : ''}
          />
          {errors.contactFacebook && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.contactFacebook}
            </p>
          )}
          {formData.contactFacebook && !errors.contactFacebook && (
            <a
              href={`https://facebook.com/${formData.contactFacebook}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
            >
              <ExternalLink className="w-3 h-3" />
              Buka Facebook: {formData.contactFacebook}
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
