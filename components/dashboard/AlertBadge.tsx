'use client';

import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertBadgeProps {
  status: 'ready' | 'warning' | 'pending';
  count?: number;
  className?: string;
}

export function AlertBadge({ status, count, className }: AlertBadgeProps) {
  const getConfig = () => {
    switch (status) {
      case 'ready':
        return {
          icon: CheckCircle,
          label: 'Ready',
          variant: 'default' as const,
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          iconColor: 'text-green-600',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          label: 'Warning',
          variant: 'destructive' as const,
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
        };
      case 'pending':
        return {
          icon: Clock,
          label: 'Pending',
          variant: 'secondary' as const,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1',
        config.bgColor,
        config.textColor,
        className
      )}
    >
      <Icon className={cn('h-3.5 w-3.5', config.iconColor)} />
      <span>{config.label}</span>
      {count !== undefined && count > 0 && (
        <span className="ml-1 font-semibold">({count})</span>
      )}
    </Badge>
  );
}

