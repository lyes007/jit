# Dashboard Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd jit-dashboard
npm install
```

### 2. Configure Environment

**Option A: Use the setup script (Recommended)**

Run the setup script to automatically create `.env.local`:

```bash
node scripts/setup-env.js
```

This will create `.env.local` with the default Neon connection string.

**Option B: Manual setup**

Create a `.env.local` file manually in the `jit-dashboard` directory:

```env
DATABASE_URL="postgresql://neondb_owner:npg_Gul7SO5geprM@ep-bold-recipe-agkib6vd-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

**Important**: The connection string must include:
- `sslmode=require` (required for Neon)
- `channel_binding=require` (required for Neon)

### 3. Run Development Server

```bash
npm run dev
```

The dashboard will be available at: http://localhost:3000

### 4. Verify Database Connection

The dashboard will automatically connect to the database when you load any page. If you see errors:
- Check that `.env.local` exists and has the correct `DATABASE_URL`
- Verify the database is accessible
- Check the browser console for specific error messages

## Project Structure

```
jit-dashboard/
├── app/
│   ├── (dashboard)/       # All dashboard pages
│   │   ├── page.tsx       # Overview
│   │   ├── production/    # Dashboard 1
│   │   ├── balanced/      # Dashboard 2
│   │   ├── trs/           # Dashboard 3
│   │   └── analytics/     # Dashboard 4
│   └── api/               # API routes
├── components/
│   ├── dashboard/         # Reusable dashboard components
│   ├── charts/            # Chart components
│   └── ui/                # shadcn/ui components
└── lib/
    ├── db.ts              # Database connection
    └── queries.ts         # SQL queries
```

## Available Dashboards

1. **Overview** (`/`) - Summary of all metrics
2. **Production** (`/production`) - Production & consumption data
3. **Balanced Quantities** (`/balanced`) - Fiscaux ready for assembly alerts
4. **TRS** (`/trs`) - Machine efficiency metrics
5. **Analytics** (`/analytics`) - Additional analytics

## Features

- ✅ Real-time data updates
- ✅ Interactive filters (date range, machine, article)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Professional UI with shadcn/ui components
- ✅ Beautiful charts with Recharts
- ✅ Auto-refresh on Balanced Quantities dashboard

## Troubleshooting

### "Cannot connect to database" or "DATABASE_URL is not defined"
- Run `node scripts/setup-env.js` to create `.env.local` automatically
- Verify `.env.local` file exists in the `jit-dashboard` directory
- Check `DATABASE_URL` is correct in `.env.local`
- Ensure database is running and accessible
- **Restart your Next.js dev server** after creating/updating `.env.local`

### "No data showing"
- Check database has data in `jit_dw` schema
- Verify API routes are working (check Network tab in browser DevTools)
- Check browser console for errors
- If you see JSON error responses with "Database configuration missing", run `node scripts/setup-env.js`

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### API Returns HTML Instead of JSON
- This usually means `.env.local` is missing
- Run `node scripts/setup-env.js` to create it
- Restart the dev server after creating `.env.local`

## Next Steps

1. ✅ Dashboard is ready to use
2. Customize colors/styling if needed
3. Deploy to Vercel for production access
4. Add additional features as needed

## Deployment

See README.md for deployment instructions to Vercel.

