import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useCartStore } from '@/store/useCartStore';
import { formatIDR } from '@/lib/formatters';
import { useTranslation } from '@/i18n/useTranslation';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, closeCart } = useUIStore();
  const { items, removeItem, updateQuantity, getSubtotal, clearCart, fetchCart } = useCartStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Body scroll lock & fetch cart on open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      fetchCart();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen, fetchCart]);

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
    closeCart();
    navigate('/checkout');
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
              <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-accent-lime" />
                  <h2 className="text-xs sm:text-sm uppercase tracking-[0.25em] font-semibold text-bone">
                    {t.cart.title} ({items.reduce((s, i) => s + i.quantity, 0)})
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {items.length > 0 && (
                    <button
                      onClick={() => clearCart()}
                      className="text-[10px] uppercase font-mono tracking-wider text-muted hover:text-rose-400 px-2 py-1 transition-colors rounded hover:bg-white/5"
                    >
                      {t.cart.clearBag}
                    </button>
                  )}
                  <button
                    onClick={closeCart}
                    className="p-2 text-muted hover:text-bone transition-colors rounded-full hover:bg-white/5 active:scale-95"
                    aria-label="Close Bag Drawer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {items.length === 0 ? (
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
                  items.map((item) => {
                    const itemName = item.productName || (item as any).product?.name;
                    const itemImg = item.imageUrl || (item as any).product?.images?.[0];
                    const itemColor = item.colorName || (item as any).selectedColor;
                    const itemSize = item.size || (item as any).selectedSize;
                    const itemPrice = item.totalPriceIdr || (item.unitPriceIdr ? item.unitPriceIdr * item.quantity : (item as any).product?.price * item.quantity);
                    const isMaxStockReached = item.availableQuantity !== undefined && item.quantity >= item.availableQuantity;

                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 pb-6 border-b border-white/5 last:border-0 group"
                      >
                        {/* Product Thumbnail */}
                        <div className="w-20 h-26 sm:w-24 sm:h-32 bg-obsidian shrink-0 overflow-hidden relative border border-white/10">
                          {itemImg && (
                            <img
                              src={itemImg}
                              alt={itemName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          )}
                        </div>

                        {/* Item Details */}
                        <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-xs font-semibold tracking-wider font-display line-clamp-2 text-bone">
                                {itemName}
                              </h4>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded p-1.5 transition-colors active:scale-90 shrink-0"
                                aria-label={t.cart.removeItem}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-muted tracking-wider mt-1.5 uppercase">
                              {item.colorCode && (
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0 inline-block"
                                  style={{ backgroundColor: item.colorCode }}
                                />
                              )}
                              <span className="truncate">{itemColor}</span>
                              <span>•</span>
                              <span>{t.cart.size} {itemSize}</span>
                            </div>
                            {item.isLowStock && (
                              <span className="text-[10px] text-amber-400 font-mono block mt-1.5 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 w-fit">
                                {t.cart.lowStockNote.replace('{stock}', String(item.availableQuantity))}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-4 gap-2">
                            {/* Quantity selector */}
                            <div className="flex items-center border border-white/15 bg-black/50 rounded-sm">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-muted hover:text-bone hover:bg-white/5 transition-colors active:scale-95"
                                aria-label={t.cart.decreaseQty}
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2.5 sm:px-3 text-xs font-mono font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={isMaxStockReached}
                                title={isMaxStockReached ? t.cart.stockLimitReached : t.cart.increaseQty}
                                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-muted hover:text-bone hover:bg-white/5 transition-colors active:scale-95 disabled:opacity-25 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                                aria-label={t.cart.increaseQty}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Price */}
                            <span className="text-xs sm:text-sm font-semibold font-mono tracking-wider text-bone shrink-0">
                              {formatIDR(itemPrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer / Subtotal & Checkout */}
              {items.length > 0 && (
                <div className="p-4 sm:p-6 bg-charcoal border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between text-xs tracking-widest text-muted uppercase font-mono">
                    <span>{t.cart.subtotal}</span>
                    <span className="text-sm font-bold font-mono text-bone">{formatIDR(subtotal)}</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-muted-dark leading-relaxed">
                    {t.cart.freeShippingNote}
                  </p>

                  <button
                    onClick={handleCheckout}
                    className="w-full py-3.5 sm:py-4 bg-bone text-obsidian font-bold text-xs uppercase tracking-[0.16em] sm:tracking-[0.25em] flex items-center justify-center gap-2.5 sm:gap-3 hover:bg-accent-lime transition-all duration-300 active:scale-[0.99] text-center whitespace-nowrap shadow-lg cursor-pointer"
                  >
                    <span>{t.cart.checkoutBtn}</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
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
