import { motion } from 'framer-motion'
import { useState } from 'react'
import { AnimatedNumber } from '../../../components/ui/AnimatedNumber'
import { Button } from '../../../components/ui/Button'
import { ChoiceChips } from '../../../components/ui/ChoiceChips'
import { MilestoneTrack } from '../../../components/ui/MilestoneTrack'
import { ProgressRing } from '../../../components/ui/ProgressRing'
import { Sheet } from '../../../components/ui/Sheet'
import { Chiku } from '../../../components/mascot/Chiku'
import { formatINR } from '../../../lib/money'
import { findTemplate, goalTemplates } from '../../goals/templates'
import { splitAmount } from '../machine'
import type { UnlockDeclineReason, WireState } from '../types'
import { avatars, go, type ScreenComponent } from './shared'

const jarMeta = [
  { k: 'spend', label: 'Spend', cls: 'bg-tomato' },
  { k: 'save', label: 'Save', cls: 'bg-leaf' },
  { k: 'share', label: 'Share', cls: 'bg-sky' },
] as const

const pctOf = (s: WireState) => (s.goal ? Math.min(1, s.jars.save / s.goal.target) : 0)

function GoalRing({ s, size = 96 }: { s: WireState; size?: number }) {
  const g = s.goal!
  return (
    <ProgressRing value={s.askedParentForPrice ? 0 : pctOf(s)} size={size} stroke={9}>
      <span className="text-4xl" aria-hidden>{g.emoji}</span>
    </ProgressRing>
  )
}

export const AJoin: ScreenComponent = ({ s, act }) => (
  <div className="flex min-h-full flex-col">
    <main className="flex flex-1 flex-col items-center gap-[var(--gap)] px-5 pt-10 text-center">
      <Chiku size={112} cheer />
      <h1 className="t-display">Hi Ananya! I'm Chiku.</h1>
      <p className="t-body">Pick your buddy. You can change it later.</p>
      <div role="radiogroup" aria-label="Avatar" className="grid w-full grid-cols-3 gap-3">
        {avatars.map((a) => (
          <button key={a} role="radio" aria-checked={s.avatar === a} aria-label={`Avatar ${a}`} onClick={() => act({ type: 'SET', patch: { avatar: a } })} className={`sticker grid h-20 place-items-center text-4xl ${s.avatar === a ? '!bg-saffron/40 ring-4 ring-saffron' : ''}`}>
            <span aria-hidden>{a}</span>
          </button>
        ))}
      </div>
    </main>
    <footer className="px-5 pb-6 pt-4"><Button className="w-full" onClick={() => act(go('a-home'))}>Let's go!</Button></footer>
  </div>
)

