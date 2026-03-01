'use client'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Settings, ExternalLink, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface MaintenanceSectionProps {
  maintenanceMode: boolean
  onChange: (value: boolean) => void
}

export function MaintenanceSection({ maintenanceMode, onChange }: MaintenanceSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-orange-600" />
          <CardTitle>Maintenance Mode</CardTitle>
        </div>
        <CardDescription>
          Aktifkan mode maintenance untuk menampilkan halaman perbaikan di landing page
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${maintenanceMode ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
              {maintenanceMode ? (
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
            </div>
            <div>
              <Label htmlFor="maintenance-mode" className="text-base font-semibold cursor-pointer">
                Status Maintenance
              </Label>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {maintenanceMode
                  ? 'Maintenance aktif - Landing page menampilkan mode perbaikan'
                  : 'Normal - Landing page beroperasi seperti biasa'
                }
              </p>
            </div>
          </div>
          <Switch
            id="maintenance-mode"
            checked={maintenanceMode}
            onCheckedChange={onChange}
          />
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={maintenanceMode ? 'destructive' : 'default'}>
            {maintenanceMode ? 'Active' : 'Inactive'}
          </Badge>
          {maintenanceMode && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Perhatian
            </Badge>
          )}
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Mode Maintenance
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                Saat aktif, semua pengunjung landing page akan melihat halaman maintenance
                dengan informasi bahwa website sedang dalam perbaikan. Anda masih dapat
                mengakses dashboard untuk mengelola platform.
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.open('/maintenance', '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Preview Maintenance Page
        </Button>
      </CardContent>
    </Card>
  )
}
