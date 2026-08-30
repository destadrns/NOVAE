import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useAuthStore } from '@/store/useAuthStore';
import { apiTrackOrder, apiGetUserOrders, FrontendOrder } from '@/lib/api';
import { formatIDR } from '@/lib/formatters';
import {
  Truck,
  Search,
  Package,
  Clock,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  MapPin,
  Loader2,
} from 'lucide-react';

export const TrackOrderPage: React.FC = () => {
  const { language } = useLanguageStore();
  const { token, isAuthenticated } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryOrderNum = searchParams.get('order') || '';

  const [inputOrderNumber, setInputOrderNumber] = useState(queryOrderNum);
  const [order, setOrder] = useState<FrontendOrder | null>(null);
  const [myOrders, setMyOrders] = useState<FrontendOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);

  const isId = language === 'id';

  // Perform tracking search
  const performSearch = async (orderNum: string) => {
    if (!orderNum.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { data } = await apiTrackOrder(orderNum.trim(), language);
      if (data) {
        setOrder(data);
        setSearchParams({ order: orderNum.trim() });
      } else {
        setOrder(null);
        setErrorMessage(
          isId
            ? `Pesanan '${orderNum}' tidak ditemukan. Pastikan format nomor pesanan benar (contoh: NOV-2026-0104).`
            : `Order '${orderNum}' not found. Please verify the order number format (e.g. NOV-2026-0104).`,
        );
      }
    } catch {
      setOrder(null);
      setErrorMessage(
        isId
          ? 'Gagal terhubung ke sistem pelacakan. Periksa koneksi internet Anda.'
          : 'Failed to connect to tracking system. Please check your connection.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-search if URL query param exists
  useEffect(() => {
    if (queryOrderNum) {
      setInputOrderNumber(queryOrderNum);
      performSearch(queryOrderNum);
    }
  }, [queryOrderNum, language]);

  // Load user's recent orders if authenticated
  useEffect(() => {
    if (token) {
      apiGetUserOrders(token, language).then(({ data }) => {
        if (data) setMyOrders(data);
      });
    }
  }, [token, language]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(inputOrderNumber);
  };

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  // 5-step lifecycle definition
  const steps = [
    { key: 'pending', label: isId ? 'Pesanan Dibuat' : 'Order Placed', desc: isId ? 'Menunggu pembayaran' : 'Awaiting payment' },
    { key: 'paid', label: isId ? 'Pembayaran Lunas' : 'Payment Confirmed', desc: isId ? 'Diverifikasi sistem' : 'Verified by system' },
    { key: 'processing', label: isId ? 'Proses Atelier' : 'Atelier Curation', desc: isId ? 'Inspeksi & kurasi' : 'Garment preparation' },
    { key: 'shipped', label: isId ? 'Dalam Pengiriman' : 'Dispatched', desc: isId ? 'Diserahkan ke kurir' : 'Handed to courier' },
    { key: 'delivered', label: isId ? 'Pesanan Tiba' : 'Delivered', desc: isId ? 'Diterima di alamat' : 'Arrived at client' },
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

  const currentStepIdx = order ? getStepIndex(order.status) : 0;
  const isCancelled = order?.status.toLowerCase() === 'cancelled';

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-xs font-mono tracking-widest uppercase">
          <Truck className="w-3.5 h-3.5" />
          <span>{isId ? 'Pelacakan Pengiriman Real-Time' : 'Live Shipment Tracking'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight text-bone">
          {isId ? 'Lacak Pesanan Atelier' : 'Track Atelier Order'}
        </h1>
        <p className="text-xs sm:text-sm font-mono text-muted-light max-w-lg mx-auto">
          {isId
            ? 'Pantau tahapan kurasi busana, penjahitan, dan perjalanan kurir menuju alamat Anda.'
            : 'Monitor garment curation, craftsmanship inspection, and courier transit directly to your door.'}
        </p>
      </div>

      {/* Tracking Search Input Card */}
      <div className="p-6 bg-charcoal border border-white/10 rounded-sm space-y-4 shadow-xl">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-light absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isId ? 'Masukkan Nomor Pesanan (contoh: NOV-2026-0104)...' : 'Enter Order Number (e.g. NOV-2026-0104)...'}
              value={inputOrderNumber}
              onChange={(e) => setInputOrderNumber(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-obsidian border border-white/15 rounded-sm text-sm font-mono text-bone placeholder:text-muted focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !inputOrderNumber.trim()}
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-obsidian font-mono font-bold text-xs uppercase tracking-widest rounded-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md shrink-0"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
            <span>{isId ? 'Lacak Sekarang' : 'Track Now'}</span>
          </button>
        </form>

        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-sm flex items-center gap-2.5 text-rose-300 text-xs font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Quick Select from Logged in Customer's Orders */}
        {isAuthenticated && myOrders.length > 0 && !order && (
          <div className="pt-3 border-t border-white/5 space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted">
              {isId ? 'Pesanan Terakhir di Akun Anda:' : 'Recent Orders from Your Account:'}
            </div>
            <div className="flex flex-wrap gap-2">
              {myOrders.slice(0, 4).map((myOrd) => (
                <button
                  key={myOrd.id}
                  type="button"
                  onClick={() => {
                    setInputOrderNumber(myOrd.orderNumber);
                    performSearch(myOrd.orderNumber);
                  }}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-bone hover:text-cyan-300 text-xs font-mono rounded-sm flex items-center gap-2 transition-colors"
                >
                  <span className="font-bold">{myOrd.orderNumber}</span>
                  <span className="text-[10px] text-muted-light">({myOrd.status})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Live Order Tracking Result View */}
      {order && (
        <div className="bg-charcoal border border-white/15 rounded-sm p-6 sm:p-8 space-y-8 shadow-2xl">
          {/* Top Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>NOVAÉ // {isId ? 'STATUS PENGIRIMAN RESMI' : 'OFFICIAL SHIPMENT STATUS'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-mono font-bold text-bone">
                {order.orderNumber}
              </h2>
              <p className="text-xs font-mono text-muted-light">
                {isId ? 'Dipesan pada' : 'Placed on'}{' '}
                {new Date(order.placedAt || order.createdAt).toLocaleDateString(isId ? 'id-ID' : 'en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-mono px-3 py-1 rounded-sm uppercase tracking-wider font-bold border ${
                  order.status === 'delivered' || order.status === 'paid'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : order.status === 'cancelled'
                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    : 'bg-accent-lime/10 text-accent-lime border-accent-lime/30'
                }`}
              >
                Status: {order.status}
              </span>
            </div>
          </div>

          {/* Courier Resi Banner */}
          {order.shipment?.trackingNumber && (
            <div className="p-4 bg-obsidian/80 border border-cyan-500/30 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-muted-light uppercase tracking-wider">
                    {isId ? 'Kurir & Nomor Resi Pelacakan' : 'Courier & Tracking Number'}
                  </div>
                  <div className="text-sm font-bold font-mono text-bone flex items-center gap-2">
                    <span>{order.shipment.courier || 'JNE Express'}</span>
                    <span className="text-muted-light">•</span>
                    <span className="text-cyan-300">{order.shipment.trackingNumber}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopyTracking(order.shipment!.trackingNumber!)}
                className="px-3.5 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold rounded-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                {copiedTracking ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isId ? 'Resi Tersalin!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isId ? 'Salin Resi' : 'Copy Tracking Code'}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* 5-Step Visual Timeline */}
          <div className="p-5 bg-obsidian/50 border border-white/10 rounded-sm space-y-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-bone flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent-lime" />
              <span>{isId ? 'Progres Tahapan Pesanan' : 'Order Progression Milestones'}</span>
            </h3>

            {isCancelled ? (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-sm flex items-center gap-3 text-rose-300 text-xs font-mono">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                <div>
                  <div className="font-bold">{isId ? 'Pesanan Telah Dibatalkan' : 'Order Cancelled'}</div>
                  <div className="text-[11px] text-rose-300/80">
                    {isId
                      ? 'Pesanan ini tidak lagi dalam proses pengiriman.'
                      : 'This order is no longer in active transit.'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-0 pt-2">
                {steps.map((step, idx) => {
                  const isPassed = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div key={step.key} className="relative flex flex-col items-center text-center px-1">
                      {idx < steps.length - 1 && (
                        <div
                          className={`hidden sm:block absolute top-3.5 left-1/2 w-full h-[2px] -z-0 ${
                            idx < currentStepIdx ? 'bg-accent-lime' : 'bg-white/10'
                          }`}
                        />
                      )}

                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs z-10 transition-all ${
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

                      <div className="mt-2 space-y-0.5 font-mono">
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
          </div>

          {/* Live Courier Checkpoints */}
          {(order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') && (
            <div className="p-5 bg-obsidian/70 border border-cyan-500/20 rounded-sm space-y-3 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  <span>{isId ? 'Titik Pelacakan Logistik Kurir' : 'Live Logistics Checkpoints'}</span>
                </span>
                <span className="text-[10px] text-muted-light">
                  {order.status === 'delivered'
                    ? isId ? 'Telah Tiba di Tujuan' : 'Delivered'
                    : isId ? 'Estimasi Pengantaran: 1-2 Hari Kerja' : 'ETA: 1-2 Business Days'}
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                {[
                  {
                    title: isId ? '1. Kurasi & Inspeksi Kualitas Atelier' : '1. Atelier Curation & Quality Inspection',
                    desc: isId ? 'Pemeriksaan standar jahitan, presisi pola, dan sertifikasi arsip di Atelier Bandung.' : 'Pattern precision and archival certification verified at Bandung Atelier.',
                    passed: true,
                    active: order.status === 'processing',
                  },
                  {
                    title: isId ? '2. Pengemasan Arsip & Serah Terima Kurir' : '2. Archival Packaging & Courier Handover',
                    desc: isId ? `Kemasan proteksi bebas plastik diserahkan ke ${order.shipment?.courier || 'Kurir Logistik'}.` : `Protected packaging handed over to ${order.shipment?.courier || 'Logistics Courier'}.`,
                    passed: order.status === 'shipped' || order.status === 'delivered',
                    active: order.status === 'shipped',
                  },
                  {
                    title: isId ? '3. Kurir Menuju Alamat Penerima' : '3. Out for Final Delivery',
                    desc: isId ? `Kurir mengantarkan paket menuju ${order.shippingAddress?.city || 'kota tujuan'}.` : `Courier in transit to ${order.shippingAddress?.city || 'destination'}.`,
                    passed: order.status === 'delivered',
                    active: false,
                  },
                ].map((cp, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-sm border flex items-start gap-3 transition-all ${
                      cp.active
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200 shadow-sm'
                        : cp.passed
                        ? 'bg-white/5 border-white/10 text-bone'
                        : 'bg-black/20 border-white/5 text-muted opacity-60'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0 text-[10px] font-bold ${
                        cp.active
                          ? 'bg-cyan-400 text-obsidian animate-pulse'
                          : cp.passed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white/10 text-muted'
                      }`}
                    >
                      {cp.passed ? '✓' : idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs flex items-center justify-between">
                        <span>{cp.title}</span>
                        {cp.active && (
                          <span className="text-[9px] uppercase px-1.5 py-0.5 bg-cyan-400 text-obsidian font-bold rounded">
                            {isId ? 'Sedang Berjalan' : 'In Progress'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-light mt-0.5 leading-relaxed">{cp.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit History Log if exists */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="p-4 bg-obsidian/40 border border-white/5 rounded-sm space-y-2 font-mono text-xs">
              <div className="text-[10px] text-muted tracking-wider uppercase font-bold">
                {isId ? 'Riwayat Catatan Perubahan Status' : 'Status Change Audit Log'}
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

          {/* Items Summary & Destination Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs pt-4 border-t border-white/10">
            {/* Delivery Destination */}
            <div className="p-4 bg-obsidian/40 border border-white/5 rounded-sm space-y-2">
              <div className="text-[10px] text-muted uppercase tracking-wider font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-accent-lime" />
                <span>{isId ? 'Alamat Pengantaran' : 'Delivery Address'}</span>
              </div>
              <div className="text-bone font-bold">{order.shippingAddress?.fullName || 'Klien Atelier'}</div>
              <div className="text-muted-light">{order.shippingAddress?.street || ''}</div>
              <div className="text-muted-light">
                {order.shippingAddress?.city}, {order.shippingAddress?.province} {order.shippingAddress?.postalCode}
              </div>
            </div>

            {/* Garments in Bag */}
            <div className="p-4 bg-obsidian/40 border border-white/5 rounded-sm space-y-2">
              <div className="text-[10px] text-muted uppercase tracking-wider font-bold flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-accent-lime" />
                <span>{isId ? 'Busana Dalam Pesanan' : 'Ordered Garments'}</span>
              </div>
              <div className="space-y-1.5">
                {order.items.map((it) => (
                  <div key={it.id} className="flex justify-between items-center text-[11px]">
                    <span className="text-bone font-bold truncate max-w-[180px]">
                      {it.productName} ({it.size || 'M'}) × {it.quantity}
                    </span>
                    <span className="text-accent-lime font-mono">{formatIDR(it.lineTotalIdr)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-white/5 flex justify-between items-center text-xs font-bold">
                <span className="text-muted">{isId ? 'Total Nilai' : 'Total'}:</span>
                <span className="text-accent-lime font-mono">{formatIDR(order.totalIdr)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
