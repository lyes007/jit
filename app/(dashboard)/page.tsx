'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/dashboard/Header';
import { KPICard } from '@/components/dashboard/KPIcard';
import { ChartContainer } from '@/components/dashboard/ChartContainer';
import { ProductionTrendChart } from '@/components/charts/ProductionChart';
import { TRSTrendChart } from '@/components/charts/TRSChart';
import { Factory, TrendingUp, AlertTriangle, Package } from 'lucide-react';
import { ProductionData, TRSData } from '@/types';

export default function DashboardPage() {
  const [productionData, setProductionData] = useState<ProductionData[]>([]);
  const [trsData, setTrsData] = useState<TRSData[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    machineId: null as number | null,
  });
  const [machines, setMachines] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.machineId) params.append('machineIds', filters.machineId.toString());

      const [productionRes, trsRes, kpisRes, filtersRes] = await Promise.all([
        fetch(`/api/production?${params}`),
        fetch(`/api/trs?${params}`),
        fetch(`/api/production?${params}&kpisOnly=true`),
        fetch('/api/filters'),
      ]);

      const [production, trs, kpisData, filterData] = await Promise.all([
        productionRes.json(),
        trsRes.json(),
        kpisRes.json(),
        filtersRes.json(),
      ]);

      setProductionData(production);
      setTrsData(trs);
      setKpis(kpisData);
      setMachines(filterData.machines || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleDateRangeChange = (start: string, end: string) => {
    setFilters((prev) => ({ ...prev, startDate: start, endDate: end }));
  };

  const handleMachineChange = (machineId: number | null) => {
    setFilters((prev) => ({ ...prev, machineId }));
  };

  const rejectionRate = kpis && kpis.totalPieces > 0
    ? (kpis.totalRejected / kpis.totalPieces)
    : 0;

  return (
    <div className="flex flex-col h-full">
      <Header
        onDateRangeChange={handleDateRangeChange}
        onMachineChange={handleMachineChange}
        onRefresh={fetchData}
        machines={machines}
        lastUpdated={lastUpdated}
      />
      
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Real-time production and efficiency metrics</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <KPICard
            title="Total Production"
            value={kpis?.totalGood || 0}
            description="Good pieces produced"
            icon={<Factory className="h-5 w-5" />}
          />
          <KPICard
            title="Rejection Rate"
            value={rejectionRate}
            format="percentage"
            description="Quality metric"
            icon={<AlertTriangle className="h-5 w-5" />}
          />
          <KPICard
            title="Active Machines"
            value={kpis?.activeMachines || 0}
            description="Currently in production"
            icon={<Package className="h-5 w-5" />}
          />
          <KPICard
            title="Average TRS"
            value={trsData.length > 0 
              ? trsData.reduce((sum, d) => sum + d.trs, 0) / trsData.length 
              : 0}
            format="percentage"
            description="Overall Equipment Effectiveness"
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ChartContainer
            title="Production Trend"
            description="Good vs rejected pieces over time"
            loading={loading}
          >
            <ProductionTrendChart data={productionData} />
          </ChartContainer>

          <ChartContainer
            title="TRS Trend"
            description="Overall Equipment Effectiveness over time"
            loading={loading}
          >
            <TRSTrendChart data={trsData} />
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}

