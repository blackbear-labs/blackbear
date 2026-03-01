'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, AlertCircle } from 'lucide-react'

interface SEOSectionProps {
  formData: {
    metaTitle: string
    metaDescription: string
  }
  onChange: (data: any) => void
  errors: any
}

export function SEOSection({ formData, onChange, errors }: SEOSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-emerald-600" />
          <CardTitle>SEO Tools</CardTitle>
        </div>
        <CardDescription>
          Optimasi website untuk mesin pencari
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="metaTitle" className="flex items-center gap-2">
            Meta Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="metaTitle"
            value={formData.metaTitle}
            onChange={(e) => onChange({ ...formData, metaTitle: e.target.value })}
            placeholder="Judul untuk HTML (50-60 karakter)"
            maxLength={60}
            className={errors.metaTitle ? 'border-red-500' : ''}
          />
          <div className="flex justify-between mt-1">
            {errors.metaTitle ? (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.metaTitle}
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                Digunakan sebagai judul halaman di browser dan hasil pencarian
              </p>
            )}
            <p className="text-xs text-gray-400">
              {formData.metaTitle.length}/60
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="metaDescription" className="flex items-center gap-2">
            Meta Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="metaDescription"
            value={formData.metaDescription}
            onChange={(e) => onChange({ ...formData, metaDescription: e.target.value })}
            placeholder="Deskripsi untuk SEO (150-160 karakter)"
            maxLength={160}
            rows={3}
            className={errors.metaDescription ? 'border-red-500' : ''}
          />
          <div className="flex justify-between mt-1">
            {errors.metaDescription ? (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.metaDescription}
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                Ringkasan halaman yang muncul di hasil pencarian
              </p>
            )}
            <p className="text-xs text-gray-400">
              {formData.metaDescription.length}/160
            </p>
          </div>
        </div>

        {/* Preview SEO */}
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <p className="text-xs text-gray-500 mb-2">Preview Google Search:</p>
          <div className="max-w-md">
            <p className="text-sm text-blue-600 hover:underline cursor-pointer truncate">
              {formData.metaTitle || 'Judul Halaman'}
            </p>
            <p className="text-xs text-green-700 truncate">
              {typeof window !== 'undefined' && window.location.href}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {formData.metaDescription || 'Deskripsi halaman akan muncul di sini...'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
