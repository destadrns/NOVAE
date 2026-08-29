import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive';
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-surface border-surface-border',
    elevated: 'bg-surface-elevated border-surface-border shadow-xl',
    interactive:
      'bg-surface hover:bg-surface-elevated border-surface-border hover:border-surface-border-active transition-all duration-200 cursor-pointer',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'border rounded-sm p-4 sm:p-5 relative overflow-hidden',
          variants[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={twMerge(clsx('flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/5', className))} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3 className={twMerge(clsx('text-xs font-mono uppercase tracking-widest text-muted font-medium', className))} {...props}>
    {children}
  </h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => <div className={twMerge(clsx('space-y-4', className))} {...props}>{children}</div>;