export const AHome: ScreenComponent = ({ s, act, live }) => {
  const g = s.goal
  const total = s.jars.spend + s.jars.save + s.jars.share
  const line =
    !g ? '' : g.phase === 'unlockRequested' ? 'Waiting for Priya to say yes' : g.phase === 'completed' ? 'Goal reached. Ask for approval.' : g.phase === 'unlocked' ? 'Unlocked' : s.askedParentForPrice ? 'Priya is setting the price' : `${formatINR(Math.max(0, g.target - s.jars.save))} to go`
  const goalTo = !g ? null : g.phase === 'completed' ? 'a-complete' : g.phase === 'unlockRequested' ? 'a-wait' : g.phase === 'unlocked' || g.phase === 'declined' ? 'a-outcome' : null
  return (
    <main className="flex flex-col gap-[var(--gap)] p-5">
      <header className="flex items-start justify-between">
        <div>
          <p className="t-caption text-ink-soft">Hey Ananya</p>
          <p className="t-caption mt-1 font-bold uppercase tracking-wide text-ink-soft">My money</p>
          <h1 className="t-display"><AnimatedNumber value={total} /></h1>
          <p className="t-caption text-ink-soft">Next pocket money {formatINR(s.pocket.amount)} on 1 Dec</p>
        </div>
        <span aria-hidden className="grid size-12 place-items-center rounded-full bg-saffron/40 text-2xl">{s.avatar}</span>
      </header>
      {s.pocketLate && (
        <section role="status" className="sticker flex flex-col gap-2 !bg-saffron/25 p-3">
          <p className="t-body"><span aria-hidden>⏳ </span>Your pocket money was due on the 1st and hasn't arrived yet.</p>
          <p className="t-caption text-ink-soft">Usually it lands within a day. Priya can also retry it from the parent app.</p>
          <Button variant="secondary" onClick={() => act({ type: 'TOAST', message: 'Priya has been reminded' })}>Remind Priya</Button>
        </section>
      )}
      <section aria-label="My split" className="sticker p-4">
        <h2 className="t-title">My split</h2>
        <div className="mt-3 flex h-4 overflow-hidden rounded-full" aria-hidden>{jarMeta.map((m) => <div key={m.k} className={m.cls} style={{ width: `${s.split[m.k]}%` }} />)}</div>
        <dl className="mt-3 grid grid-cols-3 gap-2">
          {jarMeta.map((m) => (<div key={m.k}><dt className="t-caption flex items-center gap-1 text-ink-soft"><span className={`size-3 rounded-full ${m.cls}`} />{m.label} {s.split[m.k]}%</dt><dd className="t-money font-bold">{formatINR(s.jars[m.k])}</dd></div>))}
        </dl>
      </section>
      {g ? (
        <button onClick={() => goalTo && act(go(goalTo))} className="sticker flex items-center gap-4 p-4 text-left">
          <GoalRing s={s} />
          <div className="flex-1"><h3 className="t-title">{g.title}</h3><p className="t-body"><b className="t-money">{formatINR(Math.min(s.jars.save, g.target))}</b> of {formatINR(g.target)}</p><p className="t-caption mt-1 text-ink-soft">{line}</p></div>
        </button>
      ) : (
        <section className="sticker flex flex-col gap-2 p-4"><h2 className="t-title">No goal yet</h2><p className="t-body text-ink-soft">You've got {formatINR(s.jars.save)} saved. What's it for?</p><Button onClick={() => act(go('a-pick'))}>Set a goal</Button></section>
      )}
      {live && g && (g.phase === 'active' || g.phase === 'milestone') && (
        <Button variant="secondary" className="border-dashed" onClick={() => { act({ type: 'DEPOSIT', amount: s.pocket.amount }); act(go('a-arrives')) }}>▶ Demo: pocket money arrives</Button>
      )}
      <Button variant="secondary" className="w-full" onClick={() => act({ type: 'TOAST', message: 'Extra-money request opens in the app' })}>Request extra money</Button>
    </main>
  )
}

export const APick: ScreenComponent = ({ act }) => {
  const choices = goalTemplates.filter((t) => t.audience.includes('teen'))
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center px-3 pt-3"><button aria-label="Back" onClick={() => act(go('a-home'))} className="grid size-11 place-items-center rounded-full text-2xl">←</button></header>
      <main className="flex flex-col gap-[var(--gap)] px-5 pb-6 pt-2">
        <h1 className="t-display">What are you saving for?</h1>
        <ul className="grid grid-cols-2 gap-3">
          {choices.slice(0, 5).map((t) => (
            <li key={t.id}>
              <button onClick={() => act(go('a-amount', t.id))} className="sticker flex min-h-28 w-full flex-col items-center gap-1 p-3">
                <span className="text-4xl" aria-hidden>{t.emoji}</span>
                <span className="font-bold">{t.title}</span><span className="t-caption t-money text-ink-soft">{formatINR(t.price)}</span>
              </button>
            </li>
          ))}
          <li><button onClick={() => act(go('a-amount', 'custom'))} className="sticker flex min-h-28 w-full flex-col items-center justify-center gap-1 p-3"><span className="text-4xl" aria-hidden>✨</span><span className="font-bold">Something else</span></button></li>
        </ul>
      </main>
    </div>
  )
}

