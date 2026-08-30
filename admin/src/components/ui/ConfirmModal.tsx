import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: React.ReactNode;
  itemName?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  variant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      title={title}
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`p-2.5 rounded-sm shrink-0 ${
              variant === 'danger'
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}
          >
            {variant === 'danger' ? (
              <Trash2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div className="space-y-1.5 min-w-0">
            {itemName && (
              <span className="block text-xs font-mono font-bold text-bone truncate">
                {itemName}
              </span>
            )}
            <div className="text-xs font-sans text-muted leading-relaxed">
              {description}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Memproses...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
