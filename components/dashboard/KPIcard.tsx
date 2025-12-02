'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  format?: 'number' | 'percentage' | 'currency';
  description?: string;
  icon?: React.ReactNode;
}

export function KPICard({
  title,
  value,
  change,
  trend,
  format = 'number',
  description,
  icon,
}: KPICardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'percentage':
        return `${(val * 100).toFixed(1)}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(val);
      case 'number':
      default:
        return new Intl.NumberFormat('en-US').format(val);
    }
  };

  const getTrendIcon = () => {
    if (!change && trend !== 'up' && trend !== 'down') return null;
    
    if (trend === 'up' || (change && change > 0)) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    }
    if (trend === 'down' || (change && change < 0)) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getChangeColor = () => {
    if (!change && trend !== 'up' && trend !== 'down') return 'text-gray-600';
    if (trend === 'up' || (change && change > 0)) return 'text-green-600';
    if (trend === 'down' || (change && change < 0)) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {icon && <div className="text-gray-400">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
        {(change !== undefined || trend) && (
          <div className={cn('flex items-center gap-1 mt-2 text-xs', getChangeColor())}>
            {getTrendIcon()}
            {change !== undefined && (
              <span>
                {change > 0 ? '+' : ''}
                {format === 'percentage' ? `${(change * 100).toFixed(1)}%` : formatValue(Math.abs(change))}
              </span>
            )}
            {change === undefined && trend && (
              <span className="capitalize">{trend}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

