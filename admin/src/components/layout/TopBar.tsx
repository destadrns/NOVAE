import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useAdminUIStore } from '@/store/useAdminUIStore';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import { useAdminDataStore } from '@/store/useAdminDataStore';
import { useAdminTranslation } from '@/i18n/useAdminTranslation';
import { AdminLanguageSwitcher } from '@/components/ui/AdminLanguageSwitcher';

export const TopBar: React.FC = () => {
  const { openMobileSidebar, openSearch } = useAdminUIStore();
  const { user } = useAdminAuthStore();
  const { orders, inventory } = useAdminDataStore();
  const { t, format } = useAdminTranslation();
  const location = useLocation();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Generate breadcrumb title from path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const rawKey = pathSegments.length === 0 ? 'dashboard' : pathSegments[0];

  const getBreadcrumbLabel = (key: string) => {
    switch (key) {
      case 'dashboard':
        return t.nav.dashboard;
      case 'products':
        return t.nav.products;
      case 'collections':
        return t.nav.collections;
      case 'inventory':
        return t.nav.inventory;
      case 'orders':
        return t.nav.orders;
      case 'customers':
        return t.nav.customers;
      case 'journal':
        return t.nav.journal;
      case 'style-finder':
        return t.nav.styleFinder;
      case 'settings':
        return t.nav.settings;
      default:
        return key.replace('-', ' ');
    }
  };

  const pageTitle = getBreadcrumbLabel(rawKey);
  const lowStockCount = inventory.filter(
    (i) => i.status === 'LOW_STOCK' || i.status === 'OUT_OF_STOCK'
  ).length;
  const recentOrders = orders.slice(0, 3);

  return (
    <header className="h-16 border-b border-surface-border bg-charcoal/90 backdrop-blur-md sticky top-0 z-20 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 select-none">
      {/* Left Area: Mobile Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={openMobileSidebar}
          className="lg:hidden p-2 text-muted hover:text-bone hover:bg-white/5 rounded-sm transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Display */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono">
          <Link
            to="/"
            className="text-muted hover:text-bone uppercase tracking-wider transition-colors"
          >
            {t.topbar.atelier}
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-bone uppercase tracking-wider font-semibold truncate max-w-[120px] sm:max-w-none">
            {pageTitle}
          </span>
        </div>
      </div>

      {/* Center/Right Area: Language Switcher, Global Search, System Status, Notification, User */}
      <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
        {/* Language Switcher */}
        <AdminLanguageSwitcher />

        {/* Global Search Button Trigger */}
        <button
          onClick={openSearch}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-sm bg-charcoal-dark border border-surface-border hover:border-surface-border-active text-muted hover:text-bone text-xs font-mono transition-all group"
          title={t.topbar.quickFindTooltip}
        >
          <Search className="w-3.5 h-3.5 group-hover:text-accent-lime transition-colors" />
          <span className="hidden md:inline uppercase tracking-wider text-[11px]">
            {t.topbar.quickFind}
          </span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-white/5 border border-white/10 rounded-sm text-muted">
            ⌘K
          </kbd>
        </button>

        {/* Live Operational Status Pill */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-sm bg-emerald-500/5 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{t.topbar.opsActiveProd}</span>
        </div>

        {/* View Customer Storefront External Link */}
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-muted hover:text-bone hover:bg-white/5 text-xs font-mono uppercase tracking-wider transition-colors"
          title="Open Customer Storefront"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden lg:inline text-[10px]">{t.topbar.storefront}</span>
        </a>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-muted hover:text-bone hover:bg-white/5 rounded-sm transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {lowStockCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-charcoal animate-pulse" />
            )}
          </button>

          {/* Notifications Flyout */}
          {isNotificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsNotificationsOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-charcoal border border-surface-border rounded-sm shadow-2xl z-40 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-bone font-semibold">
                    {t.topbar.notifications}
                  </h4>
                  <span className="text-[10px] font-mono text-muted">
                    {format(t.topbar.alertsCount, {
                      count: recentOrders.length + (lowStockCount > 0 ? 1 : 0),
                    })}
                  </span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {lowStockCount > 0 && (
                    <div className="flex items-start gap-2.5 p-2.5 rounded-sm bg-amber-500/10 border border-amber-500/20 text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-mono text-[11px] text-amber-300 font-semibold uppercase">
                          {t.topbar.lowStockAlertTitle}
                        </p>
                        <p className="text-[11px] text-muted mt-0.5">
                          {format(t.topbar.lowStockAlertDesc, { count: lowStockCount })}
                        </p>
                      </div>
                    </div>
                  )}

                  {recentOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="flex items-start gap-2.5 p-2.5 rounded-sm bg-surface hover:bg-surface-elevated border border-surface-border text-xs transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[11px] text-bone font-semibold truncate">
                          {format(t.topbar.newOrderAlertTitle, {
                            orderNumber: ord.orderNumber,
                          })}
                        </p>
                        <p className="text-[11px] text-muted truncate">
                          {format(t.topbar.newOrderAlertDesc, {
                            name: ord.customerName,
                            count: ord.items.length,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="w-7 h-7 rounded-sm bg-surface-elevated border border-surface-border flex items-center justify-center text-muted overflow-hidden shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-accent-lime" />
            )}
          </div>
          <span className="hidden sm:inline text-xs font-mono text-bone font-medium truncate max-w-[100px] lg:max-w-[130px]">
            {user?.name || 'Admin'}
          </span>
        </div>
      </div>
    </header>
  );
};
