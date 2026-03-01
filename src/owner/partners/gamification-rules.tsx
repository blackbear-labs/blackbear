import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star, Crown, Gem, Diamond } from 'lucide-react'

interface GamificationRulesProps {
  className?: string
}

export function GamificationRules({ className }: GamificationRulesProps) {
  const tiers = [
    {
      name: 'Bronze',
      icon: Trophy,
      color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-200 dark:border-amber-800',
      profitRange: '0 - 5M',
      description: 'Tier awal untuk mitra baru'
    },
    {
      name: 'Silver',
      icon: Star,
      color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
      borderColor: 'border-gray-200 dark:border-gray-700',
      profitRange: '5M - 15M',
      description: 'Mitra dengan performa baik'
    },
    {
      name: 'Gold',
      icon: Crown,
      color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      profitRange: '15M - 50M',
      description: 'Mitra top performer'
    },
    {
      name: 'Platinum',
      icon: Gem,
      color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
      borderColor: 'border-slate-200 dark:border-slate-700',
      profitRange: '50M - 100M',
      description: 'Mitra elite'
    },
    {
      name: 'Diamond',
      icon: Diamond,
      color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
      borderColor: 'border-cyan-200 dark:border-cyan-800',
      profitRange: '100M+',
      description: 'Mitra premium tertinggi'
    }
  ]

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-600" />
          Aturan Gamification Tier
        </CardTitle>
        <CardDescription>
          Tier otomatis berdasarkan total profit mitra
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tiers.map((tier) => {
            const Icon = tier.icon
            return (
              <div
                key={tier.name}
                className={`p-4 border rounded-lg hover:shadow-md transition-all ${tier.borderColor}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${tier.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{tier.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {tier.profitRange}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {tier.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Catatan:</strong> Tier akan otomatis diperbarui berdasarkan total profit mitra. Owner dapat melakukan override tier manual melalui menu aksi.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
