import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAdminUIStore } from '@/store/useAdminUIStore';
import { useAdminTranslation } from '@/i18n/useAdminTranslation';
import { Sliders, Save, Bell } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { addToast } = useAdminUIStore();
  const { t } = useAdminTranslation();

  const [atelierName, setAtelierName] = useState('NOVAÉ // JAKARTA ATELIER');
  const [currency, setCurrency] = useState('IDR');
  const [lowStockThreshold, setLowStockThreshold] = useState(3);
  const [autoEmailDispatch, setAutoEmailDispatch] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: t.settings.saveSuccessTitle,
      message: t.settings.saveSuccessDesc,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-lg sm:text-xl font-mono uppercase tracking-widest text-bone font-bold">
            {t.settings.title}
          </h1>
          <p className="text-xs font-sans text-muted mt-1">
            {t.settings.subtitle}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Sliders className="w-4 h-4 text-accent-lime" />
            <h3 className="font-mono text-xs font-bold text-bone uppercase tracking-wider">
              {t.settings.atelierIdentity}
            </h3>
          </div>

          <div className="space-y-3">
            <Input
              label={t.settings.operatingName}
              value={atelierName}
              onChange={(e) => setAtelierName(e.target.value)}
            />
            <Select
              label={t.settings.baseCurrency}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={[
                { value: 'IDR', label: 'Indonesian Rupiah (IDR - Rp)' },
                { value: 'USD', label: 'US Dollar (USD - $)' },
              ]}
            />
          </div>
        </Card>

        {/* Inventory & Logistics */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="font-mono text-xs font-bold text-bone uppercase tracking-wider">
              {t.settings.inventoryLogistics}
            </h3>
          </div>

          <div className="space-y-3">
            <Input
              label={t.settings.lowStockTrigger}
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(Number(e.target.value))}
              helperText={t.settings.lowStockHelper}
            />
            <div className="pt-2">
              <label className="flex items-center gap-2.5 text-xs font-mono text-bone cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoEmailDispatch}
                  onChange={(e) => setAutoEmailDispatch(e.target.checked)}
                  className="rounded-sm bg-charcoal-dark border-surface-border text-accent-lime focus:ring-accent-lime"
                />
                <span>{t.settings.autoEmailLabel}</span>
              </label>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2 flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            leftIcon={<Save className="w-4 h-4" />}
          >
            {t.settings.saveBtn}
          </Button>
        </div>
      </form>
    </div>
  );
};
