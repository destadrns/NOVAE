import React from 'react';
import { Link } from 'react-router-dom';
import { useAdminTranslation } from '@/i18n/useAdminTranslation';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { formatIDR, formatDate, getOrderStatusVariant } from '@/lib/formatters';
import { ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';
import { AdminRecentOrderSummary } from '@/lib/api';

interface RecentOrdersTableProps {
  orders?: AdminRecentOrderSummary[];
  isLoading?: boolean;
}

export const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({
  orders = [],
  isLoading = false,
}) => {
  const { t } = useAdminTranslation();

  if (isLoading) {
    return (
      <div className="p-4 sm:p-5 rounded-sm bg-surface border border-surface-border h-full flex flex-col justify-center items-center text-center min-h-[280px]">
        <Loader2 className="w-6 h-6 text-accent-lime animate-spin mb-2" />
        <p className="text-xs font-mono text-muted uppercase tracking-wider">
          {t.dashboard.recentOrdersTitle}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-sm bg-surface border border-surface-border h-full flex flex-col justify-between space-y-4">
      {/* Header with Title and Scroll Hint on Mobile */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3.5 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-mono uppercase tracking-widest text-bone font-semibold">
              {t.dashboard.recentOrdersTitle}
            </h3>
            <span className="sm:hidden text-[9px] font-mono text-muted/60 bg-white/5 px-1.5 py-0.5 rounded-sm">
              ← geser →
            </span>
          </div>
          <p className="text-[11px] font-sans text-muted mt-0.5">
            {t.dashboard.recentOrdersSubtitle}
          </p>
        </div>
        <Link
          to="/orders"
          className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-accent-lime hover:underline shrink-0"
        >
          <span>{t.dashboard.viewAll}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-x-auto -mx-1 px-1">
        {orders.length === 0 ? (
          <div className="py-10 text-center text-xs font-mono text-muted">
            No recent orders found.
          </div>
        ) : (
          <Table className="min-w-[520px]">
            <TableHead>
              <TableRow>
                <TableHeaderCell>{t.orders.orderIdCol}</TableHeaderCell>
                <TableHeaderCell>{t.orders.customerCol}</TableHeaderCell>
                <TableHeaderCell>{t.orders.piecesCol}</TableHeaderCell>
                <TableHeaderCell>{t.orders.totalCol}</TableHeaderCell>
                <TableHeaderCell>{t.orders.statusCol}</TableHeaderCell>
                <TableHeaderCell>{t.orders.dateCol}</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => {
                const normalizedStatus = (order.status.toUpperCase()) as any;
                const statusConfig = getOrderStatusVariant(normalizedStatus);
                const statusLabel =
                  t.status[order.status.toLowerCase() as keyof typeof t.status] ||
                  statusConfig.label;

                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-[11px] font-semibold text-bone whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-3.5 h-3.5 text-muted shrink-0" />
                        <span>{order.orderNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-bone font-medium truncate max-w-[140px]">
                        {order.customerName}
                      </div>
                      <div className="text-[10px] text-muted truncate max-w-[140px]">
                        {order.shippingCity}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-[11px] whitespace-nowrap">
                      {order.itemCount} {t.dashboard.piecesInStock.toLowerCase()}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold tabular-nums text-bone whitespace-nowrap">
                      {formatIDR(order.totalAmount)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant={statusConfig.variant} size="sm">
                        {statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-muted whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};
