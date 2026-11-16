/** Format rupees with Indian digit grouping (1,00,000). */
export function formatINR(amount: number): string {
  return '₹' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)
}

export const signed = (n: number, digits = 1) => `${n >= 0 ? '+' : '−'}${Math.abs(n).toFixed(digits)}%`
export const signedINR = (n: number) => `${n >= 0 ? '+' : '−'}${formatINR(Math.abs(n))}`
