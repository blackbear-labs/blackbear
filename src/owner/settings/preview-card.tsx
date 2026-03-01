'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Eye, Phone, Instagram, Facebook, Globe } from 'lucide-react'

interface PreviewCardProps {
  data: {
    logoUrl: string
    siteTitle: string
    contactWhatsApp: string
    contactInstagram: string
    contactFacebook: string
    ownerName: string
    ownerEmail: string
    metaTitle: string
  }
}

export function PreviewCard({ data }: PreviewCardProps) {
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-600" />
          <CardTitle>Live Preview</CardTitle>
        </div>
        <CardDescription>
          Preview tampilan di landing page
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Header Preview */}
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {data.logoUrl ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white dark:bg-gray-700 flex items-center justify-center p-1">
                  <img
                    src={data.logoUrl}
                    alt="Logo"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-lg">{data.siteTitle || 'Nama Website'}</h3>
                <p className="text-xs text-gray-500">Platform Gestun Terpercaya</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Content Preview */}
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Browser Tab Title</p>
            <p className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
              {data.metaTitle || data.siteTitle || 'Gestun Platform'}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Owner</p>
            <div className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
              <p className="font-medium">{data.ownerName || 'Nama Owner'}</p>
              <p className="text-xs text-gray-500">{data.ownerEmail || 'email@example.com'}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Contact Preview */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Kontak Tersedia</p>
          <div className="space-y-2">
            {data.contactWhatsApp && (
              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <Phone className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  WhatsApp
                </span>
                <Badge variant="outline" className="ml-auto text-xs">Active</Badge>
              </div>
            )}

            {data.contactInstagram && (
              <div className="flex items-center gap-2 p-2 bg-pink-50 dark:bg-pink-950/30 rounded-lg">
                <Instagram className="w-4 h-4 text-pink-600" />
                <span className="text-sm font-medium text-pink-700 dark:text-pink-300">
                  Instagram
                </span>
                <Badge variant="outline" className="ml-auto text-xs">Active</Badge>
              </div>
            )}

            {data.contactFacebook && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <Facebook className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Facebook
                </span>
                <Badge variant="outline" className="ml-auto text-xs">Active</Badge>
              </div>
            )}

            {!data.contactWhatsApp && !data.contactInstagram && !data.contactFacebook && (
              <p className="text-sm text-gray-500 text-center py-4">
                Belum ada kontak yang diatur
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* SEO Preview */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Preview Search Result</p>
          <div className="p-3 bg-white dark:bg-gray-900 border rounded-lg space-y-1">
            <p className="text-sm text-blue-600 hover:underline cursor-pointer truncate">
              {data.metaTitle || data.siteTitle || 'Judul Website'}
            </p>
            <p className="text-xs text-green-700 truncate">https://example.com</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
              Deskripsi SEO akan muncul di sini untuk hasil pencarian...
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
