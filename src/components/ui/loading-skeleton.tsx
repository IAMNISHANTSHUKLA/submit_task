'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  rows?: number;
  columns?: number;
}

export function LoadingSkeleton({ className, rows = 5, columns = 4 }: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="skeleton h-4 rounded flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 border rounded-lg", className)}>
      <div className="skeleton h-6 w-1/3 rounded mb-4" />
      <div className="skeleton h-4 w-full rounded mb-2" />
      <div className="skeleton h-4 w-2/3 rounded mb-4" />
      <div className="skeleton h-8 w-24 rounded" />
    </div>
  );
}

export function TableSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      <div className="flex space-x-4 p-2 bg-gray-50 dark:bg-gray-800 rounded">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="skeleton h-4 flex-1 rounded" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: 8 }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 p-2">
          {Array.from({ length: 5 }).map((_, colIndex) => (
            <div key={colIndex} className="skeleton h-4 flex-1 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

