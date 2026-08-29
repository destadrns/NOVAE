import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, ShoppingBag, Users, Layers, Sparkles, ArrowRight } from 'lucide-react';
import { useAdminUIStore } from '@/store/useAdminUIStore';
import { useAdminDataStore } from '@/store/useAdminDataStore';
import { useAdminTranslation } from '@/i18n/useAdminTranslation';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, closeSearch } = useAdminUIStore();
  const { products, orders, customers } = useAdminDataStore();
  const { t, format } = useAdminTranslation();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Keyboard shortcut listener: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        useAdminUIStore.getState().toggleSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isSearchOpen) return null;

  const filteredProducts = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.collection.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 4);

  const filteredOrders = orders
    .filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
        o.customerName.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 3);

  const filteredCustomers = customers
    .filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.email.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 3);

  const handleSelect = (path: string) => {
    closeSearch();
    setQuery('');
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={closeSearch}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-charcoal border border-surface-border rounded-sm shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="flex items-center px-4 border-b border-surface-border bg-charcoal-dark">
          <Search className="w-4 h-4 text-muted shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchModal.placeholder}
            className="w-full bg-transparent border-none text-bone text-xs font-mono px-3 py-3.5 focus:outline-none placeholder:text-muted/50"
          />
          <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-white/5 border border-white/10 rounded-sm text-muted">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-3 space-y-4">
          {/* Quick Navigation Sections */}
          {!query && (
            <div className="space-y-1">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted/60 px-2">
                {t.searchModal.quickNav}
              </p>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { label: t.searchModal.productsCatalog, path: '/products', icon: Package },
                  { label: t.searchModal.ordersList, path: '/orders', icon: ShoppingBag },
                  { label: t.searchModal.inventoryMatrix, path: '/inventory', icon: Layers },
                  { label: t.searchModal.styleFinderConfig, path: '/style-finder', icon: Sparkles },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleSelect(item.path)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-mono text-muted hover:text-bone hover:bg-white/5 text-left transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5 text-accent-lime" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Products Search Results */}
          {filteredProducts.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted/60 px-2">
                {format(t.searchModal.productsHeading, { count: filteredProducts.length })}
              </p>
              {filteredProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelect('/products')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-sm text-xs hover:bg-white/5 text-left transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Package className="w-3.5 h-3.5 text-muted group-hover:text-accent-lime" />
                    <span className="font-mono text-bone text-[11px] truncate">{p.name}</span>
                    <span className="text-[10px] font-mono text-muted/70 uppercase">
                      {p.collection}
                    </span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-muted group-hover:text-bone opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}

          {/* Orders Search Results */}
          {filteredOrders.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted/60 px-2">
                {format(t.searchModal.ordersHeading, { count: filteredOrders.length })}
              </p>
              {filteredOrders.map((o) => (
                <button
                  key={o.id}
                  onClick={() => handleSelect('/orders')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-sm text-xs hover:bg-white/5 text-left transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ShoppingBag className="w-3.5 h-3.5 text-muted group-hover:text-cyan-400" />
                    <span className="font-mono text-bone text-[11px] truncate">
                      {o.orderNumber}
                    </span>
                    <span className="text-[10px] text-muted truncate">({o.customerName})</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase">
                    {o.status}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Customers Search Results */}
          {filteredCustomers.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted/60 px-2">
                {format(t.searchModal.customersHeading, { count: filteredCustomers.length })}
              </p>
              {filteredCustomers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelect('/customers')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-sm text-xs hover:bg-white/5 text-left transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Users className="w-3.5 h-3.5 text-muted group-hover:text-purple-400" />
                    <span className="font-mono text-bone text-[11px] truncate">{c.name}</span>
                    <span className="text-[10px] text-muted truncate">{c.email}</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-muted group-hover:text-bone opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}

          {query &&
            filteredProducts.length === 0 &&
            filteredOrders.length === 0 &&
            filteredCustomers.length === 0 && (
              <div className="text-center py-8 text-muted text-xs font-mono">
                {format(t.searchModal.noResults, { query })}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
