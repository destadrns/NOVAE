import React, { useState } from 'react';
import { FrontendOrder } from '@/lib/api';
import { formatIDR } from '@/lib/formatters';
import {
  X,
  Package,
  Clock,
  CreditCard,
  Truck,
  MapPin,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

interface CustomerOrderDetailModalProps {
  order: FrontendOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onPaySimulate: (order: FrontendOrder) => void;
  isId?: boolean;
}

export const CustomerOrderDetailModal: React.FC<CustomerOrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onPaySimulate,
  isId = true,
}) => {
  const [copiedTracking, setCopiedTracking] = useState(false);

  if (!isOpen || !order) return null;

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  // Stepper timeline definition
  const steps = [
    { key: 'pending', label: isId ? 'Pesanan Dibuat' : 'Order Placed', desc: isId ? 'Menunggu pembayaran' : 'Awaiting payment' },
    { key: 'paid', label: isId ? 'Pembayaran Lunas' : 'Payment Confirmed', desc: isId ? 'Diverifikasi sistem' : 'Verified by system' },
    { key: 'processing', label: isId ? 'Proses Atelier' : 'Atelier Processing', desc: isId ? 'Kurasi & penjahitan' : 'Garment preparation' },
    { key: 'shipped', label: isId ? 'Dalam Pengiriman' : 'Dispatched', desc: isId ? 'Diserahkan ke kurir' : 'Handed to courier' },
    { key: 'delivered', label: isId ? 'Pesanan Diterima' : 'Delivered', desc: isId ? 'Tiba di alamat klien' : 'Arrived at client' },
  ];

  const getStepIndex = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 0;
      case 'paid': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.status);
  const isCancelled = order.status.toLowerCase() === 'cancelled';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-obsidian/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-charcoal border border-white/15 rounded-sm shadow-2xl overflow-hidden z-10 my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 bg-obsidian/60 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-accent-lime uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>NOVAÉ // {isId ? 'ARSIP PESANAN ATELIER' : 'ATELIER ORDER ARCHIVE'}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-bone">
                {order.orderNumber}
              </h2>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase tracking-wider font-bold border ${
                  order.status === 'delivered' || order.status === 'paid'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : order.status === 'cancelled'
                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    : 'bg-accent-lime/10 text-accent-lime border-accent-lime/30'
                }`}
              >
                {order.status}
              </span>
            </div>
            <p className="text-xs font-mono text-muted-light flex items-center gap-1.5 pt-0.5">
              <Calendar className="w-3.5 h-3.5 text-muted" />
              <span>
                {isId ? 'Dipesan pada' : 'Placed on'}{' '}
                {new Date(order.placedAt || order.createdAt).toLocaleString(isId ? 'id-ID' : 'en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-sm bg-white/5 hover:bg-white/10 text-muted-light hover:text-bone transition-colors"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs font-mono">
          {/* Tracking / Shipment Banner if dispatched */}
          {order.shipment && (
            <div className="p-4 bg-obsidian/80 border border-cyan-500/30 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-sm bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-light uppercase tracking-wider">
                    {isId ? 'Informasi Pengiriman & Resi' : 'Shipment Tracking'}
                  </div>
                  <div className="text-sm font-bold text-bone flex items-center gap-2">
                    <span>{order.shipment.courier || 'JNE Express'}</span>
                    <span className="text-muted-light">•</span>
                    <span className="text-cyan-300 font-mono">{order.shipment.trackingNumber || 'NV-PENDING'}</span>
                  </div>
                </div>
              </div>

              {order.shipment.trackingNumber && (
                <button
                  type="button"
                  onClick={() => handleCopyTracking(order.shipment!.trackingNumber!)}
                  className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold rounded-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  {copiedTracking ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isId ? 'Tersalin!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isId ? 'Salin Resi' : 'Copy Tracking'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Stepper Status Lifecycle */}
          <div className="p-4 bg-obsidian/50 border border-white/10 rounded-sm space-y-4">
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-light flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-accent-lime" />
              <span>{isId ? 'Progres Status Pesanan' : 'Order Status Progression'}</span>
            </h3>

            {isCancelled ? (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-sm flex items-center gap-3 text-rose-300">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                <div>
                  <div className="font-bold">{isId ? 'Pesanan Dibatalkan' : 'Order Cancelled'}</div>
                  <div className="text-[11px] text-rose-300/80">
                    {isId
                      ? 'Stok yang sempat dicadangkan telah dilepas kembali ke inventaris atelier.'
                      : 'Reserved stock units have been safely returned to atelier inventory.'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-0 pt-2">
                {steps.map((step, idx) => {
                  const isPassed = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div key={step.key} className="relative flex flex-col items-center text-center px-1">
                      {/* Connecting line */}
                      {idx < steps.length - 1 && (
                        <div
                          className={`hidden sm:block absolute top-3.5 left-1/2 w-full h-[2px] -z-0 ${
                            idx < currentStepIdx ? 'bg-accent-lime' : 'bg-white/10'
                          }`}
                        />
                      )}

                      {/* Step Circle */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs z-10 transition-all ${
                          isCurrent
                            ? 'bg-accent-lime text-obsidian ring-4 ring-accent-lime/20'
                            : isPassed
                            ? 'bg-accent-lime/20 text-accent-lime border border-accent-lime/50'
                            : 'bg-white/5 text-muted border border-white/10'
                        }`}
                      >
                        {isPassed ? (
                          idx === currentStepIdx ? (
                            idx + 1
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )
                        ) : (
                          idx + 1
                        )}
                      </div>

                      {/* Step Labels */}
                      <div className="mt-2 space-y-0.5">
                        <div
                          className={`text-[11px] font-bold ${
                            isCurrent ? 'text-accent-lime' : isPassed ? 'text-bone' : 'text-muted'
                          }`}
                        >
                          {step.label}
                        </div>
                        <div className="text-[9px] text-muted-light hidden sm:block">
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Detailed Timeline Audit Log from Backend if present */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="text-[10px] text-muted tracking-wider uppercase font-bold">
                  {isId ? 'Catatan Riwayat Log' : 'Status Audit Trail'}
                </div>
                <div className="space-y-1.5">
                  {order.statusHistory.map((hist, i) => (
                    <div key={hist.id || i} className="flex items-start gap-2 text-[11px]">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-lime mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-bone font-bold uppercase">{hist.toStatus}</span>
                        {hist.note && <span className="text-muted-light ml-2">— {hist.note}</span>}
                      </div>
                      <span className="text-[10px] text-muted shrink-0">
                        {new Date(hist.createdAt).toLocaleDateString(isId ? 'id-ID' : 'en-US', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Grid Layout: Items & Shipping */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column (2 Cols): Garments List */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-light flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-accent-lime" />
                  <span>{isId ? 'Busana Dipesan' : 'Ordered Garments'}</span>
                  <span className="text-muted">({order.items.length})</span>
                </h3>
              </div>

              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-obsidian/60 border border-white/10 rounded-sm flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-12 h-16 object-cover rounded-sm border border-white/10 shrink-0 bg-charcoal"
                        />
                      ) : (
                        <div className="w-12 h-16 rounded-sm border border-white/10 shrink-0 bg-white/5 flex items-center justify-center">
                          <Package className="w-4 h-4 text-muted" />
                        </div>
                      )}
                      <div className="space-y-1 min-w-0">
                        <div className="font-bold text-bone truncate">{item.productName}</div>
                        <div className="text-[10px] text-muted-light flex items-center gap-2 flex-wrap">
                          <span>SKU: {item.sku}</span>
                          <span>•</span>
                          <span>{item.colorName || 'Standard'}</span>
                          <span>/</span>
                          <span>Size: {item.size || 'M'}</span>
                        </div>
                        <div className="text-[10px] text-muted">
                          {item.quantity} × {formatIDR(item.unitPriceIdr)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-accent-lime">
                        {formatIDR(item.lineTotalIdr)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Address Card */}
              <div className="p-4 bg-obsidian/50 border border-white/10 rounded-sm space-y-2.5">
                <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-light flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isId ? 'Alamat Pengiriman' : 'Shipping Destination'}</span>
                </h4>
                <div className="space-y-1 text-xs text-bone leading-relaxed">
                  <div className="font-bold text-bone">
                    {order.shippingAddress?.fullName || order.shippingAddress?.recipientName}
                    <span className="text-muted font-normal ml-2">({order.shippingAddress?.phone || '—'})</span>
                  </div>
                  <div className="text-muted-light">
                    {order.shippingAddress?.street || order.shippingAddress?.addressLine1}
                  </div>
                  <div className="text-muted-light">
                    {order.shippingAddress?.city}, {order.shippingAddress?.province}{' '}
                    {order.shippingAddress?.postalCode}
                  </div>
                  <div className="text-muted">{order.shippingAddress?.country || 'Indonesia'}</div>
                  {order.shippingAddress?.notes && (
                    <div className="text-[11px] text-amber-300/90 pt-1 flex items-start gap-1">
                      <span>Catatan:</span>
                      <span>{order.shippingAddress.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column (1 Col): Financial Breakdown & Payment Details */}
            <div className="space-y-4">
              {/* Payment Status Card */}
              <div className="p-4 bg-obsidian/50 border border-white/10 rounded-sm space-y-3">
                <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-light flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isId ? 'Status Pembayaran' : 'Payment Status'}</span>
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-sm uppercase font-bold border ${
                      order.paymentStatus === 'paid'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : order.paymentStatus === 'failed'
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </h4>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-light">
                    <span>{isId ? 'Metode' : 'Method'}:</span>
                    <span className="text-bone uppercase font-bold">
                      {order.payments?.[0]?.method?.replace('_', ' ') || 'BCA VA'}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-light">
                    <span>{isId ? 'Penyedia' : 'Provider'}:</span>
                    <span className="text-muted uppercase">Simulated Sandbox</span>
                  </div>
                  {order.payments?.[0]?.paidAt && (
                    <div className="flex justify-between text-muted-light pt-1 border-t border-white/5">
                      <span>{isId ? 'Lunas Pada' : 'Settled At'}:</span>
                      <span className="text-emerald-400">
                        {new Date(order.payments[0].paidAt).toLocaleDateString(isId ? 'id-ID' : 'en-US')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Pending Payment Action */}
                {(order.status === 'pending' || order.paymentStatus === 'failed') && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onPaySimulate(order);
                    }}
                    className="w-full mt-2 py-2 px-3 bg-accent-lime hover:bg-accent-lime/90 text-obsidian text-xs font-mono font-bold uppercase tracking-wider rounded-sm flex items-center justify-center gap-1.5 transition-colors shadow-lg"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{isId ? 'Bayar / Simulasi Sekarang' : 'Pay / Simulate Payment'}</span>
                  </button>
                )}
              </div>

              {/* Price Calculation Summary */}
              <div className="p-4 bg-obsidian/50 border border-white/10 rounded-sm space-y-2.5">
                <h4 className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-light">
                  {isId ? 'Rincian Biaya' : 'Cost Breakdown'}
                </h4>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-light">
                    <span>{isId ? 'Subtotal Busana' : 'Garments Subtotal'}</span>
                    <span className="text-bone">{formatIDR(order.subtotalIdr)}</span>
                  </div>
                  <div className="flex justify-between text-muted-light">
                    <span>{isId ? 'Biaya Pengiriman' : 'Shipping Fee'}</span>
                    <span className="text-bone">
                      {order.shippingIdr === 0 ? (
                        <span className="text-emerald-400">{isId ? 'Gratis' : 'Free'}</span>
                      ) : (
                        formatIDR(order.shippingIdr)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-light">
                    <span>{isId ? 'Pajak (PPN 11%)' : 'Tax (11% VAT)'}</span>
                    <span className="text-muted">{isId ? 'Termasuk' : 'Included'}</span>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                    <span className="font-bold text-bone">{isId ? 'Total Akhir' : 'Grand Total'}</span>
                    <span className="text-base font-bold text-accent-lime">
                      {formatIDR(order.totalIdr)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-obsidian/60 flex items-center justify-between shrink-0">
          <div className="text-[10px] font-mono text-muted">
            {isId ? 'Dokumen transaksi resmi NOVAÉ Atelier' : 'Official NOVAÉ Atelier Transaction Record'}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/15 text-bone text-xs font-mono uppercase tracking-wider rounded-sm transition-colors"
          >
            {isId ? 'Tutup' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
