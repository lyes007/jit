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
    <div className="border-b bg-white px-6 py-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-4">
          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Label htmlFor="start-date" className="text-sm">From</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
            />
            <Label htmlFor="end-date" className="text-sm">To</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40"
            />
          </div>

          {/* Presets */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreset('today')}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreset('week')}
            >
              Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreset('month')}
            >
              Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreset('year')}
            >
              Year
            </Button>
          </div>

          {/* Machine Filter */}
          {machines.length > 0 && (
            <div className="flex items-center gap-2">
              <Label htmlFor="machine" className="text-sm">Machine</Label>
              <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                <SelectTrigger id="machine" className="w-48">
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

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isMounted && lastUpdated && (
            <span className="text-xs text-gray-500" suppressHydrationWarning>
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

