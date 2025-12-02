'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/dashboard/Header';
import { KPICard } from '@/components/dashboard/KPIcard';
import { ChartContainer } from '@/components/dashboard/ChartContainer';
import {
  ProductionTrendChart,
  ProductionByMachineChart,
  GoodVsRejectedChart,
} from '@/components/charts/ProductionChart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Factory, AlertTriangle, Package, TrendingDown } from 'lucide-react';
import { ProductionData } from '@/types';

export default function ProductionPage() {
  const [data, setData] = useState<ProductionData[]>([]);
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

      const [dataRes, kpisRes, filtersRes] = await Promise.all([
        fetch(`/api/production?${params}`),
        fetch(`/api/production?${params}&kpisOnly=true`),
        fetch('/api/filters'),
      ]);

      const [productionData, kpisData, filterData] = await Promise.all([
        dataRes.json(),
        kpisRes.json(),
        filtersRes.json(),
      ]);

      setData(productionData);
      setKpis(kpisData);
      setMachines(filterData.machines || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching production data:', error);
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

  // Top articles by production
  const topArticles = data.reduce((acc, item) => {
    const existing = acc.find((a) => a.article === item.article);
    if (existing) {
      existing.goodPieces += item.goodPieces;
      existing.rejectedPieces += item.rejectedPieces;
    } else {
      acc.push({
        article: item.article,
        goodPieces: item.goodPieces,
        rejectedPieces: item.rejectedPieces,
      });
    }
    return acc;
  }, [] as Array<{ article: string; goodPieces: number; rejectedPieces: number }>)
    .sort((a, b) => b.goodPieces - a.goodPieces)
    .slice(0, 10);

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Production & Consumption</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Monitor production quantities and material consumption</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <KPICard
            title="Total Good Pieces"
            value={kpis?.totalGood || 0}
            description="Successfully produced"
            icon={<Factory className="h-5 w-5" />}
          />
          <KPICard
            title="Total Rejected"
            value={kpis?.totalRejected || 0}
            description="Defective pieces"
            icon={<AlertTriangle className="h-5 w-5" />}
            trend="down"
          />
          <KPICard
            title="Rejection Rate"
            value={rejectionRate}
            format="percentage"
            description="Quality metric"
            icon={<TrendingDown className="h-5 w-5" />}
          />
          <KPICard
            title="Production Runs"
            value={kpis?.totalProductions || 0}
            description="Total production batches"
            icon={<Package className="h-5 w-5" />}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <ChartContainer
            title="Production Trend"
            description="Good vs rejected pieces over time"
            loading={loading}
          >
            <ProductionTrendChart data={data} />
          </ChartContainer>

          <ChartContainer
            title="Production by Machine"
            description="Good and rejected pieces by machine"
            loading={loading}
          >
            <ProductionByMachineChart data={data} />
          </ChartContainer>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <ChartContainer
            title="Good vs Rejected Pieces"
            description="Stacked view of production quality"
            loading={loading}
          >
            <GoodVsRejectedChart data={data} />
          </ChartContainer>
        </div>

        {/* Top Articles Table */}
        <ChartContainer
          title="Top Producing Articles"
          description="Articles with highest production quantities"
          loading={loading}
        >
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Article Code</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Good Pieces</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm hidden sm:table-cell">Rejected Pieces</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Total</TableHead>
                    <TableHead className="text-right text-xs sm:text-sm">Rejection Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topArticles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 text-sm">
                        No data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    topArticles.map((item, index) => {
                      const total = item.goodPieces + item.rejectedPieces;
                      const rate = total > 0 ? (item.rejectedPieces / total) : 0;
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium text-xs sm:text-sm">{item.article}</TableCell>
                          <TableCell className="text-right text-xs sm:text-sm">
                            {item.goodPieces.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-xs sm:text-sm hidden sm:table-cell">
                            {item.rejectedPieces.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-xs sm:text-sm">
                            {total.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right text-xs sm:text-sm">
                            <span className={rate > 0.1 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                              {(rate * 100).toFixed(1)}%
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}

