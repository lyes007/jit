'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Factory, 
  AlertTriangle, 
  TrendingUp, 
  BarChart3,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Overview', href: '/', icon: Home },
  { name: 'Production', href: '/production', icon: Factory },
  { name: 'Balanced Quantities', href: '/balanced', icon: AlertTriangle },
  { name: 'TRS & Efficiency', href: '/trs', icon: TrendingUp },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <LayoutDashboard className="h-6 w-6 text-blue-600" />
        <span className="ml-2 text-lg font-semibold">JIT Dashboard</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <item.icon className={cn(
                'mr-3 h-5 w-5',
                isActive ? 'text-blue-600' : 'text-gray-400'
              )} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <p className="text-xs text-gray-500">
          Data Warehouse Project
        </p>
      </div>
    </div>
  );
}