export const AAmount: ScreenComponent = ({ view, act }) => {
  const t = (view && view !== 'custom' ? findTemplate(view) : undefined) ?? findTemplate('headphones')!
  const [amount, setAmount] = useState(t.price)
  const create = (askParent: boolean) => {
    act({ type: 'CREATE_GOAL', templateId: t.id, title: t.title, emoji: t.emoji, target: amount, askParent })
    act(go('a-home'))
  }
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center px-3 pt-3"><button aria-label="Back" onClick={() => act(go('a-pick'))} className="grid size-11 place-items-center rounded-full text-2xl">←</button></header>
      <main className="flex flex-1 flex-col items-center gap-[var(--gap)] px-5 text-center">
        <span className="text-7xl" aria-hidden>{t.emoji}</span>
        <h1 className="t-display">{t.title}</h1>
        <div className="flex items-center gap-3">
          <button aria-label="Less 50 rupees" onClick={() => setAmount((a) => Math.max(50, a - 50))} className="sticker grid size-14 place-items-center text-3xl">−</button>
          <p className="t-display t-money min-w-36">{formatINR(amount)}</p>
          <button aria-label="More 50 rupees" onClick={() => setAmount((a) => a + 50)} className="sticker grid size-14 place-items-center text-3xl">+</button>
        </div>
        <p className="t-caption text-ink-soft">Adjust to the real price, or let Priya fill it in.</p>
      </main>
      <footer className="flex flex-col gap-2 px-5 pb-5 pt-3">
        <Button className="w-full !min-h-14" onClick={() => create(false)}>Create goal</Button>
        <Button variant="secondary" className="w-full" onClick={() => create(true)}>Ask Priya to fill it in</Button>
      </footer>
    </div>
  )
}

const nextAfterMoment = (s: WireState) => (s.goal?.phase === 'milestone' ? go('a-milestone') : s.goal?.phase === 'completed' ? go('a-complete') : go('a-home'))

export const AArrives: ScreenComponent = ({ s, act }) => {
  const parts = splitAmount(s.pocket.amount, s.split)
  return (
    <button onClick={() => act(nextAfterMoment(s))} className="flex h-full min-h-full w-full flex-col items-center justify-center gap-4 px-6 text-center" aria-label="Pocket money arrived. Tap to continue">
      <div className="flex gap-2 text-3xl" aria-hidden>🪙 🪙 🪙 🪙</div>
      <h1 className="t-display">Pocket money is here!</h1>
      <p className="t-title t-money text-leaf-ink">+{formatINR(s.pocket.amount)}</p>
      <div className="flex w-full justify-center gap-2">
        {jarMeta.map((m) => (<div key={m.k} className="sticker flex-1 p-2"><p className="t-caption font-bold">{m.label}</p><p className="t-money font-bold">+{formatINR(parts[m.k])}</p></div>))}
      </div>
      <p className="t-caption text-ink-soft">Tap to continue</p>
    </button>
  )
}

export const AMilestone: ScreenComponent = ({ s, act }) => {
  const g = s.goal
  const hit = [25, 50, 75, 100].filter((m) => pctOf(s) * 100 >= m)
  return (
    <button onClick={() => act(nextAfterMoment({ ...s, goal: g && { ...g, phase: 'active' } }))} className="flex h-full min-h-full w-full flex-col items-center justify-center gap-4 px-6 text-center" aria-label="Milestone. Tap to continue">
      <motion.span initial={false} className="text-7xl" aria-hidden>⭐</motion.span>
      <h1 className="t-display">Halfway there, Ananya!</h1>
      <p className="t-body">You're closing in on the {g?.title.toLowerCase()}!</p>
      <div className="w-full"><MilestoneTrack hit={hit} /></div>
      <p className="t-caption text-ink-soft">Tap to continue</p>
    </button>
  )
}

export const AComplete: ScreenComponent = ({ s, view, act }) => {
  const g = s.goal
  const [chip, setChip] = useState('I saved for it')
  if (!g) return null
  return (
    <div className="relative flex min-h-full flex-col">
      <main className="flex flex-1 flex-col items-center gap-[var(--gap)] px-5 pt-16 text-center">
        <span className="text-[96px]" aria-hidden>{g.emoji}</span>
        <h1 className="t-display">You did it, Ananya!</h1>
        <p className="t-body">You saved {formatINR(g.target)} for the {g.title.toLowerCase()}.</p>
      </main>
      <footer className="flex flex-col gap-2 px-5 pb-5 pt-3">
        <Button className="w-full !min-h-14" onClick={() => act(go('a-ask', 'sheet'))}>Ask Priya to buy it</Button>
        <Button variant="ghost" onClick={() => act(go('a-home'))}>Back home</Button>
      </footer>
      <Sheet open={view === 'sheet'} title="Ask to unlock" onClose={() => act(go('a-complete'))}>
        <h2 className="t-title">Ask Priya to unlock {formatINR(g.target)}?</h2>
        <p className="t-body mt-1 text-ink-soft">Your savings stay safe in your Save jar until Priya says yes. She'll see your goal and what you've saved.</p>
        <div className="my-3"><ChoiceChips label="Reason" value={chip} options={['I saved for it', 'Birthday present', 'For school'].map((v) => ({ value: v, label: v }))} onChange={setChip} /></div>
        <Button className="w-full" onClick={() => { act({ type: 'REQUEST_UNLOCK' }); act(go('a-wait')) }}>Send to Priya</Button>
        <Button variant="ghost" className="mt-1 w-full" onClick={() => act(go('a-complete'))}>Not yet</Button>
      </Sheet>
    </div>
  )
}

