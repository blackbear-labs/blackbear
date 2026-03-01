'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, Image as ImageIcon, AlertCircle } from 'lucide-react'

interface BrandingSectionProps {
  formData: {
    logoUrl: string
    faviconUrl: string
    siteTitle: string
  }
  onChange: (data: any) => void
  errors: any
}

export function BrandingSection({ formData, onChange, errors }: BrandingSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-purple-600" />
          <CardTitle>Website Branding</CardTitle>
        </div>
        <CardDescription>
          Kelola tampilan dan identitas website
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="logoUrl" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Logo Website (Opsional)
          </Label>
          <Input
            id="logoUrl"
            type="url"
            value={formData.logoUrl}
            onChange={(e) => onChange({ ...formData, logoUrl: e.target.value })}
            placeholder="https://example.com/logo.png"
            className={errors.logoUrl ? 'border-red-500' : ''}
          />
          {errors.logoUrl && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.logoUrl}
            </p>
          )}
        </div>

        {formData.logoUrl && (
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-white dark:bg-gray-700 flex items-center justify-center p-2">
              <img
                src={formData.logoUrl}
                alt="Logo Preview"
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"/%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"/%3E%3Cpolyline points="21 15 16 10 5 21"/%3E%3C/svg%3E'
                }}
              />
            </div>
            <div className="text-sm">
              <p className="font-medium">Preview Logo</p>
              <p className="text-xs text-gray-500 break-all">{formData.logoUrl}</p>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="faviconUrl" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Favicon Icon (Opsional)
          </Label>
          <Input
            id="faviconUrl"
            type="url"
            value={formData.faviconUrl}
            onChange={(e) => onChange({ ...formData, faviconUrl: e.target.value })}
            placeholder="https://example.com/favicon.ico"
            className={errors.faviconUrl ? 'border-red-500' : ''}
          />
          {errors.faviconUrl && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.faviconUrl}
            </p>
          )}
        </div>

        {formData.faviconUrl && (
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="w-8 h-8 rounded overflow-hidden bg-white dark:bg-gray-700">
              <img
                src={formData.faviconUrl}
                alt="Favicon Preview"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"/%3E%3C/svg%3E'
                }}
              />
            </div>
            <div className="text-sm">
              <p className="font-medium">Preview Favicon</p>
              <p className="text-xs text-gray-500 break-all">{formData.faviconUrl}</p>
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="siteTitle" className="flex items-center gap-2">
            Title Website <span className="text-red-500">*</span>
          </Label>
          <Input
            id="siteTitle"
            value={formData.siteTitle}
            onChange={(e) => onChange({ ...formData, siteTitle: e.target.value })}
            placeholder="Nama website"
            className={errors.siteTitle ? 'border-red-500' : ''}
          />
          {errors.siteTitle && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.siteTitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
