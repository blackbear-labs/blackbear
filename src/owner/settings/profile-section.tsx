'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, Lock, Image as ImageIcon, AlertCircle } from 'lucide-react'

interface ProfileSectionProps {
  formData: {
    ownerName: string
    ownerEmail: string
    ownerPassword: string
    confirmPassword: string
    avatarProfile: string
  }
  onChange: (data: any) => void
  errors: any
}

export function ProfileSection({ formData, onChange, errors }: ProfileSectionProps) {
  // Email is read-only after creation (if it already has a value)
  const isEmailReadonly = !!formData.ownerEmail

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          <CardTitle>Edit Profile</CardTitle>
        </div>
        <CardDescription>
          Kelola informasi profil pemilik platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="ownerName" className="flex items-center gap-2">
            Nama <span className="text-red-500">*</span>
          </Label>
          <Input
            id="ownerName"
            value={formData.ownerName}
            onChange={(e) => onChange({ ...formData, ownerName: e.target.value })}
            placeholder="Nama lengkap pemilik"
            className={errors.ownerName ? 'border-red-500' : ''}
          />
          {errors.ownerName && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.ownerName}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="ownerEmail" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="ownerEmail"
            type="email"
            value={formData.ownerEmail}
            onChange={(e) => !isEmailReadonly && onChange({ ...formData, ownerEmail: e.target.value })}
            placeholder="owner@example.com"
            readOnly={isEmailReadonly}
            className={errors.ownerEmail ? 'border-red-500' : ''}
            disabled={isEmailReadonly}
          />
          {isEmailReadonly && (
            <p className="text-xs text-gray-500 mt-1">
              Email tidak dapat diubah setelah dibuat
            </p>
          )}
          {errors.ownerEmail && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.ownerEmail}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="ownerPassword" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Password (Opsional)
          </Label>
          <Input
            id="ownerPassword"
            type="password"
            value={formData.ownerPassword}
            onChange={(e) => onChange({ ...formData, ownerPassword: e.target.value })}
            placeholder="Minimal 6 karakter"
            className={errors.ownerPassword ? 'border-red-500' : ''}
          />
          {errors.ownerPassword && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.ownerPassword}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Konfirmasi Password
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => onChange({ ...formData, confirmPassword: e.target.value })}
            placeholder="Ulangi password"
            className={errors.confirmPassword ? 'border-red-500' : ''}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="avatarProfile" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Avatar Profile (Opsional)
          </Label>
          <Input
            id="avatarProfile"
            type="url"
            value={formData.avatarProfile}
            onChange={(e) => onChange({ ...formData, avatarProfile: e.target.value })}
            placeholder="https://example.com/avatar.jpg"
            className={errors.avatarProfile ? 'border-red-500' : ''}
          />
          {errors.avatarProfile && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errors.avatarProfile}
            </p>
          )}
        </div>

        {formData.avatarProfile && (
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              <img
                src={formData.avatarProfile}
                alt="Avatar Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2"%3E%3Ccircle cx="12" cy="8" r="4"/%3E%3Cpath d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/%3E%3C/svg%3E'
                }}
              />
            </div>
            <div className="text-sm">
              <p className="font-medium">Preview Avatar</p>
              <p className="text-xs text-gray-500 break-all">{formData.avatarProfile}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
