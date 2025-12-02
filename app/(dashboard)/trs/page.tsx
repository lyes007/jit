'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/dashboard/Header';
import { KPICard } from '@/components/dashboard/KPIcard';
import { ChartContainer } from '@/components/dashboard/ChartContainer';
import {
  TRSTrendChart,
  TRSComponentsChart,
  MachineComparisonChart,
} from '@/components/charts/TRSChart';
import { TrendingUp, Clock, Activity, CheckCircle } from 'lucide-react';
import { TRSData } from '@/types';

export default function TRSPage() {
  const [data, setData] = useState<TRSData[]>([]);
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

      const [trsRes, filtersRes] = await Promise.all([
        fetch(`/api/trs?${params}`),
        fetch('/api/filters'),
      ]);

      const [trsData, filterData] = await Promise.all([
        trsRes.json(),
        filtersRes.json(),
      ]);

      setData(trsData);
      setMachines(filterData.machines || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching TRS data:', error);
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

  // Calculate averages
  const avgTRS = data.length > 0
    ? data.reduce((sum, d) => sum + d.trs, 0) / data.length
    : 0;
  const avgAvailability = data.length > 0
    ? data.reduce((sum, d) => sum + d.availability, 0) / data.length
    : 0;
  const avgPerformance = data.length > 0
    ? data.reduce((sum, d) => sum + d.performance, 0) / data.length
    : 0;
  const avgQuality = data.length > 0
    ? data.reduce((sum, d) => sum + d.quality, 0) / data.length
    : 0;
  const totalDowntime = data.reduce((sum, d) => sum + (d.downtimeMinutes || 0), 0);
  const totalProductive = data.reduce((sum, d) => sum + (d.productiveMinutes || 0), 0);

  return (
    <div className="flex flex-col h-full">
      <Header
        onDateRangeChange={handleDateRangeChange}
        onMachineChange={handleMachineChange}
        onRefresh={fetchData}
        machines={machines}
        lastUpdated={lastUpdated}
      />
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">TRS & Time Analysis</h1>
          <p className="text-gray-600 mt-1">Overall Equipment Effectiveness and machine efficiency metrics</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            title="Average TRS"
            value={avgTRS}
            format="percentage"
            description="Overall Equipment Effectiveness"
            icon={<TrendingUp className="h-5 w-5" />}
            trend={avgTRS >= 0.85 ? 'up' : avgTRS >= 0.70 ? 'neutral' : 'down'}
          />
          <KPICard
            title="Availability"
            value={avgAvailability}
            format="percentage"
            description="Uptime percentage"
            icon={<Clock className="h-5 w-5" />}
          />
          <KPICard
            title="Performance"
            value={avgPerformance}
            format="percentage"
            description="Speed efficiency"
            icon={<Activity className="h-5 w-5" />}
          />
          <KPICard
            title="Quality"
            value={avgQuality}
            format="percentage"
            description="Good pieces rate"
            icon={<CheckCircle className="h-5 w-5" />}
          />
        </div>

        {/* Time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <KPICard
            title="Total Productive Time"
            value={`${Math.round(totalProductive / 60)} hours`}
            description="Time spent in production"
            icon={<Clock className="h-5 w-5" />}
          />
          <KPICard
            title="Total Downtime"
            value={`${Math.round(totalDowntime / 60)} hours`}
            description="Time lost to downtime"
            icon={<Activity className="h-5 w-5" />}
            trend="down"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ChartContainer
            title="TRS Trend"
            description="Overall Equipment Effectiveness over time"
            loading={loading}
          >
            <TRSTrendChart data={data} />
          </ChartContainer>

          <ChartContainer
            title="TRS Components"
            description="Availability, Performance, and Quality breakdown"
            loading={loading}
          >
            <TRSComponentsChart data={data} />
          </ChartContainer>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <ChartContainer
            title="Machine Comparison"
            description="TRS performance across all machines"
            loading={loading}
          >
            <MachineComparisonChart data={data} />
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}

