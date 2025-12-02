import { getPool } from './db';

// Production queries
export async function getProductionData(filters?: {
  startDate?: string;
  endDate?: string;
  machineIds?: number[];
  articleIds?: number[];
}) {
  let query = `
    SELECT 
      t.full_date::text as date,
      m.machine_name as machine,
      m.machine_key as machine_key,
      a.article_code as article,
      a.article_key as article_key,
      o.operator_name as operator,
      SUM(f.good_pieces) as "goodPieces",
      SUM(f.rejected_pieces) as "rejectedPieces",
      SUM(f.total_pieces) as "totalPieces",
      COUNT(DISTINCT f.production_key) as "productionCount"
    FROM jit_dw.fact_production f
    JOIN jit_dw.dim_machine m ON f.machine_key = m.machine_key
    JOIN jit_dw.dim_article a ON f.article_key = a.article_key
    LEFT JOIN jit_dw.dim_operator o ON f.operator_key = o.operator_key
    JOIN jit_dw.dim_time t ON f.time_key = t.date_key
    WHERE 1=1
  `;
  
  const params: any[] = [];
  let paramCount = 1;

  if (filters?.startDate) {
    query += ` AND t.full_date >= $${paramCount}`;
    params.push(filters.startDate);
    paramCount++;
  }

  if (filters?.endDate) {
    query += ` AND t.full_date <= $${paramCount}`;
    params.push(filters.endDate);
    paramCount++;
  }

  if (filters?.machineIds && filters.machineIds.length > 0) {
    query += ` AND m.machine_key = ANY($${paramCount})`;
    params.push(filters.machineIds);
    paramCount++;
  }

  if (filters?.articleIds && filters.articleIds.length > 0) {
    query += ` AND a.article_key = ANY($${paramCount})`;
    params.push(filters.articleIds);
    paramCount++;
  }

  query += `
    GROUP BY t.full_date, m.machine_name, m.machine_key, a.article_code, a.article_key, o.operator_name
    ORDER BY t.full_date DESC, m.machine_name
    LIMIT 1000
  `;

  const result = await getPool().query(query, params);
  return result.rows;
}

export async function getProductionKPIs(filters?: {
  startDate?: string;
  endDate?: string;
}) {
  let query = `
    SELECT 
      SUM(f.good_pieces) as "totalGood",
      SUM(f.rejected_pieces) as "totalRejected",
      SUM(f.total_pieces) as "totalPieces",
      COUNT(DISTINCT f.machine_key) as "activeMachines",
      COUNT(DISTINCT f.article_key) as "activeArticles",
      COUNT(DISTINCT f.production_key) as "totalProductions"
    FROM jit_dw.fact_production f
    JOIN jit_dw.dim_time t ON f.time_key = t.date_key
    WHERE 1=1
  `;

  const params: any[] = [];
  let paramCount = 1;

  if (filters?.startDate) {
    query += ` AND t.full_date >= $${paramCount}`;
    params.push(filters.startDate);
    paramCount++;
  }

  if (filters?.endDate) {
    query += ` AND t.full_date <= $${paramCount}`;
    params.push(filters.endDate);
    paramCount++;
  }

  const result = await getPool().query(query, params);
  return result.rows[0];
}

// TRS queries
export async function getTRSData(filters?: {
  startDate?: string;
  endDate?: string;
  machineIds?: number[];
}) {
  let query = `
    SELECT 
      t.full_date::text as date,
      m.machine_name as machine,
      m.machine_key as machine_key,
      AVG(trs.trs_value)::float as trs,
      AVG(trs.availability)::float as availability,
      AVG(trs.performance)::float as performance,
      AVG(trs.quality)::float as quality,
      SUM(trs.productive_minutes)::int as "productiveMinutes",
      SUM(trs.downtime_minutes)::int as "downtimeMinutes"
    FROM jit_dw.fact_trs trs
    JOIN jit_dw.dim_machine m ON trs.machine_key = m.machine_key
    JOIN jit_dw.dim_time t ON trs.time_key = t.date_key
    WHERE 1=1
  `;

  const params: any[] = [];
  let paramCount = 1;

  if (filters?.startDate) {
    query += ` AND t.full_date >= $${paramCount}`;
    params.push(filters.startDate);
    paramCount++;
  }

  if (filters?.endDate) {
    query += ` AND t.full_date <= $${paramCount}`;
    params.push(filters.endDate);
    paramCount++;
  }

  if (filters?.machineIds && filters.machineIds.length > 0) {
    query += ` AND m.machine_key = ANY($${paramCount})`;
    params.push(filters.machineIds);
    paramCount++;
  }

  query += `
    GROUP BY t.full_date, m.machine_name, m.machine_key
    ORDER BY t.full_date DESC, m.machine_name
  `;

  const result = await getPool().query(query, params);
  return result.rows;
}

// Balanced quantities queries
export async function getBalancedQuantities() {
  const query = `
    SELECT 
      a.article_code as "fiscauxCode",
      a.description as "fiscauxName",
      bq.balanced_units as "balancedUnits",
      bq.required_positions as "requiredPositions",
      bq.ready_positions as "readyPositions",
      t.full_date::text as date
    FROM jit_dw.fact_balanced_quantities bq
    JOIN jit_dw.dim_article a ON bq.parent_article_key = a.article_key
    JOIN jit_dw.dim_time t ON bq.time_key = t.date_key
    WHERE bq.balanced_units > 0
    ORDER BY bq.balanced_units DESC, t.full_date DESC
    LIMIT 100
  `;

  const result = await getPool().query(query);
  return result.rows;
}

