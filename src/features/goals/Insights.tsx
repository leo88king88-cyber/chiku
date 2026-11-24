import { motion } from 'framer-motion'
import { formatINR } from '../../lib/money'
import { useActiveChild, useStore } from '../../store'
import { daysAgoText } from '../../store/money'
import { useSpendInsights } from './spendInsights'

/** The Activity tab: every rupee in and out, and (once there is spending) where it went. */
export function Insights() {
  const child = useActiveChild()
  const txns = useStore((s) => s.transactions)
  const today = useStore((s) => s.demoDayOffset)
  const insights = useSpendInsights(child?.id ?? '')
  if (!child) return null
  const top = insights.cats[0]
  const all = txns.filter((t) => t.childId === child.id).slice(-15).reverse()
  return (
    <main className="flex flex-col gap-[var(--gap)] p-5">
      <header>
        <h1 className="t-display">Activity</h1>
        <p className="t-body mt-1 text-ink-soft">Money in and money out.</p>
      </header>

      {top && (
        <section aria-label="Where my money went" className="sticker flex flex-col gap-3 p-4">
          <h2 className="t-title">Where it went</h2>
          <p className="t-body">
            In the last 30 days you spent <b className="t-money">{formatINR(insights.total)}</b>. <b>{top.category}</b> was the biggest at {Math.round((top.amount / insights.total) * 100)}%.
          </p>
          <ul className="flex flex-col gap-3">
            {insights.cats.map((c) => (
              <li key={c.category}>
                <div className="flex justify-between"><span className="font-bold">{c.category}</span><span className="t-money">{formatINR(c.amount)}</span></div>
                <span className="mt-1 block h-3 overflow-hidden rounded-full bg-ink/10">
                  <motion.span className="block h-full origin-left rounded-full bg-plum" initial={{ scaleX: 0 }} animate={{ scaleX: c.amount / top.amount }} transition={{ duration: 0.8 }} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-label="All activity" className="flex flex-col gap-2">
        <h2 className="t-title">Recent</h2>
        {all.length === 0 ? (
          <p className="t-body text-ink-soft">Nothing yet. Pocket money and spending show up here.</p>
        ) : (
          <ul className="sticker divide-y divide-ink/10 px-4">
            {all.map((t) => (
              <li key={t.id} className="flex min-h-14 items-center justify-between gap-3 py-2">
                <span>
                  <span className="font-bold">{t.kind === 'pocket' ? 'Pocket money' : t.label}</span>
                  <span className="t-caption block text-ink-soft">{daysAgoText(t.day, today)}{t.category ? ` · ${t.category}` : ''}</span>
                </span>
                <span className={`t-money font-bold ${t.amount >= 0 ? 'text-leaf-ink' : ''}`}>{t.amount >= 0 ? '+' : '−'}{formatINR(Math.abs(t.amount))}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
