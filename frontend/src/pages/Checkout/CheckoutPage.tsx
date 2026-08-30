import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Truck,
  Check,
  ShoppingBag,
  AlertTriangle,
  Sparkles,
  Lock,
  Edit2,
  Package,
  Clock,
  CreditCard,
  Building2,
  QrCode,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/i18n/useTranslation';
import { formatIDR } from '@/lib/formatters';
import { apiCreateOrder, FrontendOrder } from '@/lib/api';
import { SimulatedPaymentModal } from '@/components/payment/SimulatedPaymentModal';

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  notes?: string;
  saveAddress?: boolean;
}

type ShippingMethodId = 'standard' | 'express' | 'concierge';

interface ShippingMethodOption {
  id: ShippingMethodId;
  nameKey: string;
  descKey: string;
  price: number;
  freeThreshold?: number;
  deliveryDays: string;
}

export const CheckoutPage: React.FC = () => {
  const { items, subtotalIdr, fetchCart, clearCart, isLoading: isCartLoading } = useCartStore();
  const { user, token, openAuthModal } = useAuthStore();
  const { t, language } = useTranslation();
  const navigate = useNavigate();

  // Active step: 1 = Address, 2 = Courier, 3 = Order Review
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethodId>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'bca_va' | 'mandiri_va' | 'qris' | 'credit_card' | 'manual_transfer'>('bca_va');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [reviewConfirmed, setReviewConfirmed] = useState<boolean>(false);
  const [confirmedOrder, setConfirmedOrder] = useState<FrontendOrder | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Address form state
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    street: '',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postalCode: '',
    country: 'Indonesia',
    notes: '',
    saveAddress: true,
  });

  // Fetch cart data on page load
  useEffect(() => {
    fetchCart(token, language);
  }, [fetchCart, token, language]);

  // Pre-fill user details if authenticated
  useEffect(() => {
    if (user) {
      setAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName,
        email: prev.email || user.email,
      }));
    }
  }, [user]);

  // Courier shipping options
  const shippingMethods: ShippingMethodOption[] = [
    {
      id: 'standard',
      nameKey: t.checkout.methods.standardName,
      descKey: t.checkout.methods.standardDesc,
      price: subtotalIdr >= 1500000 ? 0 : 50000,
      freeThreshold: 1500000,
      deliveryDays: '3–5 Hari Kerja',
    },
    {
      id: 'express',
      nameKey: t.checkout.methods.expressName,
      descKey: t.checkout.methods.expressDesc,
      price: 120000,
      deliveryDays: '1–2 Hari Kerja',
    },
    {
      id: 'concierge',
      nameKey: t.checkout.methods.conciergeName,
      descKey: t.checkout.methods.conciergeDesc,
      price: 250000,
      deliveryDays: 'Hari Ini (Jabodetabek)',
    },
  ];

  const selectedCourier = shippingMethods.find((m) => m.id === shippingMethod) || shippingMethods[0];
  const shippingCost = selectedCourier.price;
  const estimatedTotal = subtotalIdr + shippingCost;
  const hasUnavailableItems = items.some((i) => !i.isAvailable || i.isOutOfStock);

  // Validate step 1 address form
  const validateStep1 = (): boolean => {
    const errs: Record<string, string> = {};
    if (!address.fullName.trim()) errs.fullName = t.checkout.validation.required;
    if (!address.email.trim()) {
      errs.email = t.checkout.validation.required;
    } else if (!/\S+@\S+\.\S+/.test(address.email)) {
      errs.email = t.checkout.validation.invalidEmail;
    }
    if (!address.phone.trim()) {
      errs.phone = t.checkout.validation.required;
    } else if (address.phone.replace(/\D/g, '').length < 9) {
      errs.phone = t.checkout.validation.invalidPhone;
    }
    if (!address.street.trim()) errs.street = t.checkout.validation.required;
    if (!address.city.trim()) errs.city = t.checkout.validation.required;
    if (!address.postalCode.trim()) errs.postalCode = t.checkout.validation.required;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextToStep3 = () => {
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmOrderReview = async () => {
    const currentToken = token || useAuthStore.getState().token;
    if (!currentToken) {
      openAuthModal('signin');
      return;
    }

    setIsSubmitting(true);
    setOrderError(null);

    const { data, error } = await apiCreateOrder(
      currentToken,
      {
        shippingAddress: {
          fullName: address.fullName,
          email: address.email,
          phone: address.phone,
          street: address.street,
          city: address.city,
          province: address.province,
          postalCode: address.postalCode,
          country: address.country,
          notes: address.notes,
          saveAddress: address.saveAddress,
        },
        shippingMethod,
        paymentMethod,
        customerNotes: address.notes,
      },
      language,
    );

    setIsSubmitting(false);

    if (error || !data) {
      const errMsg = Array.isArray(error?.message)
        ? error.message.join(', ')
        : error?.message || 'Gagal memproses pesanan. Periksa ketersediaan stok atau coba lagi.';
      setOrderError(errMsg);
      return;
    }

    setConfirmedOrder(data);
    setReviewConfirmed(true);
    setIsPaymentModalOpen(true);
    clearCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Empty cart fallback
  if (!isCartLoading && items.length === 0) {
    return (
      <div className="min-h-screen bg-obsidian text-bone pt-32 pb-24 px-4 flex items-center justify-center">
        <div className="max-w-md w-full text-center space-y-6 p-8 bg-charcoal border border-white/10 rounded-sm">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-muted">
            <ShoppingBag className="w-8 h-8 text-accent-lime" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-display font-bold uppercase tracking-wider">{t.checkout.empty.title}</h2>
            <p className="text-xs text-muted leading-relaxed">{t.checkout.empty.desc}</p>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="w-full py-3.5 bg-bone hover:bg-accent-lime text-obsidian font-bold text-xs uppercase tracking-widest transition-colors"
          >
            {t.checkout.empty.exploreBtn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian text-bone pt-28 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header / Provenance Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-accent-lime text-xs font-mono tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NOVAÉ Atelier Checkout</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight uppercase">
              {t.checkout.summary.title}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted bg-white/5 px-3 py-1.5 rounded-sm border border-white/10 self-start sm:self-auto">
            <Lock className="w-3.5 h-3.5 text-accent-lime" />
            <span>256-Bit SSL Encrypted Verification</span>
          </div>
        </div>

        {/* Out of stock warning banner if any item unavailable */}
        {hasUnavailableItems && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-sm flex items-start gap-3 text-amber-200 text-xs font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">{t.checkout.validation.hasUnavailable}</span>
              <span className="text-muted-light mt-0.5 block">
                Mohon sesuaikan jumlah pesanan Anda di tas sebelum melanjutkan.
              </span>
            </div>
          </div>
        )}

        {/* Stepper Progress Indicator */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs font-mono border-b border-white/10 pb-4">
          <button
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2 py-2 text-left transition-colors border-b-2 ${
              currentStep === 1
                ? 'border-accent-lime text-accent-lime font-bold'
                : currentStep > 1
                ? 'border-white/40 text-bone hover:text-accent-lime'
                : 'border-transparent text-muted'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] shrink-0">
              {currentStep > 1 ? <Check className="w-3 h-3 text-accent-lime" /> : '1'}
            </span>
            <span className="truncate hidden sm:inline">{t.checkout.stepper.step1}</span>
            <span className="sm:hidden">01</span>
          </button>

          <button
            onClick={() => {
              if (validateStep1()) setCurrentStep(2);
            }}
            className={`flex items-center gap-2 py-2 text-left transition-colors border-b-2 ${
              currentStep === 2
                ? 'border-accent-lime text-accent-lime font-bold'
                : currentStep > 2
                ? 'border-white/40 text-bone hover:text-accent-lime'
                : 'border-transparent text-muted'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] shrink-0">
              {currentStep > 2 ? <Check className="w-3 h-3 text-accent-lime" /> : '2'}
            </span>
            <span className="truncate hidden sm:inline">{t.checkout.stepper.step2}</span>
            <span className="sm:hidden">02</span>
          </button>

          <button
            onClick={() => {
              if (validateStep1()) setCurrentStep(3);
            }}
            className={`flex items-center gap-2 py-2 text-left transition-colors border-b-2 ${
              currentStep === 3
                ? 'border-accent-lime text-accent-lime font-bold'
                : 'border-transparent text-muted'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] shrink-0">
              3
            </span>
            <span className="truncate hidden sm:inline">{t.checkout.stepper.step3}</span>
            <span className="sm:hidden">03</span>
          </button>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Multi-Step Forms & Review (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            <AnimatePresence mode="wait">
              {/* STEP 1: CONTACT & SHIPPING ADDRESS */}
              {currentStep === 1 && (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleNextToStep2}
                  className="space-y-8"
                >
                  {/* Contact Section */}
                  <div className="p-6 bg-charcoal border border-white/10 rounded-sm space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-accent-lime flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <span>{t.checkout.contact.title}</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="block text-[11px] font-mono text-muted uppercase">
                          {t.checkout.contact.fullName} *
                        </label>
                        <input
                          type="text"
                          value={address.fullName}
                          onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                          placeholder="Aria Wirasasmita"
                          className="w-full bg-obsidian/80 border border-white/15 focus:border-accent-lime focus:ring-1 focus:ring-accent-lime px-3.5 py-2.5 text-xs text-bone rounded-sm outline-none font-sans"
                        />
                        {errors.fullName && <span className="text-[10px] text-rose-400 font-mono">{errors.fullName}</span>}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono text-muted uppercase">
                          {t.checkout.contact.email} *
                        </label>
                        <input
                          type="email"
                          value={address.email}
                          onChange={(e) => setAddress({ ...address, email: e.target.value })}
                          placeholder="client@novae.atelier"
                          className="w-full bg-obsidian/80 border border-white/15 focus:border-accent-lime focus:ring-1 focus:ring-accent-lime px-3.5 py-2.5 text-xs text-bone rounded-sm outline-none font-sans"
                        />
                        {errors.email && <span className="text-[10px] text-rose-400 font-mono">{errors.email}</span>}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono text-muted uppercase">
                          {t.checkout.contact.phone} *
                        </label>
                        <input
                          type="tel"
                          value={address.phone}
                          onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                          placeholder="+62 812-3456-7890"
                          className="w-full bg-obsidian/80 border border-white/15 focus:border-accent-lime focus:ring-1 focus:ring-accent-lime px-3.5 py-2.5 text-xs text-bone rounded-sm outline-none font-sans"
                        />
                        {errors.phone && <span className="text-[10px] text-rose-400 font-mono">{errors.phone}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="p-6 bg-charcoal border border-white/10 rounded-sm space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-accent-lime flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      <span>{t.checkout.shipping.title}</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="block text-[11px] font-mono text-muted uppercase">
                          {t.checkout.shipping.street} *
                        </label>
                        <input
                          type="text"
                          value={address.street}
                          onChange={(e) => setAddress({ ...address, street: e.target.value })}
                          placeholder="Jl. Senopati No. 42, Kebayoran Baru"
                          className="w-full bg-obsidian/80 border border-white/15 focus:border-accent-lime focus:ring-1 focus:ring-accent-lime px-3.5 py-2.5 text-xs text-bone rounded-sm outline-none font-sans"
                        />
                        {errors.street && <span className="text-[10px] text-rose-400 font-mono">{errors.street}</span>}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono text-muted uppercase">
                          {t.checkout.shipping.city} *
                        </label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          placeholder="Jakarta Selatan"
                          className="w-full bg-obsidian/80 border border-white/15 focus:border-accent-lime focus:ring-1 focus:ring-accent-lime px-3.5 py-2.5 text-xs text-bone rounded-sm outline-none font-sans"
                        />
                        {errors.city && <span className="text-[10px] text-rose-400 font-mono">{errors.city}</span>}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono text-muted uppercase">
                          {t.checkout.shipping.province} *
                        </label>
                        <input
                          type="text"
                          value={address.province}
                          onChange={(e) => setAddress({ ...address, province: e.target.value })}
                          placeholder="DKI Jakarta"
                          className="w-full bg-obsidian/80 border border-white/15 focus:border-accent-lime focus:ring-1 focus:ring-accent-lime px-3.5 py-2.5 text-xs text-bone rounded-sm outline-none font-sans"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono text-muted uppercase">
                          {t.checkout.shipping.postalCode} *
                        </label>
                        <input
                          type="text"
                          value={address.postalCode}
                          onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                          placeholder="12190"
                          className="w-full bg-obsidian/80 border border-white/15 focus:border-accent-lime focus:ring-1 focus:ring-accent-lime px-3.5 py-2.5 text-xs text-bone rounded-sm outline-none font-sans"
                        />
                        {errors.postalCode && <span className="text-[10px] text-rose-400 font-mono">{errors.postalCode}</span>}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono text-muted uppercase">
                          {t.checkout.shipping.country}
                        </label>
                        <select
                          value={address.country}
                          onChange={(e) => setAddress({ ...address, country: e.target.value })}
                          className="w-full bg-obsidian/80 border border-white/15 focus:border-accent-lime focus:ring-1 focus:ring-accent-lime px-3.5 py-2.5 text-xs text-bone rounded-sm outline-none font-sans"
                        >
                          <option value="Indonesia">Indonesia</option>
                          <option value="Singapore">Singapore</option>
                          <option value="Malaysia">Malaysia</option>
                          <option value="Australia">Australia</option>
                          <option value="Japan">Japan</option>
                          <option value="United Kingdom">United Kingdom</option>
                        </select>
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <label className="block text-[11px] font-mono text-muted uppercase">
                          {t.checkout.shipping.notes}
                        </label>
                        <textarea
                          rows={2}
                          value={address.notes}
                          onChange={(e) => setAddress({ ...address, notes: e.target.value })}
                          placeholder="Instruksi khusus penjaga / drop box..."
                          className="w-full bg-obsidian/80 border border-white/15 focus:border-accent-lime focus:ring-1 focus:ring-accent-lime px-3.5 py-2 text-xs text-bone rounded-sm outline-none font-sans resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => navigate('/shop')}
                      className="text-xs font-mono uppercase tracking-wider text-muted hover:text-bone transition-colors"
                    >
                      {t.checkout.actions.backToBag}
                    </button>

                    <button
                      type="submit"
                      disabled={hasUnavailableItems}
                      className="px-8 py-4 bg-bone hover:bg-accent-lime text-obsidian font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-3 transition-colors disabled:opacity-40"
                    >
                      <span>{t.checkout.actions.continueShipping}</span>
                    </button>
                  </div>
                </motion.form>
              )}

              {/* STEP 2: SHIPPING METHOD SELECTION */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="p-6 bg-charcoal border border-white/10 rounded-sm space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-accent-lime flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      <span>{t.checkout.methods.title}</span>
                    </h3>

                    <div className="space-y-3 pt-2">
                      {shippingMethods.map((option) => (
                        <label
                          key={option.id}
                          className={`flex items-start justify-between p-4 border rounded-sm cursor-pointer transition-all ${
                            shippingMethod === option.id
                              ? 'border-accent-lime bg-accent-lime/5 shadow-sm'
                              : 'border-white/15 bg-obsidian/50 hover:border-white/30'
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            <input
                              type="radio"
                              name="shippingMethod"
                              checked={shippingMethod === option.id}
                              onChange={() => setShippingMethod(option.id)}
                              className="mt-1 accent-accent-lime cursor-pointer"
                            />
                            <div className="space-y-1">
                              <span className="text-xs font-bold font-mono tracking-wide text-bone block uppercase">
                                {option.nameKey}
                              </span>
                              <span className="text-[11px] text-muted-light block leading-relaxed">
                                {option.descKey}
                              </span>
                              <span className="text-[10px] font-mono text-muted flex items-center gap-1.5 pt-1">
                                <Clock className="w-3 h-3 text-accent-lime" />
                                <span>Estimasi: {option.deliveryDays}</span>
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0 font-mono text-xs font-bold text-bone">
                            {option.price === 0 ? (
                              <span className="text-accent-lime">{t.checkout.methods.standardFree}</span>
                            ) : (
                              <span>{formatIDR(option.price)}</span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-mono uppercase tracking-wider text-muted hover:text-bone transition-colors"
                    >
                      {t.checkout.actions.backToShipping}
                    </button>

                    <button
                      type="button"
                      onClick={handleNextToStep3}
                      className="px-8 py-4 bg-bone hover:bg-accent-lime text-obsidian font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-3 transition-colors"
                    >
                      <span>{t.checkout.actions.continueReview}</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: ORDER REVIEW */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {reviewConfirmed && confirmedOrder ? (
                    <div className="p-8 bg-charcoal border border-accent-lime/40 rounded-sm text-center space-y-6">
                      <div className="w-16 h-16 rounded-full bg-accent-lime/10 border border-accent-lime/30 text-accent-lime flex items-center justify-center mx-auto">
                        <Check className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-accent-lime uppercase tracking-widest block">
                          PESANAN BERHASIL DIBUAT
                        </span>
                        <h3 className="text-2xl font-display font-extrabold uppercase tracking-wider text-bone">
                          {confirmedOrder.orderNumber}
                        </h3>
                        <p className="text-xs font-mono text-muted-light max-w-md mx-auto leading-relaxed">
                          Pesanan Anda telah resmi diverifikasi oleh server NOVAÉ Atelier. Stok telah direservasi secara aman di database.
                        </p>
                      </div>

                      <div className="p-4 bg-obsidian border border-white/10 rounded-sm text-xs font-mono space-y-2.5 text-left">
                        <div className="flex justify-between border-b border-white/10 pb-2">
                          <span className="text-muted">Total Pembayaran:</span>
                          <span className="text-accent-lime font-bold">{formatIDR(confirmedOrder.totalIdr)}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-2 items-center">
                          <span className="text-muted">Status Pembayaran:</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase border ${
                              confirmedOrder.paymentStatus === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : confirmedOrder.paymentStatus === 'failed'
                                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {confirmedOrder.paymentStatus}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-white/10 pb-2 items-center">
                          <span className="text-muted">Status Pesanan:</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase border ${
                              confirmedOrder.status === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : confirmedOrder.status === 'cancelled'
                                ? 'bg-zinc-500/10 text-zinc-300 border-zinc-500/30'
                                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {confirmedOrder.status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">Tujuan Pengiriman:</span>
                          <span className="text-bone truncate max-w-xs">{confirmedOrder.shippingAddress?.addressLine1 || confirmedOrder.shippingAddress?.street}</span>
                        </div>
                      </div>

                      {/* Payment Simulator Trigger Button for Pending/Failed Orders */}
                      {confirmedOrder.status === 'pending' && (
                        <div className="p-4 bg-obsidian/90 border border-accent-lime/30 rounded-sm space-y-3">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-accent-lime font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <CreditCard className="w-4 h-4" />
                              <span>Simulasi Pembayaran Terbuka</span>
                            </span>
                            <span className="text-[10px] text-muted">Sandbox Mode</span>
                          </div>
                          <p className="text-[11px] font-mono text-muted-light text-left leading-relaxed">
                            Uji transaksi pembayaran sekarang dengan memilih skenario Sukses, Gagal, atau Batalkan pesanan.
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="w-full py-3 bg-accent-lime hover:bg-bone text-obsidian font-mono font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-lg"
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>BUKA SIMULATOR PEMBAYARAN →</span>
                          </button>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => navigate('/account')}
                          className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-bone font-bold text-xs font-mono uppercase tracking-widest transition-colors"
                        >
                          LIHAT DI RIWAYAT AKUN →
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate('/shop')}
                          className="w-full sm:w-auto px-6 py-3.5 bg-white/5 hover:bg-white/10 text-muted-light hover:text-bone font-mono text-xs uppercase tracking-widest transition-colors"
                        >
                          JELAJAHI KATALOG
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {orderError && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-sm flex items-start gap-3 text-rose-300 text-xs font-mono">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block">Gagal Membuat Pesanan</span>
                            <span>{orderError}</span>
                          </div>
                        </div>
                      )}

                      {/* Recipient & Destination Summary */}
                      <div className="p-6 bg-charcoal border border-white/10 rounded-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <h3 className="text-xs font-mono uppercase tracking-widest text-accent-lime flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            <span>{t.checkout.review.addressLabel}</span>
                          </h3>
                          <button
                            onClick={() => setCurrentStep(1)}
                            className="text-xs font-mono text-muted hover:text-accent-lime flex items-center gap-1 transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>{t.checkout.review.editLink}</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-muted-light">
                          <div>
                            <span className="text-muted block text-[10px] uppercase">{t.checkout.contact.fullName}</span>
                            <span className="text-bone font-bold">{address.fullName}</span>
                            <span className="block">{address.phone}</span>
                            <span className="block">{address.email}</span>
                          </div>
                          <div>
                            <span className="text-muted block text-[10px] uppercase">{t.checkout.shipping.street}</span>
                            <span className="text-bone break-words">{address.street}</span>
                            <span className="block">{address.city}, {address.province} {address.postalCode}</span>
                            <span className="block">{address.country}</span>
                          </div>
                        </div>
                      </div>

                      {/* Selected Courier Summary */}
                      <div className="p-6 bg-charcoal border border-white/10 rounded-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <h3 className="text-xs font-mono uppercase tracking-widest text-accent-lime flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{t.checkout.review.methodLabel}</span>
                          </h3>
                          <button
                            onClick={() => setCurrentStep(2)}
                            className="text-xs font-mono text-muted hover:text-accent-lime flex items-center gap-1 transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>{t.checkout.review.editLink}</span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-xs font-mono">
                          <div>
                            <span className="text-bone font-bold uppercase">{selectedCourier.nameKey}</span>
                            <span className="text-muted text-[11px] block mt-0.5">{selectedCourier.descKey}</span>
                          </div>
                          <span className="text-bone font-bold">
                            {selectedCourier.price === 0 ? t.checkout.methods.standardFree : formatIDR(selectedCourier.price)}
                          </span>
                        </div>
                      </div>

                      {/* Payment Method Selection */}
                      <div className="p-6 bg-charcoal border border-white/10 rounded-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <h3 className="text-xs font-mono uppercase tracking-widest text-accent-lime flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            <span>METODE PEMBAYARAN (SIMULASI)</span>
                          </h3>
                          <span className="text-[10px] font-mono text-muted">Sandbox API</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {[
                            {
                              id: 'bca_va' as const,
                              name: 'BCA Virtual Account',
                              desc: 'Verifikasi instan otomatis 24 jam',
                              icon: <Building2 className="w-4 h-4 text-accent-lime" />,
                            },
                            {
                              id: 'mandiri_va' as const,
                              name: 'Mandiri Virtual Account',
                              desc: 'Transfer via Livin by Mandiri & ATM',
                              icon: <Building2 className="w-4 h-4 text-cyan-400" />,
                            },
                            {
                              id: 'qris' as const,
                              name: 'QRIS / Digital Wallet',
                              desc: 'GoPay, OVO, ShopeePay, Dana, BCA',
                              icon: <QrCode className="w-4 h-4 text-emerald-400" />,
                            },
                            {
                              id: 'credit_card' as const,
                              name: 'Kartu Kredit / Debit Online',
                              desc: 'Visa, Mastercard, JCB 3D Secure',
                              icon: <CreditCard className="w-4 h-4 text-amber-400" />,
                            },
                          ].map((pm) => {
                            const isSelected = paymentMethod === pm.id;
                            return (
                              <button
                                key={pm.id}
                                type="button"
                                onClick={() => setPaymentMethod(pm.id)}
                                className={`p-3 rounded-sm border text-left flex items-start gap-3 transition-all ${
                                  isSelected
                                    ? 'bg-obsidian border-accent-lime text-bone shadow-md'
                                    : 'bg-obsidian/40 border-white/10 text-muted-light hover:border-white/20'
                                }`}
                              >
                                <div className="mt-0.5 shrink-0">{pm.icon}</div>
                                <div className="min-w-0">
                                  <span className="text-xs font-mono font-bold block text-bone truncate">
                                    {pm.name}
                                  </span>
                                  <span className="text-[10px] text-muted block mt-0.5 line-clamp-1">
                                    {pm.desc}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Packaging & Archival Certificate Guarantee */}
                      <div className="p-4 bg-obsidian border border-accent-lime/20 rounded-sm flex items-start gap-3 text-xs font-mono text-bone">
                        <ShieldCheck className="w-4 h-4 text-accent-lime shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <span className="font-bold text-accent-lime uppercase tracking-wider block">
                            NOVAÉ Atelier Archival Guarantee
                          </span>
                          <span className="text-muted-light text-[11px] leading-relaxed block">
                            {t.checkout.summary.guarantee}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between gap-4 pt-4">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="text-xs font-mono uppercase tracking-wider text-muted hover:text-bone transition-colors"
                        >
                          {t.checkout.actions.backToMethods}
                        </button>

                        <button
                          type="button"
                          onClick={handleConfirmOrderReview}
                          disabled={isSubmitting || hasUnavailableItems}
                          className="px-8 py-4 bg-accent-lime hover:bg-bone text-obsidian font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-3 transition-colors shadow-xl disabled:opacity-40"
                        >
                          {isSubmitting ? (
                            <span className="animate-pulse">MEMPROSES PESANAN...</span>
                          ) : (
                            <span>{t.checkout.actions.readyToPay}</span>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Sticky Server-Authoritative Order Summary (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            <div className="p-6 bg-charcoal border border-white/10 rounded-sm space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-bone flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-accent-lime" />
                  <span>{t.checkout.summary.title}</span>
                </h3>
                <span className="text-xs font-mono text-muted">
                  ({items.reduce((s, i) => s + i.quantity, 0)} Items)
                </span>
              </div>

              {/* Items List */}
              <div className="max-h-72 overflow-y-auto space-y-4 pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-4 border-b border-white/5 last:border-0 text-xs font-mono">
                    <div className="w-14 h-18 bg-black/40 border border-white/10 shrink-0 overflow-hidden relative">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <span className="font-display font-semibold text-bone line-clamp-1 truncate block text-xs">
                          {item.productName}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-muted tracking-wider mt-0.5 uppercase">
                          {item.colorCode && (
                            <span
                              className="w-2 h-2 rounded-full border border-white/20 shrink-0"
                              style={{ backgroundColor: item.colorCode }}
                            />
                          )}
                          <span className="truncate">{item.colorName}</span>
                          <span>•</span>
                          <span>{item.size}</span>
                          <span>•</span>
                          <span>Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-emerald-400">
                          {item.isAvailable ? '✅ Siap Kirim' : '⚠️ Stok Menipis'}
                        </span>
                        <span className="font-bold text-bone font-mono">
                          {formatIDR(item.totalPriceIdr || item.unitPriceIdr * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Free Shipping Progress */}
              {subtotalIdr < 1500000 && (
                <div className="p-3 bg-obsidian/60 border border-white/5 rounded-sm space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between text-muted">
                    <span>Gratis Ongkos Kirim</span>
                    <span>{Math.round((subtotalIdr / 1500000) * 100)}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-lime transition-all duration-500"
                      style={{ width: `${Math.min(100, (subtotalIdr / 1500000) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-light block">
                    {t.checkout.summary.freeShippingProgress.replace(
                      '{amount}',
                      formatIDR(1500000 - subtotalIdr),
                    )}
                  </span>
                </div>
              )}

              {/* Calculations */}
              <div className="space-y-3 pt-4 border-t border-white/10 text-xs font-mono">
                <div className="flex justify-between text-muted">
                  <span>{t.checkout.summary.subtotal}</span>
                  <span className="text-bone">{formatIDR(subtotalIdr)}</span>
                </div>

                <div className="flex justify-between text-muted">
                  <span>{t.checkout.summary.shippingCost}</span>
                  <span className="text-bone">
                    {shippingCost === 0 ? (
                      <span className="text-accent-lime font-bold">{t.checkout.methods.standardFree}</span>
                    ) : (
                      formatIDR(shippingCost)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-[11px] text-muted-dark">
                  <span>{t.checkout.summary.tax}</span>
                  <span>Termasuk</span>
                </div>

                <div className="flex justify-between text-sm font-bold text-bone pt-3 border-t border-white/10">
                  <span>{t.checkout.summary.total}</span>
                  <span className="text-accent-lime font-mono text-base">{formatIDR(estimatedTotal)}</span>
                </div>
              </div>
            </div>

            {/* Atelier Perks Footer */}
            <div className="p-4 bg-obsidian/40 border border-white/5 rounded-sm space-y-2 text-[11px] font-mono text-muted">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-accent-lime" />
                <span>Garansi Penukaran Ukuran 14 Hari</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-accent-lime" />
                <span>Pengiriman Berasuransi Penuh ke Seluruh Indonesia</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Payment Modal */}
      <SimulatedPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        order={confirmedOrder}
        onPaymentSuccess={(updated) => setConfirmedOrder(updated)}
        onPaymentUpdated={(updated) => setConfirmedOrder(updated)}
      />
    </div>
  );
};
