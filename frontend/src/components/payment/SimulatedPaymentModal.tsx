import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
  Clock,
  Lock,
  ArrowRight,
  RefreshCw,
  X,
  Sparkles,
} from 'lucide-react';
import { formatIDR } from '@/lib/formatters';
import { useAuthStore } from '@/store/useAuthStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { apiSimulatePayment, FrontendOrder } from '@/lib/api';

interface SimulatedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: FrontendOrder | null;
  onPaymentSuccess?: (updatedOrder: FrontendOrder) => void;
  onPaymentUpdated?: (updatedOrder: FrontendOrder) => void;
}

type PaymentMethodKey = 'bca_va' | 'mandiri_va' | 'qris' | 'credit_card' | 'manual_transfer';

interface PaymentMethodOption {
  id: PaymentMethodKey;
  nameId: string;
  nameEn: string;
  descId: string;
  descEn: string;
  icon: React.ReactNode;
  vaPrefix: string;
}

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'bca_va',
    nameId: 'BCA Virtual Account',
    nameEn: 'BCA Virtual Account',
    descId: 'Verifikasi Otomatis 24 Jam Bebas Biaya Admin',
    descEn: '24/7 Instant Automatic Verification & Zero Admin Fee',
    icon: <Building2 className="w-4 h-4 text-accent-lime" />,
    vaPrefix: '8001',
  },
  {
    id: 'mandiri_va',
    nameId: 'Mandiri Virtual Account',
    nameEn: 'Mandiri Virtual Account',
    descId: 'Transfer Instan via Livin by Mandiri & ATM',
    descEn: 'Instant Transfer via Livin by Mandiri & ATM',
    icon: <Building2 className="w-4 h-4 text-cyan-400" />,
    vaPrefix: '8902',
  },
  {
    id: 'qris',
    nameId: 'QRIS / Digital Wallet',
    nameEn: 'QRIS / Digital Wallet',
    descId: 'Pindai instan via GoPay, OVO, ShopeePay, Dana, atau BCA',
    descEn: 'Scan instantly via GoPay, OVO, ShopeePay, Dana, or Bank App',
    icon: <QrCode className="w-4 h-4 text-emerald-400" />,
    vaPrefix: 'QRIS',
  },
  {
    id: 'credit_card',
    nameId: 'Kartu Kredit / Debit Online',
    nameEn: 'Credit / Debit Card Online',
    descId: 'Visa, Mastercard, JCB berkeamanan 3D Secure',
    descEn: 'Visa, Mastercard, JCB with 3D Secure Protection',
    icon: <CreditCard className="w-4 h-4 text-amber-400" />,
    vaPrefix: 'CC',
  },
  {
    id: 'manual_transfer',
    nameId: 'Atelier Concierge Bank Transfer',
    nameEn: 'Atelier Concierge Bank Transfer',
    descId: 'Transfer bank manual dengan verifikasi staf atelier',
    descEn: 'Manual transfer with dedicated atelier staff verification',
    icon: <Building2 className="w-4 h-4 text-muted-light" />,
    vaPrefix: '1100',
  },
];

