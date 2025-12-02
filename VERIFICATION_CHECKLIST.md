# Project Verification Checklist

Use this checklist to verify that your JIT Dashboard project is correctly implemented and data is accurate.

## Prerequisites

- [ ] Database connection is configured (`.env.local` exists)
- [ ] All Python scripts have been run successfully
- [ ] Data warehouse schema is created
- [ ] Data has been loaded into staging tables
- [ ] Dimensions and facts have been populated

## 1. Database Connection

### Test Connection
```bash
cd jit-dashboard
node scripts/setup-env.js  # If .env.local doesn't exist
npx tsx scripts/verify-data.ts
```

**Expected Result:**
- ✓ Database Connection: Successfully connected to database
- ✓ Schema Exists: jit_dw schema found

## 2. Schema Verification

### Check Schema Completeness
Run the verification script and verify:

- [ ] **Dimension Tables** (all should exist with data):
  - `dim_time` - Time dimension
  - `dim_machine` - Machine dimension
  - `dim_article` - Article dimension
  - `dim_operator` - Operator dimension
  - `dim_location` - Location dimension
  - `bridge_fiscaux_position` - Bridge table for fiscaux positions

- [ ] **Fact Tables** (all should exist):
  - `fact_production` - Production facts (should have data)
  - `fact_trs` - TRS metrics (should have data)
  - `fact_material_consumption` - Material consumption (may be empty if wire data missing)
  - `fact_balanced_quantities` - Balanced quantities (may be empty if article codes don't match)

## 3. Data Quality Checks

### Production Data
- [ ] Production records exist (`fact_production` has rows)
- [ ] Date range is reasonable (not all dates in future/past)
- [ ] Good pieces + rejected pieces = total pieces
- [ ] Machine references are valid (no orphaned records)
- [ ] Article references are valid

### TRS Data
- [ ] TRS records exist (`fact_trs` has rows)
- [ ] TRS values are between 0 and 1 (0% to 100%)
- [ ] Availability, Performance, Quality values are valid (0-1 range)
- [ ] Machine references are valid

### Balanced Quantities
- [ ] If empty: Check if article codes in NOMENCLATURE match `dim_article.article_code`
- [ ] If populated: Verify balanced_units calculation is correct
- [ ] Verify required_positions and ready_positions make sense

### Material Consumption
- [ ] If empty: May be normal if wire data wasn't extracted from SDC files
- [ ] If populated: Verify material codes and quantities are reasonable

## 4. Dashboard Functionality

### Test Each Dashboard Page

#### Overview Dashboard (`/`)
- [ ] Page loads without errors
- [ ] KPI cards display values (not 0 or NaN)
- [ ] Production trend chart displays data
- [ ] TRS trend chart displays data
- [ ] Date filters work correctly
- [ ] Machine filter works correctly

#### Production Dashboard (`/production`)
- [ ] Production data displays in charts
- [ ] Good vs rejected charts show data
- [ ] Top articles table displays articles
- [ ] Filters work correctly
- [ ] No console errors

#### Balanced Quantities (`/balanced`)
- [ ] Page loads without errors
- [ ] Table displays fiscaux (or shows appropriate "no data" message)
- [ ] Status badges display correctly
- [ ] Auto-refresh works (if enabled)
- [ ] Refresh button works

#### TRS Dashboard (`/trs`)
- [ ] TRS metrics display correctly
- [ ] TRS trend chart shows data
- [ ] Components chart (Availability, Performance, Quality) displays
- [ ] Machine comparison chart displays
- [ ] Time metrics (productive/downtime) display

#### Analytics Dashboard (`/analytics`)
- [ ] Production efficiency metric displays
- [ ] Top articles chart displays
- [ ] Operator performance chart displays
- [ ] Machine utilization chart displays
- [ ] Tables display data correctly

## 5. API Endpoints

### Test API Routes Manually

```bash
# Test filters endpoint
curl http://localhost:3000/api/filters

# Test production endpoint
curl "http://localhost:3000/api/production?startDate=2024-01-01&endDate=2024-12-31"

# Test TRS endpoint
curl "http://localhost:3000/api/trs?startDate=2024-01-01&endDate=2024-12-31"

# Test balanced endpoint
curl http://localhost:3000/api/balanced

# Test analytics endpoint
curl "http://localhost:3000/api/analytics?startDate=2024-01-01&endDate=2024-12-31"
```

**Expected Results:**
- All endpoints return JSON (not HTML)
- No 500 errors
- Data structure matches expected format
- Error messages are helpful if DATABASE_URL is missing

## 6. Data Accuracy Verification

### Spot Check Sample Data

Run these SQL queries in your database to verify data accuracy:

```sql
-- Check production totals by machine
SELECT 
  m.machine_name,
  SUM(f.good_pieces) as total_good,
  SUM(f.rejected_pieces) as total_rejected,
  COUNT(*) as production_runs
FROM jit_dw.fact_production f
JOIN jit_dw.dim_machine m ON f.machine_key = m.machine_key
GROUP BY m.machine_name
ORDER BY total_good DESC
LIMIT 10;

-- Check TRS by machine
SELECT 
  m.machine_name,
  AVG(trs.trs_value) as avg_trs,
  AVG(trs.availability) as avg_availability,
  AVG(trs.performance) as avg_performance,
  AVG(trs.quality) as avg_quality
FROM jit_dw.fact_trs trs
JOIN jit_dw.dim_machine m ON trs.machine_key = m.machine_key
GROUP BY m.machine_name
ORDER BY avg_trs DESC;

-- Check balanced quantities
SELECT 
  a.article_code,
  a.description,
  bq.balanced_units,
  bq.required_positions,
  bq.ready_positions
FROM jit_dw.fact_balanced_quantities bq
JOIN jit_dw.dim_article a ON bq.parent_article_key = a.article_key
WHERE bq.balanced_units > 0
ORDER BY bq.balanced_units DESC
LIMIT 10;
```

**Verify:**
- [ ] Numbers make sense (not negative, not impossibly large)
- [ ] Dates are in expected range
- [ ] Machine names match your actual machines
- [ ] Article codes match your actual articles

## 7. Error Handling

### Test Error Scenarios

- [ ] **Missing DATABASE_URL**: API returns JSON error (not HTML)
- [ ] **Invalid date range**: Dashboard handles gracefully
- [ ] **Empty data**: Charts display "No data" messages
- [ ] **Network errors**: Dashboard shows error messages
- [ ] **Loading states**: Skeleton loaders appear during data fetch

## 8. Performance

### Check Performance

- [ ] Dashboard pages load in < 3 seconds
- [ ] API responses return in < 2 seconds
- [ ] Charts render smoothly without lag
- [ ] No memory leaks (check browser DevTools)
- [ ] No excessive API calls (check Network tab)

## 9. Browser Compatibility

### Test in Different Browsers

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (if on Mac)
- [ ] Mobile browser (responsive design)

## 10. Code Quality

### Run Linting

```bash
cd jit-dashboard
npm run lint
```

- [ ] No linting errors
- [ ] No TypeScript errors
- [ ] All imports resolve correctly

## Common Issues and Solutions

### Issue: "DATABASE_URL is not defined"
**Solution:** Run `node scripts/setup-env.js` to create `.env.local`

### Issue: Empty fact tables
**Solution:** Run the population scripts:
- `python scripts/populate_facts_simple.py`
- `python scripts/populate_facts_remaining.py`

### Issue: Balanced quantities is empty
**Solution:** Check if article codes in NOMENCLATURE match `dim_article.article_code`. This is a data mapping issue, not a code issue.

### Issue: Material consumption is empty
**Solution:** Check if wire data was extracted from SDC files. Run `scripts/update_wire_data.py` if needed.

### Issue: API returns HTML instead of JSON
**Solution:** This means the API route crashed. Check server logs and ensure DATABASE_URL is set correctly.

## Final Verification

Once all checks pass:

- [ ] All dashboards display data correctly
- [ ] All filters work as expected
- [ ] No console errors in browser
- [ ] No server errors in terminal
- [ ] Data matches expectations from source files
- [ ] Performance is acceptable
- [ ] Code is clean and well-documented

## Success Criteria

Your project is correctly implemented if:

1. ✅ All schema tables exist and have data (except optional ones)
2. ✅ All dashboards load and display data
3. ✅ All API endpoints return JSON (not HTML errors)
4. ✅ Data quality checks pass (no orphaned records, valid ranges)
5. ✅ No critical errors in browser console or server logs
6. ✅ Filters and interactions work correctly
7. ✅ Error handling works (graceful degradation)

---

**Run the automated verification:**
```bash
npx tsx scripts/verify-data.ts
```

This will check most of the above automatically and provide a summary report.

