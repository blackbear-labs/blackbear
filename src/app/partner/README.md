# Partner Dashboard

Struktur folder terpisah khusus untuk Partner Dashboard dengan organisasi modular.

## 📁 Struktur Folder

```
partner/
├── dashboard/                    # Halaman dashboard partner
│   ├── layout.tsx               # Layout wrapper (sidebar + header)
│   ├── page.tsx                 # Halaman utama dashboard
│   ├── transactions/            # Halaman manajemen transaksi
│   ├── customers/               # Halaman manajemen customer
│   ├── leaderboard/             # Halaman leaderboard
│   └── settings/                # Halaman pengaturan
└── README.md                    # Dokumentasi ini

components/partner/              # Komponen khusus partner
├── layout/                      # Komponen layout
│   ├── partner-sidebar.tsx     # Sidebar navigasi partner
│   └── partner-header.tsx      # Header dengan user info & notifikasi
├── stats/                       # Komponen statistik
│   ├── partner-stat-card.tsx   # Kartu statistik dengan trend
│   ├── tier-progress.tsx       # Progress bar tier & badge
│   └── leaderboard-item.tsx    # Item leaderboard
├── customers/                   # Komponen customer
│   └── customer-card.tsx       # Kartu customer dengan stats
├── transactions/                # Komponen transaksi
│   └── transaction-item.tsx    # Item transaksi dengan status
└── notifications/               # Komponen notifikasi (future)
```

## 🎨 Komponen yang Tersedia

### Layout Components

#### `PartnerSidebar`
- Sidebar khusus partner dengan navigasi lengkap
- Warna tema: Emerald/Teal gradient
- Responsive: Mobile sheet + Desktop sidebar
- Quick stats mini di sidebar
- Auto-close mobile menu saat navigasi

#### `PartnerHeader`
- Header dengan user info, tier badge
- Notifikasi dengan unread count
- Search bar (hidden on mobile)
- User dropdown menu

### Stats Components

#### `PartnerStatCard`
- Kartu statistik dengan icon, value, trend
- Color variants: emerald, blue, purple, orange, red, cyan
- Support untuk trend indicator vs bulan lalu
- Hover effect dengan shadow

#### `TierProgress`
- Display current tier dengan icon
- Progress bar ke next tier
- Gap indicator (berapa lagi untuk naik)
- Rank display
- Background gradient special

#### `LeaderboardItem`
- Item leaderboard dengan rank badge
- Top 3 dengan special styling (crown, gold, silver)
- Highlight untuk current user
- Tier badge display

### Transaction Components

#### `PartnerTransactionItem`
- Item transaksi dengan status icon
- Profit & nominal display
- Status: Completed, Pending, Failed
- Payment type & timestamp
- Detail button

### Customer Components

#### `CustomerCard`
- Kartu customer dengan profile info
- Label badge: VIP, Regular, Blacklist
- Mini stats: transaksi, profit, volume
- Action buttons: edit, view detail

## 🎯 Fitur Khusus Partner

1. **Color Theme**: Emerald/Teal gradient untuk identitas partner
2. **Responsive Design**: Mobile-first dengan sheet menu
3. **Tier System**: Bronze → Silver → Gold → Platinum → Diamond
4. **Badge System**: Newcomer, Rising Star, Top Performer, dll
5. **Gamification**: Progress bar, gap indicator, leaderboard
6. **Real-time Stats**: Quick update tanpa reload

## 📝 Cara Menggunakan

### Menggunakan Layout Wrapper

```tsx
// src/app/partner/dashboard/any-page/page.tsx
export default function Page() {
  return (
    <div className="space-y-6">
      <h1>Page Content</h1>
      {/* Content */}
    </div>
  )
}
```

Layout sudah otomatis terinclude dari `layout.tsx`

### Menggunakan Komponen

```tsx
import { PartnerStatCard } from '@/components/partner/stats/partner-stat-card'
import { TierProgress } from '@/components/partner/stats/tier-progress'

<PartnerStatCard
  title="Total Profit"
  value="Rp 10.000.000"
  icon={DollarSign}
  color="emerald"
  trend={{ value: '+12.5%', isPositive: true }}
/>

<TierProgress
  currentTier="Bronze"
  nextTier="Silver"
  currentProfit={3000000}
  requiredProfit={5000000}
  badge="Newcomer"
  rank={5}
/>
```

## 🚀 Halaman yang Tersedia

- `/partner/dashboard` - Dashboard utama
- `/partner/dashboard/transactions` - Manajemen transaksi
- `/partner/dashboard/customers` - Manajemen customer
- `/partner/dashboard/leaderboard` - Leaderboard lengkap
- `/partner/dashboard/settings` - Pengaturan akun

## 🎨 Design System

- **Primary Colors**: Emerald-500, Teal-600
- **Background**: Gray-50 → Emerald-50/50 gradient
- **Cards**: White with Emerald-100 border
- **Text**: Gray-900 (primary), Gray-500 (secondary)
- **Shadows**: Soft shadows with hover effects
- **Radius**: XL (16px) for cards, rounded for buttons

## 📦 Dependencies

Semua komponen menggunakan shadcn/ui components:
- Button, Card, Badge, Avatar
- DropdownMenu, Sheet, ScrollArea
- Progress, Input

Dan Lucide React icons.

## 🔒 Authentication

Layout otomatis check:
- Session existence
- Role validation (must be 'partner')
- Redirect ke `/login` jika tidak valid
- Redirect ke `/owner/dashboard` jika role salah

## 📱 Responsive Breakpoints

- Mobile: `< 768px` - Sheet menu, stacked layout
- Tablet: `768px - 1024px` - Compact sidebar
- Desktop: `> 1024px` - Full sidebar (w-72)

## 🎯 Best Practices

1. Selalu gunakan komponen partner yang sudah disediakan
2. Pertahankan consistency color theme (emerald/teal)
3. Gunakan layout.tsx wrapper untuk semua halaman partner
4. Ikuti pattern yang sudah ada untuk halaman baru
5. Responsive design harus diuji di semua breakpoints
