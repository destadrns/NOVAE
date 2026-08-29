import React, { useState } from 'react';
import { useAdminDataStore } from '@/store/useAdminDataStore';
import { useAdminTranslation } from '@/i18n/useAdminTranslation';
import { formatIDR, formatDate } from '@/lib/formatters';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Users, Mail, Phone, MapPin, Sparkles } from 'lucide-react';

export const CustomersListPage: React.FC = () => {
  const { customers } = useAdminDataStore();
  const { t, format } = useAdminTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.styleArchetype.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-lg sm:text-xl font-mono uppercase tracking-widest text-bone font-bold">
            {t.customers.title}
          </h1>
          <p className="text-xs font-sans text-muted mt-1">
            {t.customers.subtitle}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-surface p-3.5 rounded-sm border border-surface-border">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t.customers.searchPlaceholder}
        />
      </div>

      {/* Customers Table */}
      {filteredCustomers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title={t.customers.emptyTitle}
          description={t.customers.emptyDesc}
          actionLabel={t.customers.resetSearch}
          onAction={() => setSearchQuery('')}
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
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.map((cust) => (
              <TableRow key={cust.id}>
                <TableCell className="font-mono text-xs font-semibold text-bone">
                  {cust.name}
                </TableCell>
                <TableCell>
                  <div className="text-[11px] font-mono text-bone flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-muted" />
                    <span>{cust.email}</span>
                  </div>
                  <div className="text-[10px] font-mono text-muted flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3 h-3 text-muted" />
                    <span>{cust.phone}</span>
                  </div>
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
                  {format(t.customers.ordersUnit, { count: cust.totalOrders })}
                </TableCell>
                <TableCell className="font-mono text-xs font-bold text-bone tabular-nums">
                  {formatIDR(cust.totalSpent)}
                </TableCell>
                <TableCell>
                  <Badge variant="emerald" size="sm">
                    {t.status.active}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-[10px] text-muted">
                  {formatDate(cust.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
