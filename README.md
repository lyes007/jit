# JIT Production Dashboard

A comprehensive Next.js web application for monitoring and analyzing Just-In-Time production data. This dashboard provides real-time insights into production quantities, balanced quantities alerts, TRS (Overall Equipment Effectiveness), and additional analytics.

## Features

### Dashboard 1: Production & Consumption
- Total production quantities (good vs rejected)
- Production by machine, article, date, operator
- Material consumption tracking
- Production trends over time
- Quality metrics (rejection rates)
- Top producing articles table

### Dashboard 2: Balanced Quantities Alert
- Real-time alerts for fiscaux ready for assembly
- Position availability per fiscaux
- Balanced units calculation
- Warehouse manager notifications
- Auto-refresh capability (30-second intervals)

### Dashboard 3: TRS & Time
- TRS (Overall Equipment Effectiveness) by machine
- Availability, Performance, Quality breakdown
- Time consumption analysis
- Machine comparison charts
- TRS trends over time

### Dashboard 4: Additional Analytics
- Production efficiency metrics
- Quality analysis (defect rates)
- Material inventory levels
- Operator performance rankings
- Machine utilization rates

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts
- **Database**: PostgreSQL (Neon)
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon) with JIT data warehouse schema

## Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd jit-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL="postgresql://neondb_owner:npg_Gul7SO5geprM@ep-bold-recipe-agkib6vd-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
jit-dashboard/
├── app/
│   ├── (dashboard)/          # Dashboard route group
│   │   ├── layout.tsx        # Dashboard layout with sidebar
│   │   ├── page.tsx          # Overview/home dashboard
│   │   ├── production/       # Dashboard 1
│   │   ├── balanced/         # Dashboard 2
│   │   ├── trs/              # Dashboard 3
│   │   └── analytics/        # Dashboard 4
│   ├── api/                  # API routes
│   │   ├── production/
│   │   ├── balanced/
│   │   ├── trs/
│   │   ├── analytics/
│   │   └── filters/
│   └── layout.tsx            # Root layout
├── components/
│   ├── dashboard/            # Dashboard components
│   ├── charts/               # Chart components
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── db.ts                 # Database connection
│   ├── queries.ts            # SQL query functions
│   └── utils.ts              # Utility functions
└── types/
    └── index.ts              # TypeScript types
```

## API Endpoints

### Production Data
- `GET /api/production` - Get production data
  - Query params: `startDate`, `endDate`, `machineIds`, `articleIds`, `kpisOnly`

### TRS Data
- `GET /api/trs` - Get TRS metrics
  - Query params: `startDate`, `endDate`, `machineIds`

### Balanced Quantities
- `GET /api/balanced` - Get balanced quantities alerts

### Analytics
- `GET /api/analytics` - Get analytics data
  - Query params: `startDate`, `endDate`

### Filters
- `GET /api/filters` - Get available filters (machines, articles)

## Features

### Real-Time Updates
- Auto-refresh on Balanced Quantities dashboard (30-second intervals)
- Manual refresh button on all dashboards
- Last updated timestamp display

### Filtering
- Date range picker with presets (Today, Week, Month, Year)
- Machine filter (multi-select)
- Article filter (search and select)
- Operator filter

### Responsive Design
- Mobile-friendly layout
- Tablet optimization
- Desktop-optimized views
- Adaptive grid layouts

### Data Visualization
- Line charts for trends
- Bar charts for comparisons
- Stacked charts for composition
- Tables for detailed data
- KPI cards for key metrics

## Development

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Lint Code
```bash
npm run lint
```

## Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Set Environment Variables:**
   - Go to Vercel dashboard
   - Add `DATABASE_URL` environment variable

### Deploy to Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Docker containers

## Database Schema

The dashboard connects to a PostgreSQL data warehouse with the following key tables:

- `jit_dw.fact_production` - Production facts
- `jit_dw.fact_trs` - TRS metrics
- `jit_dw.fact_balanced_quantities` - Balanced quantities
- `jit_dw.fact_material_consumption` - Material consumption
- `jit_dw.dim_machine` - Machine dimension
- `jit_dw.dim_article` - Article dimension
- `jit_dw.dim_time` - Time dimension
- `jit_dw.dim_operator` - Operator dimension
- `jit_dw.dim_location` - Location dimension

## Verification

### Quick Verification

Run the automated verification script to check your setup:

```bash
npm run verify
```

This checks:
- Database connection
- Schema completeness
- Data population status
- Data quality
- Referential integrity

### Manual Verification

See `QUICK_VERIFICATION.md` for step-by-step verification guide.

See `VERIFICATION_CHECKLIST.md` for comprehensive verification checklist.

## Troubleshooting

### Database Connection Issues
- Run `npm run setup` to create `.env.local`
- Verify `DATABASE_URL` in `.env.local`
- Check SSL settings (should include `sslmode=require`)
- Ensure database is accessible from your network
- Restart dev server after creating/updating `.env.local`

### No Data Showing
- Run `npm run verify` to check data warehouse status
- Check database connection
- Verify data exists in the data warehouse
- Check browser console for errors
- Verify API routes are working (`/api/production`, etc.)
- Ensure date filters aren't excluding all data

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build`

### API Returns HTML Instead of JSON
- This means DATABASE_URL is missing
- Run `npm run setup` to create `.env.local`
- Restart dev server

## Contributing

This is a project for academic purposes. For improvements:
1. Test all changes thoroughly
2. Ensure TypeScript types are correct
3. Follow existing code style
4. Update documentation as needed

## License

Academic project - Internal use only

## Support

For issues or questions:
- Check the documentation in `/docs` folder
- Review the data warehouse setup guide
- Check database connection and queries

---

**Built for JIT Production Optimization Project**
