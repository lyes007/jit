'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ProductionData } from '@/types';

interface ProductionChartProps {
  data: ProductionData[];
  type?: 'line' | 'bar' | 'stacked';
  height?: number;
}

export function ProductionTrendChart({ data, height = 300 }: ProductionChartProps) {
  // Aggregate data by date
  const aggregated = data.reduce((acc, item) => {
    const existing = acc.find((d) => d.date === item.date);
    if (existing) {
      existing.goodPieces += item.goodPieces;
      existing.rejectedPieces += item.rejectedPieces;
      existing.totalPieces += item.totalPieces;
    } else {
      acc.push({
        date: item.date,
        goodPieces: item.goodPieces,
        rejectedPieces: item.rejectedPieces,
        totalPieces: item.totalPieces,
      });
    }
    return acc;
  }, [] as Array<{ date: string; goodPieces: number; rejectedPieces: number; totalPieces: number }>);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={aggregated}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 10 }}
          angle={-45}
          textAnchor="end"
          height={80}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip 
          formatter={(value: number) => value.toLocaleString()}
          labelStyle={{ color: '#000' }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="goodPieces" 
          stroke="#10B981" 
          strokeWidth={2}
          name="Good Pieces"
          dot={{ r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="rejectedPieces" 
          stroke="#EF4444" 
          strokeWidth={2}
          name="Rejected Pieces"
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ProductionByMachineChart({ data, height = 300 }: ProductionChartProps) {
  // Aggregate by machine
  const aggregated = data.reduce((acc, item) => {
    const existing = acc.find((d) => d.machine === item.machine);
    if (existing) {
      existing.goodPieces += item.goodPieces;
      existing.rejectedPieces += item.rejectedPieces;
    } else {
      acc.push({
        machine: item.machine,
        goodPieces: item.goodPieces,
        rejectedPieces: item.rejectedPieces,
      });
    }
    return acc;
  }, [] as Array<{ machine: string; goodPieces: number; rejectedPieces: number }>);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={aggregated}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="machine" 
          tick={{ fontSize: 10 }}
          angle={-45}
          textAnchor="end"
          height={80}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip 
          formatter={(value: number) => value.toLocaleString()}
          labelStyle={{ color: '#000' }}
        />
        <Legend />
        <Bar dataKey="goodPieces" fill="#10B981" name="Good Pieces" />
        <Bar dataKey="rejectedPieces" fill="#EF4444" name="Rejected Pieces" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function GoodVsRejectedChart({ data, height = 300 }: ProductionChartProps) {
  // Aggregate by date
  const aggregated = data.reduce((acc, item) => {
    const existing = acc.find((d) => d.date === item.date);
    if (existing) {
      existing.goodPieces += item.goodPieces;
      existing.rejectedPieces += item.rejectedPieces;
    } else {
      acc.push({
        date: item.date,
        goodPieces: item.goodPieces,
        rejectedPieces: item.rejectedPieces,
      });
    }
    return acc;
  }, [] as Array<{ date: string; goodPieces: number; rejectedPieces: number }>);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={aggregated}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 10 }}
          angle={-45}
          textAnchor="end"
          height={80}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip 
          formatter={(value: number) => value.toLocaleString()}
          labelStyle={{ color: '#000' }}
        />
        <Legend />
        <Bar dataKey="goodPieces" stackId="a" fill="#10B981" name="Good Pieces" />
        <Bar dataKey="rejectedPieces" stackId="a" fill="#EF4444" name="Rejected Pieces" />
      </BarChart>
    </ResponsiveContainer>
  );
}

