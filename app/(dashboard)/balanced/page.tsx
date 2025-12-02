'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/dashboard/Header';
import { ChartContainer } from '@/components/dashboard/ChartContainer';
import { AlertBadge } from '@/components/dashboard/AlertBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, CheckCircle } from 'lucide-react';
import { BalancedQuantity } from '@/types';
import { format } from 'date-fns';

export default function BalancedPage() {
  const [data, setData] = useState<BalancedQuantity[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/balanced');
      const balancedData = await response.json();
      
      // Transform API data to match our type
      const transformed = balancedData.map((item: any) => ({
        fiscauxCode: item.fiscauxCode,
        fiscauxName: item.fiscauxName || item.fiscauxCode,
        balancedUnits: item.balancedUnits || 0,
        requiredPositions: item.requiredPositions || 0,
        readyPositions: item.readyPositions || 0,
        limitingPosition: null,
        positions: [],
        date: item.date,
      }));

      setData(transformed);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching balanced quantities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const readyCount = data.filter((d) => d.balancedUnits > 0).length;
  const totalBalanced = data.reduce((sum, d) => sum + d.balancedUnits, 0);

  return (
    <div className="flex flex-col h-full">
      <Header
        onRefresh={fetchData}
        lastUpdated={lastUpdated}
      />
      
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Balanced Quantities Alert</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Monitor fiscaux ready for assembly</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {readyCount > 0 && (
              <AlertBadge status="ready" count={readyCount} />
            )}
            <Badge variant="outline" className="text-xs sm:text-sm">
              Total Ready: {totalBalanced.toLocaleString()} units
            </Badge>
          </div>
        </div>

        {/* Alert Summary */}
        {readyCount > 0 ? (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-900">
                {readyCount} fiscaux ready for assembly
              </span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              {totalBalanced.toLocaleString()} balanced units available for transfer to assembly workshop
            </p>
          </div>
        ) : (
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold text-yellow-900">
                No fiscaux ready for assembly
              </span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Waiting for all required positions to be available in balanced quantities
            </p>
          </div>
        )}

        {/* Balanced Quantities Table */}
        <ChartContainer
          title="Fiscaux Ready for Assembly"
          description="Fiscaux with balanced quantities available"
          loading={loading}
          action={
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="auto-refresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="auto-refresh" className="text-sm text-gray-600">
                Auto-refresh (30s)
              </label>
            </div>
          }
        >
          {data.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {loading ? 'Loading balanced quantities...' : 'No balanced quantities available'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {!loading && 'This may indicate that article codes in NOMENCLATURE need to match dim_article codes'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Fiscaux Code</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden md:table-cell">Fiscaux Name</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">Balanced Units</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm hidden sm:table-cell">Required</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm hidden sm:table-cell">Ready</TableHead>
                      <TableHead className="text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden md:table-cell">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium text-xs sm:text-sm">{item.fiscauxCode}</TableCell>
                        <TableCell className="text-xs sm:text-sm hidden md:table-cell">{item.fiscauxName}</TableCell>
                        <TableCell className="text-right font-semibold text-xs sm:text-sm">
                          {item.balancedUnits.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-xs sm:text-sm hidden sm:table-cell">{item.requiredPositions}</TableCell>
                        <TableCell className="text-right text-xs sm:text-sm hidden sm:table-cell">
                          <span className={item.readyPositions === item.requiredPositions ? 'text-green-600 font-semibold' : 'text-yellow-600'}>
                            {item.readyPositions} / {item.requiredPositions}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {item.balancedUnits > 0 ? (
                            <AlertBadge status="ready" />
                          ) : item.readyPositions === item.requiredPositions ? (
                            <AlertBadge status="warning" />
                          ) : (
                            <AlertBadge status="pending" />
                          )}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                          {item.date ? format(new Date(item.date), 'MMM dd, yyyy') : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </ChartContainer>

        {/* Instructions */}
        <div className="mt-4 sm:mt-6 rounded-lg border border-blue-200 bg-blue-50 p-3 sm:p-4">
          <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">How to Use This Dashboard</h3>
          <ul className="text-xs sm:text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>This dashboard alerts the warehouse manager when fiscaux are ready for assembly</li>
            <li>Balanced units = minimum available quantity across all required positions</li>
            <li>When balanced units &gt; 0, the fiscaux can be transferred to assembly</li>
            <li>Auto-refresh updates data every 30 seconds</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

