import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx('animate-pulse bg-white/[0.05] rounded-sm', className)
      )}
      {...props}
    />
  );
};

export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 bg-white/[0.05] rounded-sm w-3/4" />
        </td>
      ))}
    </tr>
  );
};

export const MetricCardSkeleton: React.FC = () => {
  return (
    <div className="p-5 border border-surface-border bg-surface rounded-sm space-y-3 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-3 bg-white/[0.05] rounded w-1/3" />
        <div className="h-4 w-4 bg-white/[0.05] rounded" />
      </div>
      <div className="h-7 bg-white/[0.08] rounded w-2/3" />
      <div className="h-3 bg-white/[0.04] rounded w-1/2" />
    </div>
  );
};
