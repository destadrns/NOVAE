import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { useUIStore } from '@/store/useUIStore';
import { formatIDR } from '@/lib/formatters';
import { PRODUCTS } from '@/data/products';
import { apiGetUserOrders, FrontendOrder } from '@/lib/api';
import {
  Mail,
  ShieldCheck,
  LogOut,
  Package,
  ArrowRight,
  Sparkles,
  Heart,
  ShoppingBag,
  Trash2,
  Clock,
  CreditCard,
  Eye,
  Truck,
  Loader2,
} from 'lucide-react';
import { SimulatedPaymentModal } from '@/components/payment/SimulatedPaymentModal';
import { CustomerOrderDetailModal } from '@/components/orders/CustomerOrderDetailModal';

export const AccountPage: React.FC = () => {
  const { user, token, signOut } = useAuthStore();
  const { language } = useLanguageStore();
  const { wishlistIds, items: wishlistItems, fetchWishlist, toggleWishlist } = useWishlistStore();
  const [orders, setOrders] = useState<FrontendOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [selectedPaymentOrder, setSelectedPaymentOrder] = useState<FrontendOrder | null>(null);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<FrontendOrder | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useUIStore((state) => state.openCart);
  const navigate = useNavigate();

  const isId = language === 'id';

  const loadUserOrders = useCallback(async () => {
    if (!token) return;
    setIsLoadingOrders(true);
    try {
      const { data } = await apiGetUserOrders(token, language);
      if (data) setOrders(data);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [token, language]);

  useEffect(() => {
    if (token) {
      fetchWishlist(token, language);
      loadUserOrders();
    }
  }, [token, language, fetchWishlist, loadUserOrders]);

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Filter orders by active tab
  const filteredOrders = orders.filter((ord) => {
    if (orderFilter === 'ALL') return true;
    if (orderFilter === 'PENDING') return ord.status === 'pending' || ord.paymentStatus === 'failed';
    if (orderFilter === 'ACTIVE') return ord.status === 'paid' || ord.status === 'processing' || ord.status === 'shipped';
    if (orderFilter === 'COMPLETED') return ord.status === 'delivered';
    if (orderFilter === 'CANCELLED') return ord.status === 'cancelled';
    return true;
  });

  // Resolve products from static mock list or API items
  const savedGarments = wishlistIds.map((id) => {
    const apiItem = wishlistItems.find((w) => w.productId === id);
    const mockItem = PRODUCTS.find((p) => p.id === id);
    return {
      id,
      name: apiItem?.name || mockItem?.name || 'NOVAÉ Garment',
      slug: apiItem?.slug || mockItem?.slug || 'product',
      price: apiItem?.basePriceIdr || mockItem?.price || 1500000,
      imageUrl: apiItem?.imageUrl || mockItem?.images?.[0] || '',
      category: apiItem?.categoryName || mockItem?.category || 'Atelier',
      isAvailable: apiItem?.isAvailable ?? (mockItem ? mockItem.stock > 0 : true),
    };
  });

  const handleQuickAdd = (garment: any) => {
    const mock = PRODUCTS.find((p) => p.id === garment.id);
    if (mock) {
      addItem(mock, undefined, undefined, 1, token);
    } else {
      addItem(garment.id, undefined, undefined, 1, token);
    }
    openCart();
  };

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-accent-lime text-xs font-mono tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isId ? 'Profil Klien Atelier' : 'Atelier Client Profile'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-bone">
            {user.fullName}
          </h1>
          <p className="text-xs font-mono text-muted-light">
            {isId ? 'ID Klien' : 'Client ID'}: <span className="text-bone">{user.id}</span>
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-sm bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-mono uppercase tracking-wider transition-colors self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>{isId ? 'Keluar' : 'Sign Out'}</span>
        </button>
      </div>

      {/* Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="p-6 bg-charcoal border border-white/10 rounded-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-lime text-obsidian flex items-center justify-center font-bold text-sm font-mono">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold uppercase text-bone">{isId ? 'Akun' : 'Account'}</h2>
              <span className="text-[10px] font-mono text-accent-lime uppercase tracking-wider">
                {user.role} Member
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-white/5 text-xs font-mono text-muted-light">
            <div className="flex items-center gap-2 text-bone">
              <Mail className="w-3.5 h-3.5 text-muted-light" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span>{isId ? 'Status' : 'Status'}:</span>
              <span className="text-bone uppercase">{user.status}</span>
            </div>
            <div className="flex justify-between">
              <span>{isId ? 'Preferensi Bahasa' : 'Language'}:</span>
              <span className="text-bone uppercase">{user.preferences?.language || language}</span>
            </div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="md:col-span-2 p-6 bg-charcoal border border-white/10 rounded-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 text-bone text-sm font-mono font-bold uppercase tracking-wider">
              <Package className="w-4 h-4 text-accent-lime" />
              <span>{isId ? 'Riwayat Pesanan' : 'Order History'}</span>
              <span className="text-xs font-normal text-muted-light">({orders.length})</span>
            </div>
            <button
              onClick={() => navigate('/shop')}
              className="text-xs font-mono text-accent-lime hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>{isId ? 'Jelajahi Koleksi' : 'Explore Catalog'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Filter Tabs */}
          {orders.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono">
              {[
                { id: 'ALL', label: isId ? 'Semua' : 'All' },
                { id: 'PENDING', label: isId ? 'Perlu Bayar' : 'Unpaid' },
                { id: 'ACTIVE', label: isId ? 'Diproses / Dikirim' : 'Active' },
                { id: 'COMPLETED', label: isId ? 'Selesai' : 'Completed' },
                { id: 'CANCELLED', label: isId ? 'Dibatalkan' : 'Cancelled' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setOrderFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-sm uppercase tracking-wider transition-colors whitespace-nowrap ${
                    orderFilter === tab.id
                      ? 'bg-accent-lime text-obsidian font-bold'
                      : 'bg-white/5 hover:bg-white/10 text-muted-light border border-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {isLoadingOrders ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 text-accent-lime animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 border border-dashed border-white/10 rounded-sm text-center space-y-2 bg-obsidian/40">
              <p className="text-xs font-mono text-muted-light">
                {isId
                  ? 'Belum ada pesanan aktif. Pesanan Anda yang telah diverifikasi akan ditampilkan di sini.'
                  : 'No active orders yet. Your confirmed atelier orders will appear here.'}
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-6 border border-dashed border-white/10 rounded-sm text-center space-y-1 bg-obsidian/40 text-xs font-mono text-muted-light">
              <p>{isId ? 'Tidak ada pesanan pada kategori ini.' : 'No orders matching this filter.'}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {filteredOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 bg-obsidian/60 border border-white/10 rounded-sm space-y-3 text-xs font-mono hover:border-white/20 transition-all"
                >
                  {/* Card Top Row: Order Number & Badges */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-bone">{ord.orderNumber}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-sm uppercase font-bold border ${
                          ord.status === 'delivered' || ord.status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : ord.status === 'cancelled'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            : 'bg-accent-lime/10 text-accent-lime border-accent-lime/30'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-muted-light">
                      <Clock className="w-3.5 h-3.5 text-muted" />
                      <span>
                        {new Date(ord.placedAt || ord.createdAt).toLocaleDateString(isId ? 'id-ID' : 'en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Card Middle Row: Items Preview & Shipment */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Item Thumbnails & Descriptions */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex -space-x-2 shrink-0">
                        {ord.items.slice(0, 3).map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="w-10 h-12 rounded-sm border border-white/10 bg-charcoal overflow-hidden shrink-0 shadow-md"
                          >
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-white/5">
                                <Package className="w-3 h-3 text-muted" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="space-y-0.5 min-w-0">
                        <div className="font-bold text-bone truncate text-xs">
                          {ord.items[0]?.productName || 'NOVAÉ Garment'}
                          {ord.items.length > 1 && (
                            <span className="text-muted-light font-normal text-[11px] ml-1">
                              (+{ord.items.length - 1} {isId ? 'lainnya' : 'more'})
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-light">
                          {ord.items.reduce((s, i) => s + i.quantity, 0)} {isId ? 'potong busana' : 'pieces total'}
                        </div>
                        {ord.shipment?.trackingNumber && (
                          <div className="text-[10px] text-cyan-400 flex items-center gap-1 pt-0.5">
                            <Truck className="w-3 h-3" />
                            <span>Resi: {ord.shipment.trackingNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Financial Total */}
                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[10px] text-muted block uppercase">{isId ? 'Total Pesanan' : 'Total Settled'}</span>
                      <span className="text-sm font-bold text-accent-lime block">{formatIDR(ord.totalIdr)}</span>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted uppercase">Pembayaran:</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-sm uppercase font-bold border ${
                          ord.paymentStatus === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : ord.paymentStatus === 'failed'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* View Details Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedDetailOrder(ord)}
                        className="px-3 py-1.5 rounded-sm bg-white/5 hover:bg-white/10 text-bone hover:text-white border border-white/10 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-muted-light" />
                        <span>{isId ? 'Detail Pesanan' : 'Order Detail'}</span>
                      </button>

                      {/* Pay / Simulate Button for Pending */}
                      {(ord.status === 'pending' || ord.paymentStatus === 'failed') && (
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentOrder(ord)}
                          className="px-3 py-1.5 rounded-sm bg-accent-lime hover:bg-accent-lime/90 text-obsidian text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{isId ? 'Bayar / Simulasi' : 'Pay / Simulate'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Wishlist Section */}
      <div className="p-6 bg-charcoal border border-white/10 rounded-sm space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-bone text-sm font-mono font-bold uppercase tracking-wider">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            <span>{isId ? 'Daftar Keinginan Saya' : 'My Saved Wishlist'}</span>
            <span className="text-xs font-normal text-muted-light">({savedGarments.length})</span>
          </div>
          {savedGarments.length > 0 && (
            <Link
              to="/shop"
              className="text-xs font-mono text-accent-lime hover:underline flex items-center gap-1"
            >
              <span>{isId ? 'Lihat Semua Busana' : 'Browse Garments'}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {savedGarments.length === 0 ? (
          <div className="py-12 border border-dashed border-white/10 rounded-sm text-center space-y-3 bg-obsidian/40">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-muted mx-auto">
              <Heart className="w-5 h-5 text-muted-light" />
            </div>
            <p className="text-xs font-mono text-muted-light max-w-sm mx-auto">
              {isId
                ? 'Daftar keinginan Anda masih kosong. Simpan busana yang Anda minati saat menjelajahi koleksi.'
                : 'Your wishlist is currently empty. Save silhouettes and garments you adore while exploring the collection.'}
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-bone hover:bg-accent-lime text-obsidian text-xs font-bold font-mono uppercase tracking-widest transition-colors"
            >
              <span>{isId ? 'Jelajahi Sekarang' : 'Explore Now'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedGarments.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-3 bg-obsidian/60 border border-white/10 rounded-sm group hover:border-white/25 transition-all"
              >
                <div className="w-16 h-20 bg-black/40 overflow-hidden relative shrink-0 border border-white/5">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <Link
                        to={`/product/${item.slug}`}
                        className="text-xs font-semibold font-display text-bone hover:text-accent-lime transition-colors line-clamp-1 truncate"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => toggleWishlist(item.id, token)}
                        className="text-muted-light hover:text-rose-400 p-1 transition-colors shrink-0"
                        title={isId ? 'Hapus dari wishlist' : 'Remove from wishlist'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[10px] font-mono text-muted uppercase block">
                      {item.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-bone block mt-1">
                      {formatIDR(item.price)}
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono uppercase ${
                        item.isAvailable ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {item.isAvailable
                        ? isId
                          ? 'Tersedia'
                          : 'In Stock'
                        : isId
                        ? 'Habis'
                        : 'Sold Out'}
                    </span>
                    {item.isAvailable && (
                      <button
                        onClick={() => handleQuickAdd(item)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-accent-lime text-bone hover:text-obsidian text-[10px] font-mono uppercase tracking-wider rounded transition-colors"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>{isId ? '+ Tas' : '+ Bag'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security & Provenance Banner */}
      <div className="p-4 bg-obsidian border border-white/5 rounded-sm flex items-center justify-between text-xs font-mono text-muted-light">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-accent-lime" />
          <span>{isId ? 'Sesi Aman Terenkripsi Supabase Auth' : 'Encrypted Supabase Auth Session'}</span>
        </div>
        <span className="text-[10px] text-muted-light/60">NOVAÉ ATELIER v1.2</span>
      </div>

      {/* Customer Order Detail Modal */}
      <CustomerOrderDetailModal
        isOpen={!!selectedDetailOrder}
        onClose={() => setSelectedDetailOrder(null)}
        order={selectedDetailOrder}
        onPaySimulate={(ord) => {
          setSelectedDetailOrder(null);
          setSelectedPaymentOrder(ord);
        }}
        isId={isId}
      />

      {/* Simulated Payment Modal */}
      <SimulatedPaymentModal
        isOpen={!!selectedPaymentOrder}
        onClose={() => setSelectedPaymentOrder(null)}
        order={selectedPaymentOrder}
        onPaymentUpdated={(updated) => {
          setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
          if (selectedDetailOrder?.id === updated.id) {
            setSelectedDetailOrder(updated);
          }
          setSelectedPaymentOrder(updated);
        }}
      />
    </div>
  );
};
