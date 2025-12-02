/**
 * Data Verification Script
 * Run with: npx tsx scripts/verify-data.ts
 * 
 * This script checks:
 * - Database connection
 * - Data warehouse schema completeness
 * - Data population status
 * - Data quality checks
 */

import { getPool } from '../lib/db';

interface VerificationResult {
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

const results: VerificationResult[] = [];

function addResult(check: string, status: 'pass' | 'fail' | 'warning', message: string, details?: any) {
  results.push({ check, status, message, details });
  const icon = status === 'pass' ? '✓' : status === 'fail' ? '✗' : '⚠';
  console.log(`${icon} ${check}: ${message}`);
  if (details) {
    console.log(`   Details:`, details);
  }
}

async function verifySchema() {
  console.log('\n=== Schema Verification ===');
  
  const pool = getPool();
  
  // Check if jit_dw schema exists
  const schemaCheck = await pool.query(`
    SELECT EXISTS(
      SELECT 1 FROM information_schema.schemata 
      WHERE schema_name = 'jit_dw'
    ) as exists;
  `);
  
  if (!schemaCheck.rows[0].exists) {
    addResult('Schema Exists', 'fail', 'jit_dw schema not found');
    return false;
  }
  addResult('Schema Exists', 'pass', 'jit_dw schema found');
  
  // Check dimension tables
  const dimTables = [
    'dim_time', 'dim_machine', 'dim_article', 
    'dim_operator', 'dim_location', 'bridge_fiscaux_position'
  ];
  
  for (const table of dimTables) {
    const tableCheck = await pool.query(`
      SELECT EXISTS(
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'jit_dw' AND table_name = $1
      ) as exists;
    `, [table]);
    
    if (tableCheck.rows[0].exists) {
      const count = await pool.query(`SELECT COUNT(*) as count FROM jit_dw.${table}`);
      addResult(`Dimension: ${table}`, 'pass', `Exists with ${count.rows[0].count} records`);
    } else {
      addResult(`Dimension: ${table}`, 'fail', 'Table not found');
    }
  }
  
  // Check fact tables
  const factTables = [
    'fact_production', 'fact_trs', 
    'fact_material_consumption', 'fact_balanced_quantities'
  ];
  
  for (const table of factTables) {
    const tableCheck = await pool.query(`
      SELECT EXISTS(
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'jit_dw' AND table_name = $1
      ) as exists;
    `, [table]);
    
    if (tableCheck.rows[0].exists) {
      const count = await pool.query(`SELECT COUNT(*) as count FROM jit_dw.${table}`);
      const status = parseInt(count.rows[0].count) > 0 ? 'pass' : 'warning';
      addResult(`Fact: ${table}`, status, `${count.rows[0].count} records`, 
        parseInt(count.rows[0].count) === 0 ? 'Table exists but is empty' : undefined);
    } else {
      addResult(`Fact: ${table}`, 'fail', 'Table not found');
    }
  }
  
  return true;
}

async function verifyDataQuality() {
  console.log('\n=== Data Quality Checks ===');
  
  const pool = getPool();
  
  // Check for production data with dates
  const productionDates = await pool.query(`
    SELECT 
      MIN(t.full_date) as earliest_date,
      MAX(t.full_date) as latest_date,
      COUNT(DISTINCT t.full_date) as unique_dates
    FROM jit_dw.fact_production f
    JOIN jit_dw.dim_time t ON f.time_key = t.date_key
    LIMIT 1;
  `);
  
  if (productionDates.rows[0]?.earliest_date) {
    addResult('Production Date Range', 'pass', 
      `From ${productionDates.rows[0].earliest_date} to ${productionDates.rows[0].latest_date} (${productionDates.rows[0].unique_dates} unique dates)`);
  } else {
    addResult('Production Date Range', 'warning', 'No production data found');
  }
  
  // Check for machines
  const machines = await pool.query(`
    SELECT COUNT(*) as count FROM jit_dw.dim_machine;
  `);
  addResult('Machines', parseInt(machines.rows[0].count) > 0 ? 'pass' : 'warning',
    `${machines.rows[0].count} machines registered`);
  
  // Check for articles
  const articles = await pool.query(`
    SELECT COUNT(*) as count FROM jit_dw.dim_article;
  `);
  addResult('Articles', parseInt(articles.rows[0].count) > 0 ? 'pass' : 'warning',
    `${articles.rows[0].count} articles registered`);
  
  // Check production totals
  const productionTotals = await pool.query(`
    SELECT 
      SUM(good_pieces) as total_good,
      SUM(rejected_pieces) as total_rejected,
      SUM(total_pieces) as total_pieces
    FROM jit_dw.fact_production;
  `);
  
  if (productionTotals.rows[0]?.total_pieces) {
    const total = parseInt(productionTotals.rows[0].total_pieces);
    const good = parseInt(productionTotals.rows[0].total_good || 0);
    const rejected = parseInt(productionTotals.rows[0].total_rejected || 0);
    const qualityRate = total > 0 ? ((good / total) * 100).toFixed(2) : 0;
    
    addResult('Production Totals', 'pass',
      `Total: ${total.toLocaleString()}, Good: ${good.toLocaleString()}, Rejected: ${rejected.toLocaleString()}`,
      { qualityRate: `${qualityRate}%` });
  } else {
    addResult('Production Totals', 'warning', 'No production totals found');
  }
  
  // Check TRS data
  const trsData = await pool.query(`
    SELECT 
      COUNT(*) as count,
      AVG(trs_value) as avg_trs,
      AVG(availability) as avg_availability,
      AVG(performance) as avg_performance,
      AVG(quality) as avg_quality
    FROM jit_dw.fact_trs;
  `);
  
  if (parseInt(trsData.rows[0].count) > 0) {
    addResult('TRS Data', 'pass',
      `${trsData.rows[0].count} TRS records`,
      {
        avgTRS: `${(parseFloat(trsData.rows[0].avg_trs) * 100).toFixed(1)}%`,
        avgAvailability: `${(parseFloat(trsData.rows[0].avg_availability) * 100).toFixed(1)}%`,
        avgPerformance: `${(parseFloat(trsData.rows[0].avg_performance) * 100).toFixed(1)}%`,
        avgQuality: `${(parseFloat(trsData.rows[0].avg_quality) * 100).toFixed(1)}%`
      });
  } else {
    addResult('TRS Data', 'warning', 'No TRS records found');
  }
  
  // Check balanced quantities
  const balanced = await pool.query(`
    SELECT 
      COUNT(*) as count,
      SUM(balanced_units) as total_balanced
    FROM jit_dw.fact_balanced_quantities
    WHERE balanced_units > 0;
  `);
  
  if (parseInt(balanced.rows[0].count) > 0) {
    addResult('Balanced Quantities', 'pass',
      `${balanced.rows[0].count} fiscaux with balanced units`,
      { totalBalanced: balanced.rows[0].total_balanced });
  } else {
    addResult('Balanced Quantities', 'warning', 
      'No balanced quantities found (this may be normal if article codes need matching)');
  }
  
  // Check material consumption
  const material = await pool.query(`
    SELECT COUNT(*) as count FROM jit_dw.fact_material_consumption;
  `);
  addResult('Material Consumption', parseInt(material.rows[0].count) > 0 ? 'pass' : 'warning',
    `${material.rows[0].count} material consumption records`);
}

async function verifyReferentialIntegrity() {
  console.log('\n=== Referential Integrity Checks ===');
  
  const pool = getPool();
  
  // Check for orphaned production records
  const orphanedProduction = await pool.query(`
    SELECT COUNT(*) as count
    FROM jit_dw.fact_production f
    LEFT JOIN jit_dw.dim_machine m ON f.machine_key = m.machine_key
    LEFT JOIN jit_dw.dim_article a ON f.article_key = a.article_key
    LEFT JOIN jit_dw.dim_time t ON f.time_key = t.date_key
    WHERE m.machine_key IS NULL OR a.article_key IS NULL OR t.date_key IS NULL;
  `);
  
  if (parseInt(orphanedProduction.rows[0].count) === 0) {
    addResult('Production Referential Integrity', 'pass', 'All production records have valid foreign keys');
  } else {
    addResult('Production Referential Integrity', 'fail',
      `${orphanedProduction.rows[0].count} orphaned production records found`);
  }
  
  // Check for orphaned TRS records
  const orphanedTRS = await pool.query(`
    SELECT COUNT(*) as count
    FROM jit_dw.fact_trs trs
    LEFT JOIN jit_dw.dim_machine m ON trs.machine_key = m.machine_key
    LEFT JOIN jit_dw.dim_time t ON trs.time_key = t.date_key
    WHERE m.machine_key IS NULL OR t.date_key IS NULL;
  `);
  
  if (parseInt(orphanedTRS.rows[0].count) === 0) {
    addResult('TRS Referential Integrity', 'pass', 'All TRS records have valid foreign keys');
  } else {
    addResult('TRS Referential Integrity', 'fail',
      `${orphanedTRS.rows[0].count} orphaned TRS records found`);
  }
}

async function generateSummary() {
  console.log('\n=== Verification Summary ===');
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  
  console.log(`Total Checks: ${results.length}`);
  console.log(`✓ Passed: ${passed}`);
  console.log(`✗ Failed: ${failed}`);
  console.log(`⚠ Warnings: ${warnings}`);
  
  if (failed > 0) {
    console.log('\n=== Failed Checks ===');
    results.filter(r => r.status === 'fail').forEach(r => {
      console.log(`✗ ${r.check}: ${r.message}`);
    });
  }
  
  if (warnings > 0) {
    console.log('\n=== Warnings ===');
    results.filter(r => r.status === 'warning').forEach(r => {
      console.log(`⚠ ${r.check}: ${r.message}`);
    });
  }
  
  console.log('\n=== Recommendations ===');
  if (failed === 0 && warnings === 0) {
    console.log('✓ All checks passed! Your data warehouse is properly configured.');
  } else if (failed === 0) {
    console.log('✓ Critical checks passed. Review warnings above for data completeness.');
  } else {
    console.log('✗ Some critical checks failed. Please review and fix the issues above.');
  }
  
  // Specific recommendations
  const emptyFacts = results.filter(r => 
    r.check.startsWith('Fact:') && r.status === 'warning'
  );
  
  if (emptyFacts.length > 0) {
    console.log('\nEmpty fact tables detected. Make sure you have run:');
    console.log('  - scripts/populate_facts_simple.py (for fact_production)');
    console.log('  - scripts/populate_facts_remaining.py (for other facts)');
  }
  
  const balancedWarning = results.find(r => 
    r.check === 'Balanced Quantities' && r.status === 'warning'
  );
  
  if (balancedWarning) {
    console.log('\nBalanced quantities warning: This may be normal if article codes');
    console.log('in NOMENCLATURE don\'t match codes in dim_article. Check your data mapping.');
  }
}

async function main() {
  try {
    console.log('Starting Data Warehouse Verification...\n');
    
    // Test connection
    const pool = getPool();
    await pool.query('SELECT 1');
    addResult('Database Connection', 'pass', 'Successfully connected to database');
    
    // Run verifications
    const schemaOk = await verifySchema();
    if (schemaOk) {
      await verifyDataQuality();
      await verifyReferentialIntegrity();
    }
    
    // Generate summary
    await generateSummary();
    
    // Close connection
    await pool.end();
    
    process.exit(results.filter(r => r.status === 'fail').length > 0 ? 1 : 0);
  } catch (error: any) {
    console.error('\n✗ Verification failed:', error.message);
    if (error.message.includes('DATABASE_URL')) {
      console.error('\nPlease run: node scripts/setup-env.js');
    }
    process.exit(1);
  }
}

main();

