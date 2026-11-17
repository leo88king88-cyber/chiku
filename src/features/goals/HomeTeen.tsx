import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { Button } from '../../components/ui/Button'
import { ChoiceChips } from '../../components/ui/ChoiceChips'
import { Sheet } from '../../components/ui/Sheet'
import { formatINR } from '../../lib/money'
import { nextOccurrence } from '../../lib/dates'
import { currentGoalOf, useStore } from '../../store'
import type { Child } from '../../store/types'
import { InvestCard } from '../invest/InvestCard'
import { DeviceActions } from './DeviceActions'
import { GoalCard } from './GoalCard'
import { LateBanner } from './LateBanner'
import { RequestStatus } from './RequestStatus'
import { useSpendInsights } from './spendInsights'

const splits = [
  { value: '50/40/10', label: '50 / 40 / 10' },
  { value: '40/50/10', label: '40 / 50 / 10' },
  { value: '30/60/10', label: '30 / 60 / 10' },
  { value: '60/30/10', label: '60 / 30 / 10' },
]
const jarMeta = [
  { k: 'spend', label: 'Spend', cls: 'bg-tomato' },
  { k: 'save', label: 'Save', cls: 'bg-leaf' },
  { k: 'share', label: 'Share', cls: 'bg-sky' },
] as const

/** 12+: cleaner layout, own split, and a "where did my money go" card. */
export function HomeTeen({ child }: { child: Child }) {
  const navigate = useNavigate()
  const goal = useStore((s) => currentGoalOf(s.goals, child.id))
  const setSplit = useStore((s) => s.setSplit)
  const insights = useSpendInsights(child.id)
  const [editing, setEditing] = useState(false)
  const { spend, save, share } = child.jars
  const key = `${child.split.spend}/${child.split.save}/${child.split.share}`
  const top = insights.cats[0]

  return (
    <main className="flex flex-col gap-[var(--gap)] p-5">
      <header>
        <p className="t-caption text-ink-soft">Hey {child.name}</p>
        <p className="t-caption mt-1 font-bold uppercase tracking-wide text-ink-soft">My money</p>
        <h1 className="t-display"><AnimatedNumber value={spend + save + share} /></h1>
        {child.pocketMoney && (
          <p className="t-caption text-ink-soft">
            Next pocket money {formatINR(child.pocketMoney.amount)} on {nextOccurrence(child.pocketMoney.dayOfMonth)}
          </p>
        )}
      </header>

      <LateBanner child={child} kid={false} />

      <section aria-label="My split" className="sticker p-4">
        <div className="flex items-center justify-between">
          <h2 className="t-title">My split</h2>
          <Button variant="ghost" onClick={() => setEditing(true)} className="!min-h-11 !px-2">Change</Button>
        </div>
        <div className="mt-3 flex h-4 overflow-hidden rounded-full" aria-hidden>
          {jarMeta.map((m) => (
            <motion.div key={m.k} className={m.cls} initial={false} animate={{ width: `${child.split[m.k]}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
          ))}
        </div>
        <dl className="mt-3 grid grid-cols-3 gap-2">
          {jarMeta.map((m) => (
            <div key={m.k}>
              <dt className="t-caption flex items-center gap-1 text-ink-soft"><span className={`size-3 rounded-full ${m.cls}`} />{m.label} {child.split[m.k]}%</dt>
              <dd className="t-money font-bold">{formatINR(child.jars[m.k])}</dd>
            </div>
          ))}
        </dl>
      </section>

      {goal ? (
        <GoalCard goal={goal} child={child} kid={false} />
      ) : (
        <section className="sticker flex flex-col gap-2 p-4">
          <h2 className="t-title">No goal yet</h2>
          <p className="t-body text-ink-soft">You've got {formatINR(save)} saved. What's it for?</p>
          <Button onClick={() => navigate('/c/goal/new')}>Set a goal</Button>
        </section>
      )}

      {child.ageBand === '15-17' && <InvestCard childId={child.id} />}

      <section aria-label="Where did my money go" className="sticker p-4">
        <h2 className="t-title">Where did my money go?</h2>
        {top ? (
          <>
            <p className="t-body mt-1">
              You spent <b className="t-money">{formatINR(insights.total)}</b> in the last 30 days. Most went on <b>{top.category.toLowerCase()}</b> ({Math.round((top.amount / insights.total) * 100)}%).
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {insights.cats.slice(0, 3).map((c) => (
                <li key={c.category} className="flex items-center gap-2">
                  <span className="t-caption w-24 shrink-0">{c.category}</span>
                  <span className="h-3 flex-1 overflow-hidden rounded-full bg-ink/10">
                    <motion.span className="block h-full origin-left rounded-full bg-plum" initial={{ scaleX: 0 }} animate={{ scaleX: c.amount / top.amount }} transition={{ duration: 0.8 }} />
                  </span>
                  <span className="t-caption t-money w-14 text-right font-bold">{formatINR(c.amount)}</span>
                </li>
              ))}
            </ul>
            <Link to="/c/insights" className="mt-2 inline-flex min-h-11 items-center font-bold underline">See everything</Link>
          </>
        ) : (
          <p className="t-body mt-1 text-ink-soft">Your spending shows up here once you start spending.</p>
        )}
      </section>

      <RequestStatus childId={child.id} kid={false} />
      <Button variant="secondary" onClick={() => navigate('/c/request-money')} className="w-full">Request extra money</Button>

      <DeviceActions child={child} />

      <Sheet open={editing} onClose={() => setEditing(false)} title="My split">
        <h2 className="t-title">Split my pocket money</h2>
        <p className="t-body mt-1 text-ink-soft">Spend / Save / Share. Applies from your next pocket money.</p>
        <div className="my-4">
          <ChoiceChips
            label="Split"
            value={key}
            options={splits}
            onChange={(v) => {
              const [spend, save, share] = v.split('/').map(Number)
              setSplit(child.id, { spend, save, share })
            }}
          />
        </div>
        <Button className="w-full" onClick={() => setEditing(false)}>Done</Button>
      </Sheet>
    </main>
  )
}
