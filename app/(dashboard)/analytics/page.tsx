'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/dashboard/Header';
import { KPICard } from '@/components/dashboard/KPIcard';
import { ChartContainer } from '@/components/dashboard/ChartContainer';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingUp, Award, Users, Activity } from 'lucide-react';
import { AnalyticsData } from '@/types';

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
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

      const [analyticsRes, filtersRes] = await Promise.all([
        fetch(`/api/analytics?${params}`),
        fetch('/api/filters'),
      ]);

      const [analyticsData, filterData] = await Promise.all([
        analyticsRes.json(),
        filtersRes.json(),
      ]);

      setData(analyticsData);
      setMachines(filterData.machines || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching analytics data:', error);
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
          <h1 className="text-3xl font-bold text-gray-900">Additional Analytics</h1>
          <p className="text-gray-600 mt-1">Production efficiency, quality analysis, and performance metrics</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            title="Production Efficiency"
            value={data?.productionEfficiency || 0}
            format="percentage"
            description="Good pieces vs requested"
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <KPICard
            title="Average Rejection Rate"
            value={data?.averageRejectionRate || 0}
            format="percentage"
            description="Overall quality metric"
            icon={<Activity className="h-5 w-5" />}
            trend="down"
          />
          <KPICard
            title="Top Articles"
            value={data?.topProducingArticles?.length || 0}
            description="Articles tracked"
            icon={<Award className="h-5 w-5" />}
          />
          <KPICard
            title="Active Operators"
            value={data?.operatorPerformance?.length || 0}
            description="Operators in system"
            icon={<Users className="h-5 w-5" />}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Producing Articles */}
          <ChartContainer
            title="Top Producing Articles"
            description="Articles with highest production quantities"
            loading={loading}
          >
            {data?.topProducingArticles && data.topProducingArticles.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.topProducingArticles}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="articleCode" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => value.toLocaleString()}
                    labelStyle={{ color: '#000' }}
                  />
                  <Bar dataKey="totalGood" fill="#3B82F6" name="Good Pieces" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">No data available</div>
            )}
          </ChartContainer>

          {/* Operator Performance */}
          <ChartContainer
            title="Operator Performance"
            description="Production quantities by operator"
            loading={loading}
          >
            {data?.operatorPerformance && data.operatorPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.operatorPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="operatorName" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => value.toLocaleString()}
                    labelStyle={{ color: '#000' }}
                  />
                  <Bar dataKey="totalProduction" fill="#10B981" name="Total Production" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">No data available</div>
            )}
          </ChartContainer>
        </div>

        {/* Machine Utilization */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <ChartContainer
            title="Machine Utilization"
            description="TRS utilization rates by machine"
            loading={loading}
          >
            {data?.machineUtilization && data.machineUtilization.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.machineUtilization}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="machineName" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    domain={[0, 1]}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  />
                  <Tooltip 
                    formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                    labelStyle={{ color: '#000' }}
                  />
                  <Bar dataKey="utilizationRate" fill="#F59E0B" name="Utilization Rate">
                    {data.machineUtilization.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.utilizationRate >= 0.85 ? '#10B981' : entry.utilizationRate >= 0.70 ? '#F59E0B' : '#EF4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">No data available</div>
            )}
          </ChartContainer>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Articles Table */}
          <ChartContainer
            title="Top 10 Producing Articles"
            description="Articles with highest good pieces production"
            loading={loading}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article Code</TableHead>
                  <TableHead className="text-right">Total Good Pieces</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.topProducingArticles && data.topProducingArticles.length > 0 ? (
                  data.topProducingArticles.slice(0, 10).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.articleCode}</TableCell>
                      <TableCell className="text-right">
                        {item.totalGood.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-gray-500">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ChartContainer>

          {/* Operator Performance Table */}
          <ChartContainer
            title="Operator Performance"
            description="Production and quality metrics by operator"
            loading={loading}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operator</TableHead>
                  <TableHead className="text-right">Total Production</TableHead>
                  <TableHead className="text-right">Avg Quality</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.operatorPerformance && data.operatorPerformance.length > 0 ? (
                  data.operatorPerformance.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.operatorName}</TableCell>
                      <TableCell className="text-right">
                        {item.totalProduction.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={item.averageQuality >= 0.95 ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                          {(item.averageQuality * 100).toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-gray-500">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}

