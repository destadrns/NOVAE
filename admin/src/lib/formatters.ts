import { OrderStatus } from '@/types';

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getOrderStatusVariant(status: OrderStatus): {
  variant: 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple' | 'muted';
  label: string;
} {
  switch (status) {
    case 'PAID':
      return { variant: 'emerald', label: 'PAID' };
    case 'PROCESSING':
      return { variant: 'amber', label: 'PROCESSING' };
    case 'SHIPPED':
      return { variant: 'cyan', label: 'SHIPPED' };
    case 'DELIVERED':
      return { variant: 'purple', label: 'DELIVERED' };
    case 'CANCELLED':
      return { variant: 'rose', label: 'CANCELLED' };
    case 'PENDING':
    default:
      return { variant: 'muted', label: 'PENDING' };
  }
}
