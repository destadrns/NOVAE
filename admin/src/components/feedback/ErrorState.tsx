import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to Load Operational Data',
  message = 'An unexpected error occurred while communicating with the atelier service. Please try again.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-rose-500/20 bg-rose-500/5 rounded-sm my-4">
      <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-mono uppercase tracking-widest text-rose-400 font-semibold">
        {title}
      </h3>
      <p className="text-xs font-sans text-muted max-w-md mt-1 mb-5">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          RETRY REQUEST
        </Button>
      )}
    </div>
  );
};
