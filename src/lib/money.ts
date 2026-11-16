/** Format rupees with Indian digit grouping (1,00,000). */
export function formatINR(amount: number): string {
  return '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)
}
