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
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

