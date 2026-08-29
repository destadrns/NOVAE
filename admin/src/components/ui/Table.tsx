import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className="w-full overflow-x-auto border border-surface-border rounded-sm bg-surface">
      <table
        className={twMerge(clsx('w-full text-left border-collapse text-xs', className))}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

export const TableHead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <thead
    className={twMerge(clsx('bg-charcoal-dark/70 border-b border-surface-border font-mono', className))}
    {...props}
  >
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...props
}) => (
  <tbody className={twMerge(clsx('divide-y divide-white/5', className))} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className,
  children,
  ...props
}) => (
  <tr
    className={twMerge(
      clsx('hover:bg-white/[0.02] transition-colors duration-150 group', className)
    )}
    {...props}
  >
    {children}
  </tr>
);

export const TableHeaderCell: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <th
    className={twMerge(
      clsx(
        'px-4 py-3 text-[10px] uppercase tracking-widest text-muted font-semibold whitespace-nowrap',
        className
      )
    )}
    {...props}
  >
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...props
}) => (
  <td className={twMerge(clsx('px-4 py-3.5 text-bone font-sans', className))} {...props}>
    {children}
  </td>
);
