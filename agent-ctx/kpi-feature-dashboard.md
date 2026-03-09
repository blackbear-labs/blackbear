# Task ID: kpi-feature - Partner KPI Feature

## Work Task
Add Partner KPI feature with monthly tracking, target progress, achievement badges, and Customer Profit Contribution with top 1-5 highlight with medals.

## Work Summary

### Database Model Added:

**PartnerKPI Model** (`prisma/schema.prisma`)
- `id`: Unique identifier
- `partnerId`: Reference to partner
- `year`, `month`: Monthly KPI period
- `totalProfit`: Total profit for the month
- `totalVolume`: Total transaction volume
- `totalTrans`: Total transactions count
- `newCustomers`: New customers acquired
- `avgTransaction`: Average transaction value
- `targetProgress`: Percentage of target achieved
- `targetAchieved`: Boolean flag for target achievement
- Unique constraint on partnerId + year + month

**Partner Model Updated** (`prisma/schema.prisma`)
- Added `kpiTarget` field (monthly target, default 5M)
- Added `kpis` relation to PartnerKPI model

### API Routes Created:

1. **GET /api/partners/[id]/kpi** (`src/app/api/partners/[id]/kpi/route.ts`)
   - Fetches partner KPI data with optional year/month filter
   - Returns current month KPI with trend calculations
   - Includes previous month comparison
   - Returns last 12 months KPI data for chart
   - Calculates total achievements and average progress
   - Returns kpiTarget for the partner

2. **POST /api/partners/[id]/kpi/calculate** (`src/app/api/partners/[id]/kpi/calculate/route.ts`)
   - Calculates and updates KPI for a specific month
   - Computes all metrics from completed transactions
   - Tracks new customers (first transaction with partner in month)
   - Calculates target progress percentage
   - Sets targetAchieved flag when target is met
   - Upserts KPI record

3. **GET /api/stats/customer-contribution** (`src/app/api/stats/customer-contribution/route.ts`)
   - Returns top customers by profit contribution
   - Supports period filter: weekly, monthly, yearly
   - Optional partnerId filter for partner-specific view
   - Returns contribution percentage
   - Includes partner breakdown for each customer
   - Returns top 5 by default with configurable limit

### UI Components Created:

1. **PartnerKPICard** (`src/components/dashboard/partner-kpi-card.tsx`)
   - Monthly KPI overview with target progress bar
   - Achievement badge display when target is achieved
   - Stats grid: Profit, Volume, Transactions, New Customers
   - Trend indicators comparing to previous month
   - 12-month profit trend chart
   - Achievement history summary
   - Manual KPI calculation button

2. **CustomerContributionSection** (`src/components/dashboard/customer-contribution.tsx`)
   - Top 5 customers highlighted with medals (Crown, Medal, Award, Star)
   - Gold/Silver/Bronze styling for top 3
   - Contribution percentage and transaction count
   - Customer label badges (VIP, REGULAR, NEW, BLACKLIST)
   - Partner breakdown for each customer
   - Period filter (weekly, monthly, yearly)
   - Click callback for customer detail navigation

### Types Added:

- PartnerKPI interface
- PartnerKPIWithTrend interface
- PartnerKPISummary interface
- CustomerContribution interface

### Files Created:
- `prisma/schema.prisma` (updated - added PartnerKPI model, kpiTarget field)
- `src/app/api/partners/[id]/kpi/route.ts` (created)
- `src/app/api/partners/[id]/kpi/calculate/route.ts` (created)
- `src/app/api/stats/customer-contribution/route.ts` (created)
- `src/components/dashboard/partner-kpi-card.tsx` (created)
- `src/components/dashboard/customer-contribution.tsx` (created)
- `src/types/index.ts` (updated - added KPI and CustomerContribution types)

### Database Migration:
- Ran `npm run db:push` - successful
- All lint checks passed
