import React from 'react';
import { Box } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-white/10 rounded-sm bg-charcoal/40 my-4">
      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-muted mb-4">
        {icon || <Box className="w-6 h-6" />}
      </div>
      <h3 className="text-sm font-mono uppercase tracking-widest text-bone font-semibold">
        {title}
      </h3>
      <p className="text-xs font-sans text-muted max-w-sm mt-1 mb-5">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
