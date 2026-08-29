import React, { useState } from 'react';
import { useAdminDataStore } from '@/store/useAdminDataStore';
import { useAdminUIStore } from '@/store/useAdminUIStore';
import { useAdminTranslation } from '@/i18n/useAdminTranslation';
import { AdminOrder, OrderStatus } from '@/types';
import { formatIDR, formatDateTime, getOrderStatusVariant } from '@/lib/formatters';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Drawer } from '@/components/ui/Drawer';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ShoppingBag, Eye, Truck, CheckCircle2, User, MapPin } from 'lucide-react';

export const OrdersListPage: React.FC = () => {
  const { orders, updateOrderStatus } = useAdminDataStore();
  const { addToast } = useAdminUIStore();
  const { t, format } = useAdminTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [inspectOrder, setInspectOrder] = useState<AdminOrder | null>(null);

  // Status update in inspect drawer
  const [newStatus, setNewStatus] = useState<OrderStatus>('PAID');
  const [trackingNumber, setTrackingNumber] = useState('');

  const statuses: { label: string; value: string }[] = [
    { label: t.orders.allOrders, value: 'ALL' },
    { label: t.status.paid, value: 'PAID' },
    { label: t.status.processing, value: 'PROCESSING' },
    { label: t.status.shipped, value: 'SHIPPED' },
    { label: t.status.delivered, value: 'DELIVERED' },
    { label: t.status.pending, value: 'PENDING' },
    { label: t.status.cancelled, value: 'CANCELLED' },
  ];

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shippingCity.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || o.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenInspect = (order: AdminOrder) => {
    setInspectOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.trackingNumber || '');
  };

  const handleSaveOrderStatus = () => {
    if (!inspectOrder) return;
    updateOrderStatus(inspectOrder.id, newStatus, trackingNumber || undefined);
    const translatedStatus = t.status[newStatus.toLowerCase() as keyof typeof t.status] || newStatus;
    addToast({
      type: 'success',
      title: t.feedback.orderUpdated,
      message: format(t.feedback.orderUpdatedDesc, {
        orderNumber: inspectOrder.orderNumber,
        status: translatedStatus,
      }),
    });
    setInspectOrder(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-lg sm:text-xl font-mono uppercase tracking-widest text-bone font-bold">
            {t.orders.title}
          </h1>
          <p className="text-xs font-sans text-muted mt-1">
            {t.orders.subtitle}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3 bg-surface p-3.5 rounded-sm border border-surface-border">
        {/* Status Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {statuses.map((s) => {
            const count =
              s.value === 'ALL'
                ? orders.length
                : orders.filter((o) => o.status === s.value).length;
            const isSelected = selectedStatus === s.value;

            return (
              <button
                key={s.value}
                onClick={() => setSelectedStatus(s.value)}
                className={`px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                  isSelected
                    ? 'bg-accent-lime text-obsidian font-bold shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-muted hover:text-bone'
                }`}
              >
                <span>{s.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-obsidian/20 text-obsidian' : 'bg-white/10 text-muted'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t.orders.searchPlaceholder}
        />
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-6 h-6" />}
          title={t.orders.emptyTitle}
          description={t.orders.emptyDesc}
          actionLabel={t.orders.viewAllOrders}
          onAction={() => {
            setSearchQuery('');
            setSelectedStatus('ALL');
          }}
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>{t.orders.orderIdCol}</TableHeaderCell>
              <TableHeaderCell>{t.orders.customerCol}</TableHeaderCell>
              <TableHeaderCell>{t.orders.destinationCol}</TableHeaderCell>
              <TableHeaderCell>{t.orders.piecesCol}</TableHeaderCell>
              <TableHeaderCell>{t.orders.totalCol}</TableHeaderCell>
              <TableHeaderCell>{t.orders.paymentCol}</TableHeaderCell>
              <TableHeaderCell>{t.orders.statusCol}</TableHeaderCell>
              <TableHeaderCell>{t.orders.dateCol}</TableHeaderCell>
              <TableHeaderCell className="text-right">{t.orders.actionCol}</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => {
              const statusConfig = getOrderStatusVariant(order.status);
              const statusLabel =
                t.status[order.status.toLowerCase() as keyof typeof t.status] ||
                statusConfig.label;
              const totalItems = order.items.reduce((acc, i) => acc + i.quantity, 0);

              return (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-[11px] font-semibold text-bone">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-medium text-bone">{order.customerName}</div>
                    <div className="text-[10px] font-sans text-muted">{order.customerEmail}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted">
                    {order.shippingCity}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-bone">
                    {totalItems} {t.dashboard.piecesInStock.toLowerCase()}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold tabular-nums text-bone">
                    {formatIDR(order.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-[10px] text-muted uppercase">
                      {order.paymentMethod.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig.variant} size="sm">
                      {statusLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-muted">
                    {formatDateTime(order.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenInspect(order)}
                      leftIcon={<Eye className="w-3 h-3" />}
                    >
                      {t.orders.inspectBtn}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Inspect Order Slide-Over Drawer */}
      {inspectOrder && (
        <Drawer
          isOpen={true}
          onClose={() => setInspectOrder(null)}
          title={format(t.orders.drawerTitle, { orderNumber: inspectOrder.orderNumber })}
          subtitle={format(t.orders.drawerSubtitle, { date: formatDateTime(inspectOrder.createdAt) })}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button variant="ghost" size="sm" onClick={() => setInspectOrder(null)}>
                {t.orders.closeBtn}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveOrderStatus}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                {t.orders.updateOrderBtn}
              </Button>
            </div>
          }
        >
          <div className="space-y-5 text-xs font-sans">
            {/* Status Modification Control */}
            <div className="p-3.5 bg-charcoal-dark border border-surface-border rounded-sm space-y-3">
              <h4 className="text-[11px] font-mono uppercase tracking-widest text-muted font-semibold">
                {t.orders.fulfillmentControls}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label={t.orders.updateStatusLabel}
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  options={[
                    { value: 'PAID', label: t.status.paid },
                    { value: 'PROCESSING', label: t.status.processing },
                    { value: 'SHIPPED', label: t.status.shipped },
                    { value: 'DELIVERED', label: t.status.delivered },
                    { value: 'CANCELLED', label: t.status.cancelled },
                  ]}
                />
                <Input
                  label={t.orders.trackingNumberLabel}
                  placeholder={t.orders.trackingPlaceholder}
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  leftIcon={<Truck className="w-3.5 h-3.5" />}
                />
              </div>
            </div>

            {/* Customer Details */}
            <div className="p-3.5 bg-surface border border-surface-border rounded-sm space-y-2.5">
              <h4 className="text-[11px] font-mono uppercase tracking-widest text-muted font-semibold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-accent-lime" />
                <span>{t.orders.customerInfo}</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-muted block">{t.orders.clientName}</span>
                  <span className="text-bone font-medium">{inspectOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted block">{t.orders.phone}</span>
                  <span className="text-bone">{inspectOrder.customerPhone}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-muted block">{t.orders.email}</span>
                  <span className="text-bone">{inspectOrder.customerEmail}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-3.5 bg-surface border border-surface-border rounded-sm space-y-2.5">
              <h4 className="text-[11px] font-mono uppercase tracking-widest text-muted font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t.orders.deliveryAddress}</span>
              </h4>
              <p className="text-bone font-mono text-xs leading-relaxed">
                {inspectOrder.shippingAddress}
              </p>
            </div>

            {/* Items Ordered */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-mono uppercase tracking-widest text-muted font-semibold">
                {format(t.orders.orderedGarments, { count: inspectOrder.items.length })}
              </h4>
              <div className="space-y-2">
                {inspectOrder.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-sm bg-charcoal-dark border border-surface-border gap-3"
                  >
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-10 h-12 object-cover rounded-sm border border-surface-border shrink-0 bg-charcoal"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-xs font-semibold text-bone truncate">
                        {item.productName}
                      </div>
                      <div className="text-[10px] font-mono text-muted">
                        Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="font-mono text-xs font-bold text-bone tabular-nums shrink-0">
                      {formatIDR(item.totalPrice)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-3.5 bg-charcoal-dark border border-surface-border rounded-sm space-y-2 text-xs font-mono">
              <div className="flex justify-between text-muted">
                <span>{t.orders.subtotal}</span>
                <span className="text-bone">{formatIDR(inspectOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>{t.orders.shippingCourier}</span>
                <span className="text-bone">
                  {inspectOrder.shippingFee === 0 ? t.orders.freePromo : formatIDR(inspectOrder.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-muted border-t border-white/10 pt-2 font-bold text-sm">
                <span className="text-bone">{t.orders.totalSettled}</span>
                <span className="text-accent-lime">{formatIDR(inspectOrder.totalAmount)}</span>
              </div>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
};
