import React, { useState, useEffect, useCallback } from 'react';
import { useAdminUIStore } from '@/store/useAdminUIStore';
import { useAdminTranslation } from '@/i18n/useAdminTranslation';
import { formatIDR, formatDateTime, getOrderStatusVariant } from '@/lib/formatters';
import {
  adminGetOrders,
  adminUpdateOrderStatus,
  BackendAdminOrder,
} from '@/lib/api';
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
import {
  ShoppingBag,
  Eye,
  Truck,
  CheckCircle2,
  User,
  MapPin,
  Clock,
  CreditCard,
  AlertTriangle,
  Loader2,
  Package,
  ShieldCheck,
} from 'lucide-react';

export const OrdersListPage: React.FC = () => {
  const { addToast } = useAdminUIStore();
  const { t, format } = useAdminTranslation();

  // Data state
  const [orders, setOrders] = useState<BackendAdminOrder[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [page, setPage] = useState(1);

  // Inspect drawer
  const [inspectOrder, setInspectOrder] = useState<BackendAdminOrder | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const token = localStorage.getItem('novae_admin_token');

  const statuses = [
    { label: t.orders.allOrders, value: 'ALL' },
    { label: t.status.pending, value: 'pending' },
    { label: t.status.paid, value: 'paid' },
    { label: t.status.processing, value: 'processing' },
    { label: t.status.shipped, value: 'shipped' },
    { label: t.status.delivered, value: 'delivered' },
    { label: t.status.cancelled, value: 'cancelled' },
  ];

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: apiErr } = await adminGetOrders(token, {
      search: searchQuery || undefined,
      status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
      page,
      limit: 20,
    });

    if (apiErr) {
      setError(typeof apiErr.message === 'string' ? apiErr.message : 'Failed to load orders');
      setIsLoading(false);
      return;
    }

    setOrders(data?.data || []);
    setTotalItems(data?.meta?.totalItems || 0);
    setIsLoading(false);
  }, [token, searchQuery, selectedStatus, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedStatus]);

  const handleOpenInspect = (order: BackendAdminOrder) => {
    setInspectOrder(order);
    setNewStatus('');
    setTrackingNumber(order.shipment?.trackingNumber || '');
    setStatusNote('');
  };

  const handleStatusChange = (val: string) => {
    setNewStatus(val);
    if (val === 'shipped' && !trackingNumber && inspectOrder) {
      setTrackingNumber(inspectOrder.shipment?.trackingNumber || `NV-JNE-${inspectOrder.orderNumber.replace(/[^0-9]/g, '')}`);
    }
  };

  const handleSaveOrderStatus = async () => {
    if (!inspectOrder || !newStatus) return;
    setIsUpdating(true);

    const { data, error: apiErr } = await adminUpdateOrderStatus(token, inspectOrder.id, {
      status: newStatus,
      note: statusNote || undefined,
      trackingNumber: trackingNumber || undefined,
    });

    setIsUpdating(false);

    if (apiErr) {
      const msg = Array.isArray(apiErr.message) ? apiErr.message.join(', ') : apiErr.message;
      addToast({ type: 'error', title: 'Update Failed', message: msg });
      return;
    }

    if (data) {
      const translatedStatus = t.status[newStatus.toLowerCase() as keyof typeof t.status] || newStatus;
      addToast({
        type: 'success',
        title: t.feedback.orderUpdated,
        message: format(t.feedback.orderUpdatedDesc, {
          orderNumber: inspectOrder.orderNumber,
          status: translatedStatus,
        }),
      });
      setInspectOrder(data);
      fetchOrders();
    }
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
            {t.orders.subtitle} — {totalItems} orders
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3 bg-surface p-3.5 rounded-sm border border-surface-border">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {statuses.map((s) => {
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
              </button>
            );
          })}
        </div>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t.orders.searchPlaceholder}
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-sm flex items-start gap-3 text-rose-300 text-xs font-mono">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-accent-lime animate-spin" />
        </div>
      )}

      {/* Orders Table */}
      {!isLoading && !error && orders.length === 0 && (
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
      )}

      {!isLoading && !error && orders.length > 0 && (
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
            {orders.map((order) => {
              const statusConfig = getOrderStatusVariant(order.status.toUpperCase() as any);
              const statusLabel =
                t.status[order.status.toLowerCase() as keyof typeof t.status] ||
                statusConfig.label;

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
                    {order.shippingAddress?.city || '—'}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-bone">
                    {order.itemCount} pcs
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold tabular-nums text-bone">
                    {formatIDR(order.totalIdr)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.paymentStatus === 'paid'
                          ? 'emerald'
                          : order.paymentStatus === 'pending'
                          ? 'amber'
                          : 'rose'
                      }
                      size="sm"
                    >
                      {order.paymentStatus.toUpperCase()}
                    </Badge>
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
                disabled={!newStatus || isUpdating}
                leftIcon={isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              >
                {isUpdating ? 'Updating...' : t.orders.updateOrderBtn}
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

              {inspectOrder.allowedTransitions.length === 0 ? (
                <div className="flex items-center gap-2 text-xs font-mono text-muted-light py-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent-lime" />
                  <span>This order has reached a terminal state. No further transitions allowed.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select
                    label={t.orders.updateStatusLabel}
                    value={newStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    options={[
                      { value: '', label: '— Select —' },
                      ...inspectOrder.allowedTransitions.map((s) => ({
                        value: s,
                        label: (t.status[s.toLowerCase() as keyof typeof t.status] || s).toUpperCase(),
                      })),
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
              )}

              {inspectOrder.allowedTransitions.length > 0 && (
                <Input
                  label="Admin Note"
                  placeholder="Optional note for audit trail..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
              )}
            </div>

            {/* Status History Timeline */}
            {inspectOrder.statusHistory.length > 0 && (
              <div className="p-3.5 bg-surface border border-surface-border rounded-sm space-y-3">
                <h4 className="text-[11px] font-mono uppercase tracking-widest text-muted font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-accent-lime" />
                  <span>Status Timeline</span>
                </h4>
                <div className="space-y-2">
                  {inspectOrder.statusHistory.map((h, i) => (
                    <div
                      key={h.id || i}
                      className="flex items-start gap-3 text-xs font-mono"
                    >
                      <div className="w-2 h-2 mt-1 rounded-full bg-accent-lime shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {h.fromStatus && (
                            <>
                              <span className="text-muted uppercase">{h.fromStatus}</span>
                              <span className="text-muted">→</span>
                            </>
                          )}
                          <span className="text-bone font-bold uppercase">{h.toStatus}</span>
                        </div>
                        {h.note && (
                          <span className="text-[10px] text-muted-light block">{h.note}</span>
                        )}
                        <span className="text-[10px] text-muted block">
                          {h.changedBy || 'System'} • {formatDateTime(h.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                  <span className="text-bone">{inspectOrder.shippingAddress?.phone || '—'}</span>
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
              <div className="text-bone font-mono text-xs leading-relaxed space-y-0.5">
                <div>{inspectOrder.shippingAddress?.recipientName || inspectOrder.customerName}</div>
                <div className="text-muted-light">{inspectOrder.shippingAddress?.addressLine1}</div>
                <div className="text-muted-light">
                  {inspectOrder.shippingAddress?.city}, {inspectOrder.shippingAddress?.province}{' '}
                  {inspectOrder.shippingAddress?.postalCode}
                </div>
                <div className="text-muted-light">{inspectOrder.shippingAddress?.country}</div>
                {inspectOrder.shippingAddress?.notes && (
                  <div className="text-[10px] text-amber-300 mt-1">
                    📝 {inspectOrder.shippingAddress.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Info */}
            {inspectOrder.payments.length > 0 && (
              <div className="p-3.5 bg-surface border border-surface-border rounded-sm space-y-2.5">
                <h4 className="text-[11px] font-mono uppercase tracking-widest text-muted font-semibold flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Payment & Settlement</span>
                  </div>
                  <span className="text-[10px] text-muted-light font-mono font-normal">
                    Order: {inspectOrder.paymentStatus.toUpperCase()}
                  </span>
                </h4>
                {inspectOrder.payments.map((p) => (
                  <div key={p.id} className="p-2.5 bg-charcoal-dark border border-surface-border rounded-sm space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-bone font-bold uppercase">{p.method || p.provider}</span>
                        <span className="text-muted text-[10px] ml-2">({p.provider})</span>
                      </div>
                      <Badge
                        variant={p.status === 'paid' ? 'emerald' : p.status === 'pending' ? 'amber' : 'rose'}
                        size="sm"
                      >
                        {p.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-[11px] text-muted-light pt-0.5 border-t border-surface-border/50">
                      <span>Amount: <strong className="text-bone">{formatIDR(p.amountIdr)}</strong></span>
                      {p.paidAt && (
                        <span className="text-emerald-400">Paid: {formatDateTime(p.paidAt)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Items Ordered */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-mono uppercase tracking-widest text-muted font-semibold">
                {format(t.orders.orderedGarments, { count: inspectOrder.items.length })}
              </h4>
              <div className="space-y-2">
                {inspectOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-sm bg-charcoal-dark border border-surface-border gap-3"
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-10 h-12 object-cover rounded-sm border border-surface-border shrink-0 bg-charcoal"
                      />
                    ) : (
                      <div className="w-10 h-12 rounded-sm border border-surface-border shrink-0 bg-charcoal flex items-center justify-center">
                        <Package className="w-4 h-4 text-muted" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-xs font-semibold text-bone truncate">
                        {item.productName}
                      </div>
                      <div className="text-[10px] font-mono text-muted">
                        SKU: {item.sku} • {item.colorName} / {item.size} • Qty: {item.quantity}
                      </div>
                      {item.inventory && (
                        <div className="text-[10px] font-mono text-muted-light">
                          Stock: {item.inventory.available} avail / {item.inventory.quantityOnHand} on-hand / {item.inventory.reservedQuantity} reserved
                        </div>
                      )}
                    </div>
                    <div className="font-mono text-xs font-bold text-bone tabular-nums shrink-0">
                      {formatIDR(item.lineTotalIdr)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-3.5 bg-charcoal-dark border border-surface-border rounded-sm space-y-2 text-xs font-mono">
              <div className="flex justify-between text-muted">
                <span>{t.orders.subtotal}</span>
                <span className="text-bone">{formatIDR(inspectOrder.subtotalIdr)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>{t.orders.shippingCourier}</span>
                <span className="text-bone">
                  {inspectOrder.shippingIdr === 0 ? t.orders.freePromo : formatIDR(inspectOrder.shippingIdr)}
                </span>
              </div>
              <div className="flex justify-between text-muted border-t border-white/10 pt-2 font-bold text-sm">
                <span className="text-bone">{t.orders.totalSettled}</span>
                <span className="text-accent-lime">{formatIDR(inspectOrder.totalIdr)}</span>
              </div>
            </div>

            {/* Shipment Info */}
            {inspectOrder.shipment && (
              <div className="p-3.5 bg-surface border border-surface-border rounded-sm space-y-2">
                <h4 className="text-[11px] font-mono uppercase tracking-widest text-muted font-semibold flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Shipment</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-muted block">Tracking</span>
                    <span className="text-bone font-bold">{inspectOrder.shipment.trackingNumber || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted block">Status</span>
                    <span className="text-bone uppercase">{inspectOrder.shipment.status}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Drawer>
      )}
    </div>
  );
};
