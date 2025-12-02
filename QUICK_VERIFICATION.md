# Quick Verification Guide

## Step 1: Setup Environment (if not done)

```bash
cd jit-dashboard
npm run setup
```

This creates `.env.local` with your database connection string.

## Step 2: Install Verification Dependencies

```bash
npm install
```

This installs `tsx` needed for the verification script.

## Step 3: Run Automated Verification

```bash
npm run verify
```

This will check:
- ✅ Database connection
- ✅ Schema completeness
- ✅ Data population status
- ✅ Data quality
- ✅ Referential integrity

**Expected Output:**
```
Starting Data Warehouse Verification...

✓ Database Connection: Successfully connected to database
✓ Schema Exists: jit_dw schema found
✓ Dimension: dim_time: Exists with X records
✓ Dimension: dim_machine: Exists with X records
...
```

## Step 4: Test Dashboard

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser:** http://localhost:3000

3. **Check each dashboard:**
   - Overview (`/`) - Should show KPIs and charts
   - Production (`/production`) - Should show production data
   - Balanced (`/balanced`) - Should show fiscaux or "no data" message
   - TRS (`/trs`) - Should show TRS metrics and charts
   - Analytics (`/analytics`) - Should show analytics data

4. **Test filters:**
   - Change date range - Data should update
   - Select a machine - Data should filter
   - Click refresh - Data should reload

5. **Check browser console:**
   - Open DevTools (F12)
   - Check Console tab - Should have no errors
   - Check Network tab - API calls should return 200 status

## Step 5: Verify Data Accuracy

### Quick SQL Checks

Connect to your database and run:

```sql
-- Check production totals
SELECT 
  SUM(good_pieces) as total_good,
  SUM(rejected_pieces) as total_rejected,
  COUNT(*) as total_records
FROM jit_dw.fact_production;

-- Check TRS average
SELECT 
  AVG(trs_value) as avg_trs,
  COUNT(*) as trs_records
FROM jit_dw.fact_trs;

-- Check machines
SELECT COUNT(*) as machine_count FROM jit_dw.dim_machine;

-- Check articles
SELECT COUNT(*) as article_count FROM jit_dw.dim_article;
```

**What to look for:**
- Production totals should match your source data
- TRS should be between 0 and 1 (0% to 100%)
- Machine and article counts should match your equipment list

## Step 6: Test API Endpoints

Open these URLs in your browser (while dev server is running):

1. **Filters:** http://localhost:3000/api/filters
   - Should return JSON with machines and articles arrays

2. **Production:** http://localhost:3000/api/production?startDate=2024-01-01&endDate=2024-12-31
   - Should return JSON array of production data

3. **TRS:** http://localhost:3000/api/trs?startDate=2024-01-01&endDate=2024-12-31
   - Should return JSON array of TRS data

4. **Balanced:** http://localhost:3000/api/balanced
   - Should return JSON array (may be empty)

5. **Analytics:** http://localhost:3000/api/analytics?startDate=2024-01-01&endDate=2024-12-31
   - Should return JSON object with analytics data

**All should return JSON, not HTML error pages!**

## Success Indicators

✅ **Everything is correct if:**

1. Verification script shows all checks passing (or only warnings)
2. Dashboard loads without errors
3. Charts display data (or show "no data" messages appropriately)
4. API endpoints return JSON (not HTML)
5. Filters work correctly
6. No errors in browser console
7. Data numbers make sense (not negative, not impossibly large)

## Common Issues

### ❌ "DATABASE_URL is not defined"
**Fix:** Run `npm run setup`

### ❌ API returns HTML instead of JSON
**Fix:** Check server logs, ensure DATABASE_URL is set, restart dev server

### ❌ Empty charts/tables
**Fix:** Check if data exists in database, verify date filters aren't excluding all data

### ❌ "No data available" everywhere
**Fix:** Run data population scripts:
- `python scripts/populate_facts_simple.py`
- `python scripts/populate_facts_remaining.py`

### ❌ Balanced quantities is empty
**Fix:** This may be normal if article codes don't match. Check data mapping.

## Final Checklist

Before considering the project complete:

- [ ] `npm run verify` passes all critical checks
- [ ] All 5 dashboards load correctly
- [ ] All API endpoints return JSON
- [ ] Filters work on all dashboards
- [ ] No console errors
- [ ] Data displays correctly
- [ ] Charts render properly
- [ ] Responsive design works (test on mobile)

---

**For detailed verification, see:** `VERIFICATION_CHECKLIST.md`

