import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple' | 'lime' | 'muted';
  size?: 'sm' | 'md';
  hasDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'muted',
  size = 'md',
  hasDot = true,
  children,
  ...props
}) => {
  const variants = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
    lime: 'bg-accent-lime/10 text-accent-lime border-accent-lime/30',
    muted: 'bg-white/5 text-muted border-white/10',
  };

  const dotColors = {
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    cyan: 'bg-cyan-400',
    purple: 'bg-purple-400',
    lime: 'bg-accent-lime',
    muted: 'bg-muted',
  };

  const sizes = {
    sm: 'text-[9px] px-1.5 py-0.5 gap-1 font-mono tracking-wider uppercase',
    md: 'text-[10px] px-2 py-0.5 gap-1.5 font-mono tracking-widest uppercase',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center font-semibold rounded-sm border whitespace-nowrap select-none',
          variants[variant],
          sizes[size],
          className
        )
      )}
      {...props}
    >
      {hasDot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0 animate-pulse', dotColors[variant])} />
      )}
      <span>{children}</span>
    </span>
  );
};
