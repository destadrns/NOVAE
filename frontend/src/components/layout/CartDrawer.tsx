import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, CheckCircle } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useCartStore } from '@/store/useCartStore';
import { formatIDR } from '@/lib/formatters';
import { useTranslation } from '@/i18n/useTranslation';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, closeCart } = useUIStore();
  const { items, removeItem, updateQuantity, getSubtotal, clearCart } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const { t } = useTranslation();

  // Close on Escape key
  useEffect(() => {
    if (!isCartOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isCartOpen, closeCart]);

  const subtotal = getSubtotal();

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutComplete(true);
      setTimeout(() => {
        clearCart();
        setCheckoutComplete(false);
        closeCart();
      }, 2500);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-screen max-w-full sm:max-w-md bg-charcoal-dark border-l border-white/10 text-bone shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-5 sm:p-7 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-accent-lime" />
                  <h2 className="text-xs sm:text-sm uppercase tracking-[0.25em] font-semibold text-bone">
                    {t.cart.title} ({items.reduce((s, i) => s + i.quantity, 0)})
                  </h2>
                </div>
                <button
                  onClick={closeCart}
                  className="p-2 text-muted hover:text-bone transition-colors rounded-full hover:bg-white/5 active:scale-95"
                  aria-label="Close Bag Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
                {checkoutComplete ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4"
                  >
                    <CheckCircle className="w-14 h-14 text-accent-lime animate-bounce" />
                    <h3 className="text-xl font-display font-bold">{t.cart.orderConfirmed}</h3>
                    <p className="text-xs sm:text-sm text-muted max-w-xs leading-relaxed">
                      {t.cart.orderConfirmedDesc}
                    </p>
                  </motion.div>
                ) : items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-muted">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-display font-semibold tracking-wider">{t.cart.emptyTitle}</h3>
                    <p className="text-xs text-muted max-w-xs leading-relaxed">
                      {t.cart.emptyDesc}
                    </p>
                    <button
                      onClick={closeCart}
                      className="mt-4 text-xs tracking-widest uppercase font-semibold text-accent-lime border-b border-accent-lime pb-1 hover:text-bone hover:border-bone transition-colors"
                    >
                      {t.cart.exploreBtn}
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 pb-6 border-b border-white/5 last:border-0 group"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-20 h-26 sm:w-24 sm:h-32 bg-obsidian shrink-0 overflow-hidden relative border border-white/10">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="text-xs font-semibold tracking-wider font-display line-clamp-2">
                              {item.product.name}
                            </h4>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-muted hover:text-red-400 transition-colors p-1.5 active:scale-90"
                              aria-label={t.cart.removeItem}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex gap-2.5 text-[10px] sm:text-[11px] text-muted tracking-wider mt-1.5 uppercase">
                            <span>{item.selectedColor}</span>
                            <span>•</span>
                            <span>{t.cart.size} {item.selectedSize}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity selector */}
                          <div className="flex items-center border border-white/15 bg-black/50 rounded-sm">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-muted hover:text-bone transition-colors active:scale-95"
                              aria-label={t.cart.decreaseQty}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-muted hover:text-bone transition-colors active:scale-95"
                              aria-label={t.cart.increaseQty}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Price */}
                          <span className="text-xs sm:text-sm font-semibold tracking-wider text-bone font-sans">
                            {formatIDR(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer / Subtotal & Checkout */}
              {items.length > 0 && !checkoutComplete && (
                <div className="p-5 sm:p-7 bg-charcoal border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between text-xs tracking-widest text-muted uppercase">
                    <span>{t.cart.subtotal}</span>
                    <span className="text-sm font-bold text-bone">{formatIDR(subtotal)}</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-muted-dark">
                    {t.cart.freeShippingNote}
                  </p>

                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full py-3.5 sm:py-4 bg-bone text-obsidian font-bold text-xs uppercase tracking-[0.16em] sm:tracking-[0.25em] flex items-center justify-center gap-2.5 sm:gap-3 hover:bg-accent-lime transition-all duration-300 disabled:opacity-50 active:scale-[0.99] text-center whitespace-nowrap"
                  >
                    {isCheckingOut ? (
                      <span className="inline-block animate-pulse">{t.cart.processingBtn}</span>
                    ) : (
                      <>
                        <span>{t.cart.checkoutBtn}</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
