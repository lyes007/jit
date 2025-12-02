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
  Cell,
} from 'recharts';
import { TRSData } from '@/types';

interface TRSChartProps {
  data: TRSData[];
  height?: number;
}

export function TRSTrendChart({ data, height = 300 }: TRSChartProps) {
  // Aggregate by date
  const aggregated = data.reduce((acc, item) => {
    const existing = acc.find((d) => d.date === item.date);
    if (existing) {
      existing.trs = (existing.trs + item.trs) / 2;
      existing.availability = (existing.availability + item.availability) / 2;
      existing.performance = (existing.performance + item.performance) / 2;
      existing.quality = (existing.quality + item.quality) / 2;
    } else {
      acc.push({
        date: item.date,
        trs: item.trs,
        availability: item.availability,
        performance: item.performance,
        quality: item.quality,
      });
    }
    return acc;
  }, [] as Array<{ date: string; trs: number; availability: number; performance: number; quality: number }>);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={aggregated}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
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
        <Legend />
        <Line 
          type="monotone" 
          dataKey="trs" 
          stroke="#3B82F6" 
          strokeWidth={2}
          name="TRS"
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TRSComponentsChart({ data, height = 300 }: TRSChartProps) {
  // Aggregate by machine
  const aggregated = data.reduce((acc, item) => {
    const existing = acc.find((d) => d.machine === item.machine);
    if (existing) {
      existing.availability = (existing.availability + item.availability) / 2;
      existing.performance = (existing.performance + item.performance) / 2;
      existing.quality = (existing.quality + item.quality) / 2;
    } else {
      acc.push({
        machine: item.machine,
        availability: item.availability,
        performance: item.performance,
        quality: item.quality,
      });
    }
    return acc;
  }, [] as Array<{ machine: string; availability: number; performance: number; quality: number }>);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={aggregated}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="machine" 
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
        <Legend />
        <Bar dataKey="availability" fill="#10B981" name="Availability" />
        <Bar dataKey="performance" fill="#3B82F6" name="Performance" />
        <Bar dataKey="quality" fill="#F59E0B" name="Quality" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MachineComparisonChart({ data, height = 300 }: TRSChartProps) {
  // Aggregate by machine
  const aggregated = data.reduce((acc, item) => {
    const existing = acc.find((d) => d.machine === item.machine);
    if (existing) {
      existing.trs = (existing.trs + item.trs) / 2;
    } else {
      acc.push({
        machine: item.machine,
        trs: item.trs,
      });
    }
    return acc;
  }, [] as Array<{ machine: string; trs: number }>);

  // Sort by TRS descending
  aggregated.sort((a, b) => b.trs - a.trs);

  const getColor = (trs: number) => {
    if (trs >= 0.85) return '#10B981'; // Green
    if (trs >= 0.70) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={aggregated}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="machine" 
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
        <Bar dataKey="trs" name="TRS">
          {aggregated.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.trs)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

