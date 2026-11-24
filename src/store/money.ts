import type { Child, Txn } from './types'

/**
 * A child's money, in the three numbers a parent cares about. "Total" is what they had at their last pocket
 * money, counting anything since: it is what is left now plus what they have spent.
 */
export function moneySummary(child: Child, transactions: Txn[], today: number) {
  const mine = transactions.filter((t) => t.childId === child.id)
  let last = -1
  mine.forEach((t, i) => {
    if (t.kind === 'pocket') last = i
  })
  const since = mine.slice(last + 1)
  const spent = since.filter((t) => t.amount < 0).reduce((n, t) => n - t.amount, 0)
  const left = child.money.spend + child.money.save
  return {
    left,
    spent,
    total: left + spent,
    sinceDaysAgo: last >= 0 ? today - mine[last].day : null,
    recentSpends: mine.filter((t) => t.amount < 0).slice(-3).reverse(),
  }
}

/** "today", "yesterday", "6 days ago" for a demo-clock day. */
export const daysAgoText = (day: number, today: number) => {
  const d = today - day
  return d <= 0 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`
}
