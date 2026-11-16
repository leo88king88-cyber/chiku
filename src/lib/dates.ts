/** "1 Dec" style date of the next occurrence of a day-of-month (strictly after today). */
export function nextOccurrence(dayOfMonth: number, from = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth(), dayOfMonth)
  if (d <= from) d.setMonth(d.getMonth() + 1)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