export const AWait: ScreenComponent = ({ s, act, live }) => {
  const g = s.goal
  if (!g) return null
  const later = s.unlock.askLater
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center px-3 pt-3"><button aria-label="Back" onClick={() => act(go('a-home'))} className="grid size-11 place-items-center rounded-full text-2xl">←</button></header>
      <main className="flex flex-1 flex-col items-center gap-[var(--gap)] px-5 pt-6 text-center">
        <GoalRing s={s} size={160} />
        <h1 className="t-display">{later ? 'Priya said ask again tomorrow' : 'Waiting for Priya'}</h1>
        <p className="t-body">{later ? "That's okay. Your money is safe in your jar." : `We asked Priya to approve the ${g.title.toLowerCase()}. You'll get a ping.`}</p>
        {!later && <p className="t-caption rounded-full bg-saffron/30 px-4 py-2 font-bold">⏳ Pending approval</p>}
      </main>
      <footer className="flex flex-col gap-2 px-5 pb-5 pt-3">
        {later ? <Button disabled className="w-full">You can ask again tomorrow</Button> : <Button variant="secondary" className="w-full" onClick={() => act({ type: 'TOAST', message: 'Nudged Priya' })}>Nudge Priya</Button>}
        {live && <Button variant="ghost" onClick={() => act({ type: 'PERSONA', to: 'priya' })}>Demo: switch to Priya's view</Button>}
      </footer>
    </div>
  )
}

const declineCopy: Record<UnlockDeclineReason, string> = {
  tooExpensive: 'Too expensive for now. Try a smaller goal first.',
  notNow: 'Not right now. You can ask again later.',
  differentGoal: 'Priya would like you to pick a different goal.',
}

export const AOutcome: ScreenComponent = ({ s, act }) => {
  const g = s.goal
  if (!g) return null
  const declined = g.phase === 'declined'
  return (
    <div className="flex min-h-full flex-col">
      <main className="flex flex-1 flex-col items-center gap-[var(--gap)] px-5 pt-16 text-center">
        <span className="text-[96px]" aria-hidden>{g.emoji}</span>
        <h1 className="t-display">{declined ? 'Priya said not yet' : 'Approved! 🎉'}</h1>
        {declined ? (
          <section className="sticker w-full p-4 text-left">
            <h2 className="t-title">Why</h2>
            <p className="t-body mt-1">{declineCopy[s.unlock.decline?.reason ?? 'notNow']}</p>
            {s.unlock.decline?.note && <p className="t-body mt-2 text-ink-soft">“{s.unlock.decline.note}”</p>}
          </section>
        ) : (
          <p className="t-body">Priya said yes to the {g.title.toLowerCase()}. Time to celebrate!</p>
        )}
      </main>
      <footer className="flex flex-col gap-2 px-5 pb-5 pt-3">
        {declined ? (
          <>
            <Button className="w-full !min-h-14" onClick={() => { act({ type: 'NEW_GOAL' }); act(go('a-pick')) }}>Change my goal</Button>
            <Button variant="secondary" className="w-full" onClick={() => { act({ type: 'REASK' }); act(go('a-wait')) }}>Ask again</Button>
          </>
        ) : (
          <Button className="w-full !min-h-14" onClick={() => { act({ type: 'NEW_GOAL' }); act(go('a-pick')) }}>Pick your next goal</Button>
        )}
        <Button variant="ghost" onClick={() => act(go('a-home'))}>Back home</Button>
      </footer>
    </div>
  )
}
