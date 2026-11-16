import { useMemo } from 'react'
import { useStore } from '../../store'

/** Spending by category over the last 30 demo days. */
export function useSpendInsights(childId: string) {
  const txns = useStore((s) => s.transactions)
  const day = useStore((s) => s.demoDayOffset)
  return useMemo(() => {
    const spends = txns.filter((t) => t.childId === childId && t.kind === 'spend' && t.day >= day - 30)
    const byCat = new Map<string, number>()
    spends.forEach((t) => byCat.set(t.category ?? 'Other', (byCat.get(t.category ?? 'Other') ?? 0) - t.amount))
    const cats = [...byCat.entries()].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount)
    return { cats, total: cats.reduce((n, c) => n + c.amount, 0) }
  }, [txns, day, childId])
}