export const SimulatedPaymentModal: React.FC<SimulatedPaymentModalProps> = ({
  isOpen,
  onClose,
  order,
  onPaymentSuccess,
  onPaymentUpdated,
}) => {
  const { token } = useAuthStore();
  const { language } = useLanguageStore();
  const isId = language === 'id';

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodKey>(
    (order?.payments?.[0]?.method as PaymentMethodKey) || 'bca_va',
  );
  const [copied, setCopied] = useState(false);
  const [simulationState, setSimulationState] = useState<'idle' | 'processing' | 'success' | 'failed' | 'cancelled'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<FrontendOrder | null>(order);

  // Sync current order whenever prop changes
  React.useEffect(() => {
    if (order) {
      setCurrentOrder(order);
      if (order.payments?.[0]?.method) {
        setSelectedMethod(order.payments[0].method as PaymentMethodKey);
      }
      if (order.status === 'paid') {
        setSimulationState('success');
      } else if (order.status === 'cancelled') {
        setSimulationState('cancelled');
      } else if (order.paymentStatus === 'failed') {
        setSimulationState('failed');
      } else {
        setSimulationState('idle');
      }
    }
  }, [order]);

  if (!isOpen || !currentOrder) return null;

  // Generate deterministic VA number based on order ID / number
  const methodConfig = PAYMENT_METHODS.find((m) => m.id === selectedMethod) || PAYMENT_METHODS[0];
  const orderNumClean = currentOrder.orderNumber.replace(/\D/g, '').padEnd(8, '0');
  const vaNumber = `${methodConfig.vaPrefix} 2026 ${orderNumClean.slice(0, 4)} ${orderNumClean.slice(4, 8)}`;

  const handleCopyVA = () => {
    navigator.clipboard.writeText(vaNumber.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulate = async (scenario: 'success' | 'failed' | 'cancel') => {
    if (!token) return;

    setSimulationState('processing');
    setFeedbackMessage(null);

    // Artificial delay for realistic gateway feedback
    await new Promise((resolve) => setTimeout(resolve, 900));

    const { data, error } = await apiSimulatePayment(
      token,
      currentOrder.id,
      { scenario, method: selectedMethod },
      language,
    );

    if (error || !data) {
      setSimulationState('failed');
      const msg = Array.isArray(error?.message)
        ? error.message.join(', ')
        : error?.message || (isId ? 'Gagal memproses simulasi pembayaran.' : 'Failed to process payment simulation.');
      setFeedbackMessage(msg);
      return;
    }

    setCurrentOrder(data);

    if (scenario === 'success') {
      setSimulationState('success');
      setFeedbackMessage(
        isId
          ? 'Pembayaran berhasil dikonfirmasi secara instan oleh server atelier.'
          : 'Payment successfully verified and confirmed by the atelier server.',
      );
      if (onPaymentSuccess) onPaymentSuccess(data);
      if (onPaymentUpdated) onPaymentUpdated(data);
    } else if (scenario === 'failed') {
      setSimulationState('failed');
      setFeedbackMessage(
        isId
          ? 'Pembayaran ditolak (saldo tidak cukup atau kartu ditolak). Anda dapat mencoba kembali.'
          : 'Payment declined (insufficient balance or card rejected). You may retry.',
      );
      if (onPaymentUpdated) onPaymentUpdated(data);
    } else if (scenario === 'cancel') {
      setSimulationState('cancelled');
      setFeedbackMessage(
        isId
          ? 'Pembayaran dibatalkan. Reservasi stok telah dilepaskan kembali ke gudang.'
          : 'Payment cancelled. Reserved inventory has been released back to stock.',
      );
      if (onPaymentUpdated) onPaymentUpdated(data);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-2xl bg-charcoal border border-white/15 rounded-sm shadow-2xl overflow-hidden text-bone font-sans"
        >
          {/* Modal Top Accent Line */}
          <div className="h-1 w-full bg-gradient-to-r from-accent-lime via-emerald-400 to-accent-lime" />

          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between gap-4 bg-obsidian/40">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-accent-lime text-xs font-mono tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>NOVAÉ ATELIER PAYMENT GATEWAY</span>
                <span className="px-1.5 py-0.5 rounded bg-accent-lime/10 text-[10px] text-accent-lime border border-accent-lime/30">
                  SIMULATION
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif tracking-tight font-bold text-bone">
                {isId ? 'Selesaikan Pembayaran Pesanan' : 'Complete Order Payment'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-muted-light hover:text-bone hover:bg-white/10 rounded-sm transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Order Brief Box */}
            <div className="p-4 bg-obsidian/80 border border-white/10 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="space-y-0.5">
                <span className="text-[10px] text-muted uppercase block">
                  {isId ? 'Nomor Pesanan' : 'Order Reference'}
                </span>
                <span className="text-bone font-bold text-sm">{currentOrder.orderNumber}</span>
              </div>
              <div className="space-y-0.5 sm:text-right">
                <span className="text-[10px] text-muted uppercase block">
                  {isId ? 'Total Tagihan' : 'Authoritative Total'}
                </span>
                <span className="text-accent-lime font-bold text-base font-mono">
                  {formatIDR(currentOrder.totalIdr)}
                </span>
              </div>
            </div>

            {/* Simulation Feedback Alert if any */}
            {simulationState === 'success' && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-sm flex items-start gap-3 text-xs font-mono text-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-emerald-300 uppercase block">
                    {isId ? 'Status: PEMBAYARAN BERHASIL DIVERIFIKASI' : 'Status: PAYMENT CONFIRMED'}
                  </span>
                  <p className="text-muted-light leading-relaxed">
                    {feedbackMessage || (isId ? 'Pesanan kini beralih ke status PAID dan siap diproses atelier.' : 'Order has transitioned to PAID and is queued for atelier processing.')}
                  </p>
                </div>
              </div>
            )}

            {simulationState === 'failed' && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-sm flex items-start gap-3 text-xs font-mono text-rose-200">
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-rose-300 uppercase block">
                    {isId ? 'Status: PEMBAYARAN GAGAL / DITOLAK' : 'Status: PAYMENT DECLINED'}
                  </span>
                  <p className="text-muted-light leading-relaxed">
                    {feedbackMessage || (isId ? 'Transaksi gagal atau saldo tidak mencukupi. Pilih metode lain atau coba bayar ulang.' : 'Transaction failed or insufficient balance. Select another method or retry.')}
                  </p>
                </div>
              </div>
            )}

            {simulationState === 'cancelled' && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-sm flex items-start gap-3 text-xs font-mono text-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-amber-300 uppercase block">
                    {isId ? 'Status: PESANAN DIBATALKAN' : 'Status: ORDER CANCELLED'}
                  </span>
                  <p className="text-muted-light leading-relaxed">
                    {feedbackMessage || (isId ? 'Pesanan telah dibatalkan dan stok busana telah dikembalikan.' : 'Order has been cancelled and stock reservation released.')}
                  </p>
                </div>
              </div>
            )}

            {/* Payment Method Selector */}
            {simulationState !== 'success' && simulationState !== 'cancelled' && (
              <div className="space-y-3">
                <label className="text-xs font-mono uppercase tracking-widest text-muted-light font-semibold block">
                  {isId ? '1. Pilih Saluran Pembayaran' : '1. Select Payment Channel'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((m) => {
                    const isSelected = selectedMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethod(m.id)}
                        className={`p-3 rounded-sm border text-left flex items-start gap-3 transition-all ${
                          isSelected
                            ? 'bg-obsidian border-accent-lime text-bone shadow-md'
                            : 'bg-obsidian/40 border-white/10 text-muted-light hover:border-white/20'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">{m.icon}</div>
                        <div className="min-w-0">
                          <span className="text-xs font-mono font-bold block text-bone truncate">
                            {isId ? m.nameId : m.nameEn}
                          </span>
                          <span className="text-[10px] text-muted block mt-0.5 line-clamp-1">
                            {isId ? m.descId : m.descEn}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Channel Display & Interactive Simulator */}
            {simulationState !== 'success' && simulationState !== 'cancelled' && (
              <div className="space-y-4">
                <label className="text-xs font-mono uppercase tracking-widest text-muted-light font-semibold block">
                  {isId ? '2. Rincian & Kode Pembayaran' : '2. Payment Code & Details'}
                </label>

                {selectedMethod === 'qris' ? (
                  /* High Fidelity QRIS Simulation Box */
                  <div className="p-5 bg-obsidian border border-white/10 rounded-sm text-center space-y-4">
                    <div className="inline-block p-4 sm:p-5 bg-white text-black rounded-sm shadow-2xl relative max-w-[280px] w-full mx-auto">
                      {/* Indonesian Standard QRIS Header */}
                      <div className="flex items-center justify-between border-b-2 border-black/80 pb-2 mb-3">
                        <div className="text-left">
                          <span className="text-[13px] font-black tracking-tighter block leading-none font-sans text-rose-600">
                            QRIS
                          </span>
                          <span className="text-[7px] font-mono tracking-tight font-bold text-black uppercase block">
                            Pembayaran Digital
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] font-mono font-extrabold uppercase tracking-widest text-black/60 block">
                            GPN
                          </span>
                          <span className="text-[7px] font-mono text-black/40 block">
                            NMID: ID10202688001
                          </span>
                        </div>
                      </div>

                      {/* Merchant Details */}
                      <div className="text-center mb-2">
                        <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider block text-black">
                          NOVAÉ ATELIER
                        </span>
                        <span className="text-[8px] font-mono text-black/60 block">
                          Atelier Garments & Couture Archival
                        </span>
                      </div>

                      {/* Authentic SVG QR Code Matrix */}
                      <div className="relative p-2 bg-white border-2 border-black rounded-sm flex items-center justify-center">
                        <svg
                          viewBox="0 0 200 200"
                          className="w-44 h-44 sm:w-48 sm:h-48 text-black"
                          fill="currentColor"
                        >
                          {/* Corner Finder Patterns */}
                          {/* Top-Left */}
                          <rect x="10" y="10" width="50" height="50" rx="4" />
                          <rect x="20" y="20" width="30" height="30" fill="white" rx="2" />
                          <rect x="28" y="28" width="14" height="14" rx="2" />

                          {/* Top-Right */}
                          <rect x="140" y="10" width="50" height="50" rx="4" />
                          <rect x="150" y="20" width="30" height="30" fill="white" rx="2" />
                          <rect x="158" y="28" width="14" height="14" rx="2" />

                          {/* Bottom-Left */}
                          <rect x="10" y="140" width="50" height="50" rx="4" />
                          <rect x="20" y="150" width="30" height="30" fill="white" rx="2" />
                          <rect x="28" y="158" width="14" height="14" rx="2" />

                          {/* Alignment & Timing Data Pattern */}
                          <rect x="70" y="20" width="8" height="8" />
                          <rect x="90" y="20" width="12" height="8" />
                          <rect x="115" y="20" width="8" height="8" />
                          <rect x="70" y="40" width="16" height="8" />
                          <rect x="95" y="40" width="8" height="16" />
                          <rect x="110" y="40" width="14" height="8" />

                          {/* Center Matrix */}
                          <rect x="20" y="70" width="12" height="8" />
                          <rect x="40" y="70" width="8" height="16" />
                          <rect x="60" y="70" width="16" height="8" />
                          <rect x="85" y="65" width="30" height="30" rx="3" />
                          <rect x="90" y="70" width="20" height="20" fill="white" />
                          <rect x="94" y="74" width="12" height="12" fill="#d8ff00" />
                          <rect x="125" y="70" width="14" height="8" />
                          <rect x="150" y="70" width="8" height="14" />
                          <rect x="170" y="70" width="14" height="8" />

                          <rect x="20" y="95" width="8" height="16" />
                          <rect x="35" y="95" width="16" height="8" />
                          <rect x="60" y="90" width="14" height="16" />
                          <rect x="125" y="90" width="16" height="16" />
                          <rect x="150" y="95" width="14" height="8" />
                          <rect x="170" y="95" width="8" height="16" />

                          {/* Lower Matrix */}
                          <rect x="70" y="125" width="12" height="8" />
                          <rect x="90" y="120" width="16" height="16" />
                          <rect x="115" y="125" width="14" height="8" />
                          <rect x="70" y="150" width="16" height="8" />
                          <rect x="95" y="145" width="8" height="16" />
                          <rect x="110" y="150" width="14" height="8" />
                          <rect x="70" y="170" width="12" height="14" />
                          <rect x="90" y="170" width="16" height="8" />
                          <rect x="115" y="170" width="14" height="14" />
                          <rect x="140" y="140" width="12" height="12" />
                          <rect x="160" y="140" width="14" height="8" />
                          <rect x="140" y="160" width="8" height="16" />
                          <rect x="160" y="160" width="14" height="14" />
                        </svg>

                        {/* Center Badge */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center border-2 border-white shadow-md">
                            <span className="text-[8px] font-mono font-bold text-accent-lime">NÉ</span>
                          </div>
                        </div>
                      </div>

                      {/* Nominal Total Tagihan */}
                      <div className="mt-3 pt-2 border-t border-black/10 text-center">
                        <span className="text-[8px] font-mono uppercase tracking-widest text-black/50 block">
                          Total Pembayaran
                        </span>
                        <span className="text-sm font-mono font-extrabold text-black block tracking-tight">
                          {formatIDR(currentOrder.totalIdr)}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs font-mono text-muted space-y-1">
                      <span className="text-bone font-semibold block">
                        Pindai QRIS dengan GoPay, BCA, OVO, ShopeePay, atau Bank App
                      </span>
                      <span className="text-[11px] text-muted-light block">
                        Batas Waktu: <strong className="text-accent-lime">23:59:59</strong> • Verifikasi Otomatis
                      </span>
                    </div>
                  </div>
                ) : selectedMethod === 'credit_card' ? (
                  /* Credit Card Mock Form */
                  <div className="p-4 bg-obsidian border border-white/10 rounded-sm space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center text-[10px] text-muted uppercase">
                      <span>Simulated Visa / Mastercard</span>
                      <Lock className="w-3.5 h-3.5 text-accent-lime" />
                    </div>
                    <div className="p-3 bg-charcoal-dark border border-white/10 rounded-sm text-bone font-bold tracking-widest">
                      •••• •••• •••• 4242
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div className="p-2 bg-charcoal-dark border border-white/10 rounded-sm text-muted-light">
                        EXP: 12/28
                      </div>
                      <div className="p-2 bg-charcoal-dark border border-white/10 rounded-sm text-muted-light">
                        CVC: •••
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Virtual Account Display Box */
                  <div className="p-4 bg-obsidian border border-white/10 rounded-sm space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[10px] text-muted uppercase">
                        {isId ? 'Nomor Virtual Account' : 'Virtual Account Number'}
                      </span>
                      <span className="text-[10px] text-accent-lime flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {isId ? 'Aktif 24 Jam' : 'Active for 24h'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 p-3 bg-charcoal-dark border border-white/10 rounded-sm">
                      <span className="text-base sm:text-lg font-mono font-bold tracking-wider text-bone select-all">
                        {vaNumber}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyVA}
                        className="px-3 py-1.5 bg-white/10 hover:bg-accent-lime hover:text-obsidian rounded-sm text-xs font-mono flex items-center gap-1.5 transition-colors text-bone"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? (isId ? 'Tersalin' : 'Copied') : isId ? 'Salin' : 'Copy'}</span>
                      </button>
                    </div>

                    <p className="text-[11px] font-mono text-muted leading-relaxed">
                      {isId
                        ? 'Transfer tepat sejumlah total tagihan ke nomor Virtual Account di atas melalui m-Banking atau ATM.'
                        : 'Transfer the exact authoritative total to the Virtual Account above via Mobile Banking or ATM.'}
                    </p>
                  </div>
                )}

                {/* Simulation Trigger Bar */}
                <div className="p-4 bg-obsidian/90 border border-accent-lime/30 rounded-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-accent-lime flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{isId ? 'Panel Simulator Pembayaran' : 'Payment Simulator Panel'}</span>
                    </span>
                    <span className="text-[10px] font-mono text-muted">Portfolio Sandbox API</span>
                  </div>

                  <p className="text-[11px] font-mono text-muted-light leading-relaxed">
                    {isId
                      ? 'Pilih skenario simulasi di bawah untuk menguji respons server dan siklus status pesanan secara riil:'
                      : 'Trigger a simulated scenario below to verify server-side lifecycle updates in real-time:'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      disabled={simulationState === 'processing'}
                      onClick={() => handleSimulate('success')}
                      className="py-3 px-3 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md"
                    >
                      {simulationState === 'processing' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>{isId ? 'Simulasi: Sukses' : 'Simulate Success'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={simulationState === 'processing'}
                      onClick={() => handleSimulate('failed')}
                      className="py-3 px-3 rounded-sm bg-rose-600/80 hover:bg-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {simulationState === 'processing' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      <span>{isId ? 'Simulasi: Gagal' : 'Simulate Fail'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={simulationState === 'processing'}
                      onClick={() => handleSimulate('cancel')}
                      className="py-3 px-3 rounded-sm bg-white/10 hover:bg-white/20 text-muted-light hover:text-bone font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {simulationState === 'processing' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                      <span>{isId ? 'Simulasi: Batal' : 'Simulate Cancel'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons on terminal states */}
            {simulationState === 'success' && (
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 font-mono text-xs">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 bg-accent-lime hover:bg-bone text-obsidian font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                >
                  <span>{isId ? 'Selesai & Tutup' : 'Done & Close'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {simulationState === 'cancelled' && (
              <div className="pt-2 flex items-center justify-end font-mono text-xs">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-bone font-bold uppercase tracking-wider transition-colors"
                >
                  {isId ? 'Tutup Simulator' : 'Close Simulator'}
                </button>
              </div>
            )}
          </div>

          {/* Modal Footer Security Badge */}
          <div className="p-4 bg-obsidian border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-muted">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-lime" />
              <span>NOVAÉ 256-Bit SSL Encrypted Protocol</span>
            </div>
            <span>Atelier Vault Sandbox</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