// Material consumption queries
export async function getMaterialConsumption(filters?: {
  startDate?: string;
  endDate?: string;
}) {
  let query = `
    SELECT 
      mc.material_code as "materialCode",
      mc.material_type as "materialType",
      SUM(mc.total_used) as "totalUsed",
      SUM(mc.good_used) as "goodUsed",
      SUM(mc.scrap_used) as "scrapUsed",
      mc.unit_of_measure as "unitOfMeasure"
    FROM jit_dw.fact_material_consumption mc
    JOIN jit_dw.fact_production f ON mc.production_key = f.production_key
    JOIN jit_dw.dim_time t ON f.time_key = t.date_key
    WHERE 1=1
  `;

  const params: any[] = [];
  let paramCount = 1;

  if (filters?.startDate) {
    query += ` AND t.full_date >= $${paramCount}`;
    params.push(filters.startDate);
    paramCount++;
  }

  if (filters?.endDate) {
    query += ` AND t.full_date <= $${paramCount}`;
    params.push(filters.endDate);
    paramCount++;
  }

  query += `
    GROUP BY mc.material_code, mc.material_type, mc.unit_of_measure
    ORDER BY SUM(mc.total_used) DESC
  `;

  const result = await getPool().query(query, params);
  return result.rows;
}

// Analytics queries
export async function getAnalyticsData(filters?: {
  startDate?: string;
  endDate?: string;
}) {
  // Production efficiency
  const efficiencyQuery = `
    SELECT 
      AVG(
        CASE 
          WHEN f.requested_quantity > 0 
          THEN CAST(f.good_pieces AS DECIMAL) / f.requested_quantity
          ELSE 0
        END
      )::float as "productionEfficiency",
      AVG(
        CASE 
          WHEN f.total_pieces > 0 
          THEN CAST(f.rejected_pieces AS DECIMAL) / f.total_pieces
          ELSE 0
        END
      )::float as "averageRejectionRate"
    FROM jit_dw.fact_production f
    JOIN jit_dw.dim_time t ON f.time_key = t.date_key
    WHERE 1=1
    ${filters?.startDate ? `AND t.full_date >= '${filters.startDate}'` : ''}
    ${filters?.endDate ? `AND t.full_date <= '${filters.endDate}'` : ''}
  `;

  // Top producing articles
  const topArticlesQuery = `
    SELECT 
      a.article_code as "articleCode",
      SUM(f.good_pieces) as "totalGood"
    FROM jit_dw.fact_production f
    JOIN jit_dw.dim_article a ON f.article_key = a.article_key
    JOIN jit_dw.dim_time t ON f.time_key = t.date_key
    WHERE 1=1
    ${filters?.startDate ? `AND t.full_date >= '${filters.startDate}'` : ''}
    ${filters?.endDate ? `AND t.full_date <= '${filters.endDate}'` : ''}
    GROUP BY a.article_code
    ORDER BY SUM(f.good_pieces) DESC
    LIMIT 10
  `;

  // Operator performance
  const operatorQuery = `
    SELECT 
      o.operator_name as "operatorName",
      SUM(f.good_pieces) as "totalProduction",
      AVG(
        CASE 
          WHEN f.total_pieces > 0 
          THEN CAST(f.good_pieces AS DECIMAL) / f.total_pieces
          ELSE 0
        END
      )::float as "averageQuality"
    FROM jit_dw.fact_production f
    JOIN jit_dw.dim_operator o ON f.operator_key = o.operator_key
    JOIN jit_dw.dim_time t ON f.time_key = t.date_key
    WHERE o.operator_name IS NOT NULL
    ${filters?.startDate ? `AND t.full_date >= '${filters.startDate}'` : ''}
    ${filters?.endDate ? `AND t.full_date <= '${filters.endDate}'` : ''}
    GROUP BY o.operator_name
    ORDER BY SUM(f.good_pieces) DESC
    LIMIT 10
  `;

  // Machine utilization
  const utilizationQuery = `
    SELECT 
      m.machine_name as "machineName",
      AVG(trs.trs_value)::float as "utilizationRate"
    FROM jit_dw.fact_trs trs
    JOIN jit_dw.dim_machine m ON trs.machine_key = m.machine_key
    JOIN jit_dw.dim_time t ON trs.time_key = t.date_key
    WHERE 1=1
    ${filters?.startDate ? `AND t.full_date >= '${filters.startDate}'` : ''}
    ${filters?.endDate ? `AND t.full_date <= '${filters.endDate}'` : ''}
    GROUP BY m.machine_name
    ORDER BY AVG(trs.trs_value) DESC
  `;

  const pool = getPool();
  const [efficiency, topArticles, operators, utilization] = await Promise.all([
    pool.query(efficiencyQuery),
    pool.query(topArticlesQuery),
    pool.query(operatorQuery),
    pool.query(utilizationQuery),
  ]);

  return {
    productionEfficiency: efficiency.rows[0]?.productionEfficiency || 0,
    averageRejectionRate: efficiency.rows[0]?.averageRejectionRate || 0,
    topProducingArticles: topArticles.rows,
    operatorPerformance: operators.rows,
    machineUtilization: utilization.rows,
  };
}

// Get machines for filters
export async function getMachines() {
  const query = `
    SELECT machine_key, machine_code, machine_name
    FROM jit_dw.dim_machine
    ORDER BY machine_name
  `;
  const result = await getPool().query(query);
  return result.rows;
}

// Get articles for filters
export async function getArticles() {
  const query = `
    SELECT article_key, article_code, description
    FROM jit_dw.dim_article
    ORDER BY article_code
    LIMIT 500
  `;
  const result = await getPool().query(query);
  return result.rows;
}

