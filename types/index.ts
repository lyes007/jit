// Type definitions for the JIT Dashboard

export interface ProductionData {
  date: string;
  machine: string;
  article: string;
  operator: string;
  goodPieces: number;
  rejectedPieces: number;
  totalPieces: number;
  wireCode?: string;
  wireTotalUsed?: number;
  wireGoodUsed?: number;
}

export interface TRSData {
  date: string;
  machine: string;
  trs: number;
  availability: number;
  performance: number;
  quality: number;
  productiveMinutes: number;
  downtimeMinutes: number;
}

export interface BalancedQuantity {
  fiscauxCode: string;
  fiscauxName: string;
  balancedUnits: number;
  requiredPositions: number;
  readyPositions: number;
  limitingPosition?: string;
  positions: PositionAvailability[];
  date?: string;
}

export interface PositionAvailability {
  positionCode: string;
  positionName: string;
  availableQty: number;
  requiredQty: number;
  status: 'ready' | 'insufficient';
}

export interface MaterialConsumption {
  materialCode: string;
  materialType: string;
  totalUsed: number;
  goodUsed: number;
  scrapUsed: number;
  unitOfMeasure: string;
}

export interface AnalyticsData {
  productionEfficiency: number;
  averageRejectionRate: number;
  topProducingArticles: Array<{
    articleCode: string;
    totalGood: number;
  }>;
  operatorPerformance: Array<{
    operatorName: string;
    totalProduction: number;
    averageQuality: number;
  }>;
  machineUtilization: Array<{
    machineName: string;
    utilizationRate: number;
  }>;
}

export interface KPIMetric {
  label: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  format?: 'number' | 'percentage' | 'currency';
}

