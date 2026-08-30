import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuthStore } from '@/store/useAdminAuthStore';
import { useAdminUIStore } from '@/store/useAdminUIStore';
import { useAdminTranslation } from '@/i18n/useAdminTranslation';
import { formatIDR, formatDate } from '@/lib/formatters';
import {
  adminGetCustomers,
  adminDeleteCustomer,
  BackendAdminCustomer,
} from '@/lib/api';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Users, Mail, Phone, MapPin, Sparkles, Trash2, RefreshCw, AlertCircle } from 'lucide-react';

export const CustomersListPage: React.FC = () => {
  const { token } = useAdminAuthStore();
  const { addToast } = useAdminUIStore();
  const { t, format } = useAdminTranslation();

  const [customers, setCustomers] = useState<BackendAdminCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Delete modal
  const [deleteCustomerTarget, setDeleteCustomerTarget] = useState<BackendAdminCustomer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');

    const { data, error } = await adminGetCustomers(token, {
      search: searchQuery || undefined,
    });

    setIsLoading(false);

    if (error) {
      setErrorMsg(Array.isArray(error.message) ? error.message.join(', ') : error.message);
      return;
    }

    if (data) {
      setCustomers(data.data);
    }
  }, [token, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  const confirmDeleteCustomer = async () => {
    if (!deleteCustomerTarget) return;
    setIsDeleting(true);
    const { error } = await adminDeleteCustomer(token, deleteCustomerTarget.id);
    setIsDeleting(false);

    if (error) {
      addToast({
        type: 'error',
        title: 'Gagal Menghapus Pelanggan',
        message: Array.isArray(error.message) ? error.message.join(', ') : error.message,
      });
      return;
    }

    addToast({
      type: 'success',
      title: 'Pelanggan Dihapus',
      message: `Akun pelanggan "${deleteCustomerTarget.name}" berhasil dihapus dari database.`,
    });

    setDeleteCustomerTarget(null);
    fetchCustomers();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-lg sm:text-xl font-mono uppercase tracking-widest text-bone font-bold">
            {t.customers.title}
          </h1>
          <p className="text-xs font-sans text-muted mt-1">
            {t.customers.subtitle} — {customers.length} Client Accounts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={fetchCustomers}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Segarkan Data
          </Button>
        </div>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono rounded-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-surface p-3.5 rounded-sm border border-surface-border">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t.customers.searchPlaceholder}
        />
      </div>

      {/* Customers Table */}
      {isLoading ? (
        <div className="p-12 text-center text-xs font-mono text-muted flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-accent-lime" />
          <span>Memuat data pelanggan live dari server...</span>
        </div>
      ) : customers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title={t.customers.emptyTitle}
          description={
            searchQuery
              ? `Tidak ditemukan pelanggan yang cocok dengan kata kunci "${searchQuery}".`
              : 'Belum ada akun pelanggan yang terdaftar di basis data atelier. Akun baru yang mendaftar di storefront akan otomatis muncul di sini.'
          }
          actionLabel={searchQuery ? t.customers.resetSearch : undefined}
          onAction={searchQuery ? () => setSearchQuery('') : undefined}
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>{t.customers.clientNameCol}</TableHeaderCell>
              <TableHeaderCell>{t.customers.contactCol}</TableHeaderCell>
              <TableHeaderCell>{t.customers.locationCol}</TableHeaderCell>
              <TableHeaderCell>{t.customers.styleArchetypeCol}</TableHeaderCell>
              <TableHeaderCell>{t.customers.ordersCountCol}</TableHeaderCell>
              <TableHeaderCell>{t.customers.lifetimeSpendCol}</TableHeaderCell>
              <TableHeaderCell>{t.customers.statusCol}</TableHeaderCell>
              <TableHeaderCell>{t.customers.memberSinceCol}</TableHeaderCell>
              <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((cust) => (
              <TableRow key={cust.id}>
                <TableCell className="font-mono text-xs font-semibold text-bone">
                  {cust.name}
                </TableCell>
                <TableCell>
                  <div className="text-[11px] font-mono text-bone flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-muted" />
                    <span>{cust.email}</span>
                  </div>
                  {cust.phone && cust.phone !== '—' && (
                    <div className="text-[10px] font-mono text-muted flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3 h-3 text-muted" />
                      <span>{cust.phone}</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-muted" />
                    <span>{cust.city}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-accent-lime shrink-0" />
                    <span className="font-mono text-[11px] text-bone">
                      {cust.styleArchetype}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-bone">
                  {format(t.customers.ordersUnit, { count: cust.ordersCount })}
                </TableCell>
                <TableCell className="font-mono text-xs font-bold text-bone tabular-nums">
                  {formatIDR(cust.lifetimeSpend)}
                </TableCell>
                <TableCell>
                  <Badge variant={cust.status === 'active' ? 'emerald' : 'rose'} size="sm">
                    {cust.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-[10px] text-muted">
                  {formatDate(cust.memberSince)}
                </TableCell>
                <TableCell className="text-right">
                  <button
                    type="button"
                    onClick={() => setDeleteCustomerTarget(cust)}
                    className="p-1.5 text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded-sm transition-colors"
                    title="Hapus Akun Pelanggan"
                    aria-label="Hapus Akun Pelanggan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCustomerTarget && (
        <ConfirmModal
          isOpen={Boolean(deleteCustomerTarget)}
          onClose={() => setDeleteCustomerTarget(null)}
          onConfirm={confirmDeleteCustomer}
          title="Hapus Akun Pelanggan"
          itemName={`${deleteCustomerTarget.name} (${deleteCustomerTarget.email})`}
          description="Apakah Anda yakin ingin menghapus akun pelanggan ini? Seluruh data profil, keranjang belanja, dan riwayat pelanggan ini akan dihapus secara permanen dari server."
          confirmLabel="Ya, Hapus Akun"
          cancelLabel="Batal"
          variant="danger"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};
