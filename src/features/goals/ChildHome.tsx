import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { Button } from '../../components/ui/Button'
import { Chiku } from '../../components/mascot/Chiku'
import { nextOccurrence } from '../../lib/dates'
import { formatINR } from '../../lib/money'
import { currentGoalOf, useActiveChild, useActivePersona, useStore } from '../../store'
import { ageBandInfo } from '../../store/presets'
import type { Child } from '../../store/types'
import { AvatarSheet } from './AvatarSheet'
import { DeviceActions } from './DeviceActions'
import { LateBanner } from './LateBanner'
import { RequestStatus } from './RequestStatus'

/**
 * One calm screen: what you have, split into the two things that matter (what you can spend now, and what
 * you've saved), then at most a few next steps. Everything else lives behind the tabs.
 */
export function ChildHome() {
  const child = useActiveChild()
  if (!child) return null
  return <Home child={child} />
}

function Home({ child }: { child: Child }) {
  const navigate = useNavigate()
  const { band } = useActivePersona()
  const kid = band === 'kid'
  const goal = useStore((s) => currentGoalOf(s.goals, child.id))
  const todo = useStore((s) => s.chores.filter((k) => k.childId === child.id && k.status === 'todo').length)
  const [picking, setPicking] = useState(false)
  const total = child.money.spend + child.money.save
  const avatar = child.avatar ?? ageBandInfo[child.ageBand].emoji

  return (
    <main className="flex flex-col gap-[var(--gap)] p-5">
      <header className="flex items-center gap-3">
        <button aria-label="Change your avatar" onClick={() => setPicking(true)} className="grid size-14 shrink-0 place-items-center rounded-full bg-saffron/40 text-3xl">
          <span aria-hidden>{avatar}</span>
        </button>
        <div className="flex-1">
          <p className="t-caption text-ink-soft">Hi {child.name}</p>
          <h1 className="t-title">{kid ? 'Here is your money' : 'Your money'}</h1>
        </div>
        {kid && <Chiku size={64} />}
      </header>

      {!child.avatar && (
        <button onClick={() => setPicking(true)} className="sticker flex min-h-14 items-center justify-between gap-3 !bg-saffron/25 px-4 text-left font-bold">
          <span>Pick your avatar</span>
          <span aria-hidden>→</span>
        </button>
      )}

      <LateBanner child={child} kid={kid} />
      <RequestStatus childId={child.id} kid={kid} />

      <section aria-label="Total money" className="sticker p-5 text-center">
        <p className="t-caption text-ink-soft">You have</p>
        <p className="t-display"><AnimatedNumber value={total} /></p>
      </section>

      <section aria-label="Where your money is" className="grid grid-cols-2 gap-3">
        <div className="sticker flex flex-col gap-1 p-4">
          <p className="t-caption flex items-center gap-1 font-bold text-ink-soft"><span aria-hidden>👛</span> Can spend</p>
          <p className="t-title t-money"><AnimatedNumber value={child.money.spend} /></p>
          <p className="t-caption text-ink-soft">Ready to use today</p>
          <Button className="mt-2 w-full" onClick={() => navigate('/c/spend')}>Spend</Button>
        </div>
        <Link to="/c/goals" className="sticker flex flex-col gap-1 p-4 no-underline">
          <p className="t-caption flex items-center gap-1 font-bold text-ink-soft"><span aria-hidden>🐷</span> Saved</p>
          <p className="t-title t-money"><AnimatedNumber value={child.money.save} /></p>
          <p className="t-caption text-ink-soft">{goal ? `For ${goal.title.toLowerCase()}` : 'Kept safe for goals'}</p>
          <span className="t-caption mt-2 font-bold underline">{goal ? 'See my goal' : 'Pick a goal'} →</span>
        </Link>
      </section>

      {child.pocketMoney && (
        <p className="t-caption text-center text-ink-soft">
          Next pocket money: <b className="t-money">{formatINR(child.pocketMoney.amount)}</b> on {nextOccurrence(child.pocketMoney.dayOfMonth)}
        </p>
      )}

      {todo > 0 && (
        <Link to="/c/tasks" className="sticker flex min-h-14 items-center justify-between gap-3 px-4 no-underline">
          <span className="font-bold"><span aria-hidden>✅ </span>{todo} {todo === 1 ? 'task' : 'tasks'} to earn money</span>
          <span aria-hidden>→</span>
        </Link>
      )}

      <Button variant="secondary" onClick={() => navigate('/c/request-money')} className="w-full">{kid ? '🙏 Ask for more money' : 'Ask for extra money'}</Button>
      {band === 'pro' && <Link to="/c/activity" className="t-caption inline-flex min-h-11 items-center justify-center font-bold underline">See all activity</Link>}

      <DeviceActions child={child} />
      <AvatarSheet child={child} open={picking} onClose={() => setPicking(false)} />
    </main>
  )
}
