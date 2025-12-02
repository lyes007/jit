'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ReactNode } from 'react';

interface ChartContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  loading?: boolean;
  className?: string;
  action?: ReactNode;
}

export function ChartContainer({
  title,
  description,
  children,
  loading = false,
  className,
  action,
}: ChartContainerProps) {
  return (
    <Card className={className}>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1 text-xs sm:text-sm">{description}</CardDescription>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-[250px] sm:h-[300px] w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

