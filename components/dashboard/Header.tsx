'use client';

import { useState, useEffect } from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HeaderProps {
  onDateRangeChange?: (start: string, end: string) => void;
  onMachineChange?: (machineId: number | null) => void;
  onRefresh?: () => void;
  machines?: Array<{ machine_key: number; machine_name: string }>;
  lastUpdated?: Date | null;
}

export function Header({
  onDateRangeChange,
  onMachineChange,
  onRefresh,
  machines = [],
  lastUpdated,
}: HeaderProps) {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedMachine, setSelectedMachine] = useState<string>('all');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Notify parent when date range changes.
  // We intentionally do NOT include the callback itself in dependencies
  // to avoid an infinite re-render loop when parents recreate handlers.
  useEffect(() => {
    if (onDateRangeChange) {
      onDateRangeChange(startDate, endDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  // Notify parent when machine filter changes.
  // Same reasoning as above: depend only on value, not the callback reference.
  useEffect(() => {
    if (onMachineChange) {
      const machineId = selectedMachine === 'all' ? null : parseInt(selectedMachine);
      onMachineChange(machineId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMachine]);

  const handlePreset = (preset: 'today' | 'week' | 'month' | 'year') => {
    const today = new Date();
    let start = new Date();

    switch (preset) {
      case 'today':
        start = new Date(today);
        break;
      case 'week':
        start.setDate(today.getDate() - 7);
        break;
      case 'month':
        start.setMonth(today.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(today.getFullYear() - 1);
        break;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  };

  return (
    <div className="border-b bg-white px-3 py-3 sm:px-6 sm:py-4">
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Top row: Date range and presets */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            {/* Date Range */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <Label htmlFor="start-date" className="text-xs sm:text-sm whitespace-nowrap">From</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full sm:w-36 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="end-date" className="text-xs sm:text-sm whitespace-nowrap">To</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full sm:w-36 text-sm"
                />
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset('today')}
                className="text-xs sm:text-sm"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset('week')}
                className="text-xs sm:text-sm"
              >
                Week
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset('month')}
                className="text-xs sm:text-sm"
              >
                Month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset('year')}
                className="text-xs sm:text-sm"
              >
                Year
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-2">
            {isMounted && lastUpdated && (
              <span className="text-xs text-gray-500 hidden sm:inline" suppressHydrationWarning>
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="w-full sm:w-auto"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            )}
          </div>
        </div>

        {/* Machine Filter - Full width on mobile */}
        {machines.length > 0 && (
          <div className="flex items-center gap-2">
            <Label htmlFor="machine" className="text-xs sm:text-sm whitespace-nowrap">Machine</Label>
            <Select value={selectedMachine} onValueChange={setSelectedMachine}>
              <SelectTrigger id="machine" className="w-full sm:w-48 text-sm">
                <SelectValue placeholder="All Machines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Machines</SelectItem>
                {machines.map((machine) => (
                  <SelectItem key={machine.machine_key} value={machine.machine_key.toString()}>
                    {machine.machine_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}

