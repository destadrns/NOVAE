/**
 * Format numerical amount to standard Indonesian Rupiah (IDR) currency format as per PRD
 * Example: 899000 -> "IDR 899.000"
 */
export function formatIDR(amount: number): string {
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(amount);

  return `IDR ${formatted}`;
}
