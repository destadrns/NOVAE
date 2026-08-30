import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ShoppingBag,
  Users,
  BookOpen,
  Sparkles,
  Sliders,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAdminUIStore } from '@/store/useAdminUIStore';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import { useAdminTranslation } from '@/i18n/useAdminTranslation';
import {
  adminGetProducts,
  adminGetInventory,
  adminGetOrders,
} from '@/lib/api';
import { clsx } from 'clsx';

export const Sidebar: React.FC = () => {
  const {
    isSidebarCollapsed,
    toggleSidebar,
    isMobileSidebarOpen,
    closeMobileSidebar,
    badgeRefreshTrigger,
  } = useAdminUIStore();
  const { user, token, logout } = useAdminAuthStore();
  const { t } = useAdminTranslation();
  const location = useLocation();

  // Dynamic live counts from database
  const [productCount, setProductCount] = useState<number | null>(null);
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [activeOrdersCount, setActiveOrdersCount] = useState<number>(0);

  const fetchBadgeCounts = useCallback(async () => {
    if (!token) return;

    try {
      const [prodRes, invRes, ordRes] = await Promise.all([
        adminGetProducts(token, { limit: 1 }),
        adminGetInventory(token),
        adminGetOrders(token, { limit: 50 }),
      ]);

      if (prodRes.data) {
        setProductCount(prodRes.data.meta.totalItems);
      }
      if (invRes.data) {
        const alerts =
          (invRes.data.summary.lowStockCount || 0) +
          (invRes.data.summary.outOfStockCount || 0);
        setLowStockCount(alerts);
      }
      if (ordRes.data) {
        const active = ordRes.data.data.filter(
          (o) => o.status === 'pending' || o.status === 'paid' || o.status === 'processing'
        );
        setActiveOrdersCount(active.length);
      }
    } catch {
      // Fail silently
    }
  }, [token]);

  // Immediate refresh on route change or explicit mutation trigger
  useEffect(() => {
    fetchBadgeCounts();
  }, [fetchBadgeCounts, location.pathname, badgeRefreshTrigger]);

  // Background polling every 10 seconds for real-time customer activity
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBadgeCounts();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchBadgeCounts]);

  const navItems = [
    {
      label: t.nav.dashboard,
      path: '/',
      icon: LayoutDashboard,
    },
    {
      label: t.nav.products,
      path: '/products',
      icon: Package,
      badge: productCount !== null ? productCount.toString() : undefined,
    },
    {
      label: t.nav.collections,
      path: '/collections',
      icon: Layers,
    },
    {
      label: t.nav.inventory,
      path: '/inventory',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} ${t.nav.alertBadge}` : undefined,
      badgeVariant: 'amber',
    },
    {
      label: t.nav.orders,
      path: '/orders',
      icon: ShoppingBag,
      badge: activeOrdersCount > 0 ? `${activeOrdersCount} ${t.nav.activeBadge}` : undefined,
      badgeVariant: 'emerald',
    },
    {
      label: t.nav.customers,
      path: '/customers',
      icon: Users,
    },
    {
      label: t.nav.journal,
      path: '/journal',
      icon: BookOpen,
    },
    {
      label: t.nav.styleFinder,
      path: '/style-finder',
      icon: Sparkles,
    },
    {
      label: t.nav.settings,
      path: '/settings',
      icon: Sliders,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-charcoal border-r border-surface-border select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-surface-border shrink-0 bg-charcoal-dark">
        <NavLink
          to="/"
          onClick={closeMobileSidebar}
          className="flex items-center gap-2.5 group overflow-hidden"
        >
          <div className="w-8 h-8 rounded-sm bg-accent-lime text-obsidian flex items-center justify-center font-bold text-sm shrink-0 tracking-tighter shadow-[0_0_15px_rgba(216,255,0,0.2)]">
            NÉ
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-mono font-bold text-xs tracking-[0.25em] text-bone uppercase group-hover:text-accent-lime transition-colors">
                NOVAÉ
              </span>
              <span className="text-[9px] font-mono tracking-widest text-muted/70 uppercase">
                {t.nav.opsAtelier}
              </span>
            </div>
          )}
        </NavLink>

        {/* Desktop Collapse Button */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex items-center justify-center w-6 h-6 text-muted hover:text-bone hover:bg-white/5 rounded-sm transition-colors"
          title={isSidebarCollapsed ? t.nav.expandSidebar : t.nav.collapseSidebar}
          aria-label={isSidebarCollapsed ? t.nav.expandSidebar : t.nav.collapseSidebar}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        <div className="px-2 pb-2">
          {!isSidebarCollapsed && (
            <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-muted/60">
              {t.nav.opsNavigation}
            </p>
          )}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobileSidebar}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-mono transition-all duration-150 relative group',
                isActive
                  ? 'bg-white/[0.08] text-bone font-semibold border border-white/10 shadow-inner'
                  : 'text-muted hover:text-bone hover:bg-white/[0.03]'
              )}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              {/* Left Accent indicator for active state */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-accent-lime rounded-r-sm" />
              )}
              <Icon
                className={clsx(
                  'w-4 h-4 shrink-0 transition-colors',
                  isActive ? 'text-accent-lime' : 'text-muted group-hover:text-bone'
                )}
              />
              {!isSidebarCollapsed && (
                <span className="flex-1 truncate uppercase tracking-wider text-[11px]">
                  {item.label}
                </span>
              )}
              {!isSidebarCollapsed && item.badge && (
                <span
                  className={clsx(
                    'text-[9px] font-mono px-1.5 py-0.5 rounded-sm border uppercase font-semibold shrink-0',
                    item.badgeVariant === 'amber'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : item.badgeVariant === 'emerald'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-white/5 text-muted border-white/10'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Footer Profile & Quick Logout */}
      <div className="p-3 border-t border-surface-border bg-charcoal-dark shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-sm bg-surface-elevated border border-surface-border flex items-center justify-center text-muted shrink-0 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-accent-lime" />
              )}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-mono font-medium text-bone truncate">
                  {user?.name || 'Admin'}
                </span>
                <span className="text-[9px] font-mono text-muted/70 truncate uppercase">
                  {user?.role || t.nav.roleSuperAdmin}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className="text-muted hover:text-rose-400 p-1.5 rounded-sm hover:bg-rose-500/10 transition-colors shrink-0"
            title={t.nav.signOut}
            aria-label={t.nav.signOut}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={clsx(
          'hidden lg:block h-screen sticky top-0 transition-all duration-200 z-30 shrink-0',
          isSidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={closeMobileSidebar}
            aria-hidden="true"
          />
          <div className="relative w-64 max-w-[80vw] h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
