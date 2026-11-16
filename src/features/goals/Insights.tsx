import { motion } from 'framer-motion'
import { formatINR } from '../../lib/money'
import { useActiveChild, useStore } from '../../store'
import { ChildHeader } from './ChildHeader'
import { useSpendInsights } from './spendInsights'

export function Insights() {
  const child = useActiveChild()
  const txns = useStore((s) => s.transactions)
  const insights = useSpendInsights(child?.id ?? '')
  if (!child) return null
  const top = insights.cats[0]
  const recent = txns.filter((t) => t.childId === child.id && t.kind === 'spend').sort((a, b) => b.day - a.day).slice(0, 6)
  return (
    <div className="flex min-h-full flex-col">
      <ChildHeader title="Where did my money go?" />
      <main className="flex flex-col gap-[var(--gap)] px-5 pb-8 pt-3">
        {top ? (
          <>
            <p className="t-body">
              In the last 30 days you spent <b className="t-money">{formatINR(insights.total)}</b>. {top.category} was the biggest at {Math.round((top.amount / insights.total) * 100)}%.
            </p>
            <ul className="sticker flex flex-col gap-3 p-4">
              {insights.cats.map((c) => (
                <li key={c.category}>
                  <div className="flex justify-between"><span className="font-bold">{c.category}</span><span className="t-money">{formatINR(c.amount)}</span></div>
                  <span className="mt-1 block h-3 overflow-hidden rounded-full bg-ink/10">
                    <motion.span className="block h-full origin-left rounded-full bg-plum" initial={{ scaleX: 0 }} animate={{ scaleX: c.amount / top.amount }} transition={{ duration: 0.8 }} />
                  </span>
                </li>
              ))}
            </ul>
            <h2 className="t-title">Recent spends</h2>
            <ul className="sticker divide-y divide-ink/10 px-4">
              {recent.map((t) => (
                <li key={t.id} className="flex min-h-12 items-center justify-between gap-3 py-2">
                  <span>{t.label}<span className="t-caption block text-ink-soft">{t.category} · {Math.abs(t.day)} days ago</span></span>
                  <span className="t-money font-bold">{formatINR(-t.amount)}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="t-body text-ink-soft">Nothing spent yet. Your spending shows up here.</p>
        )}
      </main>
    </div>
  )
}
