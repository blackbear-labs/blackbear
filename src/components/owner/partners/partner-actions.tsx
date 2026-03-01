import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreVertical,
  UserCheck,
  UserX,
  Crown,
  Megaphone,
  Eye,
  AlertCircle
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Partner {
  id: string
  name: string
  email: string
  status: string
  tier: string
}

interface PartnerActionsProps {
  partner: Partner
  onViewDetails: (partner: Partner) => void
  onToggleStatus: (partner: Partner) => void
  onOverrideTier: (partner: Partner) => void
  onSendAnnouncement: (partner: Partner) => void
}

export function PartnerActions({
  partner,
  onViewDetails,
  onToggleStatus,
  onOverrideTier,
  onSendAnnouncement
}: PartnerActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => onViewDetails(partner)}>
          <Eye className="w-4 h-4 mr-2" />
          Lihat Detail
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onOverrideTier(partner)}>
          <Crown className="w-4 h-4 mr-2" />
          Override Tier
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onToggleStatus(partner)}>
          {partner.status === 'Active' ? (
            <>
              <UserX className="w-4 h-4 mr-2 text-red-600" />
              <span className="text-red-600">Suspend</span>
            </>
          ) : (
            <>
              <UserCheck className="w-4 h-4 mr-2 text-green-600" />
              <span className="text-green-600">Aktifkan</span>
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => onSendAnnouncement(partner)}>
          <Megaphone className="w-4 h-4 mr-2" />
          Kirim Pengumuman
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
