import { Navigate, useNavigate } from 'react-router-dom'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { Button } from '../../components/ui/Button'
import { ProgressRing } from '../../components/ui/ProgressRing'
import { hasOwnPhone, personaIdForChild } from '../../demo/personas'
import { smartHome } from '../../demo/smartHome'
import { CHILD_APP_FULL } from '../../lib/brand'
import { nextOccurrence, ordinal } from '../../lib/dates'
import { formatINR, signed } from '../../lib/money'
import { currentGoalOf, useStore } from '../../store'
import { ageBandInfo } from '../../store/presets'
import { useToast } from '../../store/toast'
import type { Child, Goal, Txn } from '../../store/types'
import { fundById } from '../invest/funds'
import { simStats } from '../invest/portfolio'

const jarMeta = [
  { k: 'spend', label: 'Spend', dot: 'bg-tomato' },
  { k: 'save', label: 'Save', dot: 'bg-leaf' },
  { k: 'share', label: 'Share', dot: 'bg-sky' },
] as const

const when = (day: number, today: number) => {
  const d = day - today
  return d === 0 ? 'today' : d === -1 ? 'yesterday' : `${-d} days ago`
}

/**
 * Priya's home: one page for the whole family. Overview first, then what needs her, then each child in
 * enough detail to see how they're doing. Children on her phone open their own page from here.
 */
export function ParentHome() {
  const navigate = useNavigate()
  const s = useStore()
  const { children, guardian, kycStatus, requests, pocketMoneyLate, sips, goals, transactions, sims, demoDayOffset } = s
  const toast = useToast((t) => t.show)
  if (children.length === 0) return <Navigate to="/p/add-child" replace />

  const pending = requests.filter((r) => r.status === 'pending')
  const total = children.reduce((n, c) => n + c.jars.spend + c.jars.save + c.jars.share, 0)
  const monthly = children.reduce((n, c) => n + (c.pocketMoney?.mandate === 'active' ? c.pocketMoney.amount : 0), 0)
  const sipMonthly = sips.reduce((n, x) => n + x.amount, 0)
  const first = guardian.name.split(' ')[0] || 'there'

  const switchTo = (c: Child) => {
    const id = personaIdForChild(c)
    s.setPersona(id)
    navigate(smartHome(id), { replace: true })
  }
  // Children on this phone open their page. Own-phone children have their own device, so the strip just scrolls to them.
  const open = (c: Child) => (hasOwnPhone(c) ? document.getElementById(`kid-${c.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) : switchTo(c))

  const attention: { text: string; action?: string; onAction?: () => void }[] = []
  if (kycStatus !== 'verified')
    attention.push({ text: kycStatus === 'pending' ? 'KYC under review. Real investing is locked until it clears.' : "KYC couldn't be verified. Real investing is locked.", action: 'Fix', onAction: () => navigate('/p/kyc') })
  if (pocketMoneyLate)
    attention.push({
      text: "This month's pocket money didn't go through. Your UPI AutoPay needs a retry.",
      action: 'Retry now',
      onAction: () => children.filter((c) => c.pocketMoney?.mandate === 'active').forEach((c) => s.receivePocketMoney(c.id)),
    })
  children.forEach((c) => {
    if (c.controls.isDefault) attention.push({ text: `${c.name} is on safe defaults. Review controls.`, action: 'Review', onAction: () => { useStore.setState({ draftChildId: c.id }); navigate('/p/controls') } })
    if (!c.pocketMoney) attention.push({ text: `${c.name} has no pocket money set up.`, action: 'Set up', onAction: () => { useStore.setState({ draftChildId: c.id }); navigate('/p/pocket-money') } })
  })

  return (
    <main className="flex flex-col gap-[var(--gap)] p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="t-caption font-bold uppercase tracking-wide text-ink-soft">{CHILD_APP_FULL}</p>
          <h1 className="t-display">Namaste, {first} <span aria-hidden>🙏</span></h1>
          <p className="t-body text-ink-soft">Here's how your family is doing.</p>
        </div>
        <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full bg-saffron text-xl font-bold">{first[0]}</span>
      </header>

      <nav aria-label="Open a child's page" className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
        {children.map((c) => {
          const n = pending.filter((r) => r.childId === c.id).length
          return (
            <button key={c.id} onClick={() => open(c)} className="relative flex min-h-[92px] w-[88px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl bg-white px-2 py-2 shadow-sm">
              <span aria-hidden className="text-4xl">{c.avatar ?? ageBandInfo[c.ageBand].emoji}</span>
              <span className="t-caption font-bold">{c.name}</span>
              {n > 0 && <span aria-label={`${n} waiting`} className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-tomato-ink text-sm font-bold text-white">{n}</span>}
            </button>
          )
        })}
        <button onClick={() => navigate('/p/add-child?second=1')} className="flex min-h-[92px] w-[88px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-ink/30 px-2 py-2">
          <span aria-hidden className="text-3xl">＋</span>
          <span className="t-caption font-bold">Add child</span>
        </button>
      </nav>

      <section aria-label="Family overview" className="grid grid-cols-2 gap-3">
        <div className="sticker p-3">
          <p className="t-caption text-ink-soft">In their jars</p>
          <p className="t-title t-money"><AnimatedNumber value={total} /></p>
        </div>
        <div className="sticker p-3">
          <p className="t-caption text-ink-soft">Pocket money a month</p>
          <p className="t-title t-money">{formatINR(monthly)}</p>
        </div>
        <button onClick={() => navigate('/p/approvals')} className={`sticker p-3 text-left ${pending.length > 0 ? '!bg-saffron/30' : ''}`}>
          <p className="t-caption text-ink-soft">Waiting for you</p>
          <p className="t-title">{pending.length === 0 ? 'All clear' : `${pending.length} ${pending.length === 1 ? 'request' : 'requests'}`}</p>
        </button>
        <div className="sticker p-3">
          <p className="t-caption text-ink-soft">Real investing</p>
          <p className="t-title t-money">{kycStatus !== 'verified' ? 'Locked' : sipMonthly > 0 ? `${formatINR(sipMonthly)}/mo` : 'No SIPs yet'}</p>
        </div>
      </section>

      {attention.length > 0 && (
        <section aria-label="Needs your attention" className="flex flex-col gap-2">
          <h2 className="t-title">Needs your attention</h2>
          {attention.map((a) => (
            <div key={a.text} className="sticker flex items-center gap-3 !bg-saffron/20 p-3">
              <p className="t-body flex-1">{a.text}</p>
              {a.action && <Button variant="secondary" onClick={a.onAction} className="!px-3">{a.action}</Button>}
            </div>
          ))}
        </section>
      )}

      <section aria-label="Your children" className="flex flex-col gap-4">
        <h2 className="t-title">Your children</h2>
        {children.map((c) => {
          const goal = currentGoalOf(goals, c.id)
          const recent = transactions.filter((t) => t.childId === c.id).slice(-2).reverse()
          const waiting = pending.filter((r) => r.childId === c.id).length
          const sip = sips.find((x) => x.childId === c.id)
          const sim = sims[c.id]
          const stats = sim && sim.trades.length > 0 ? simStats(sim) : null
          return (
            <KidCard
              key={c.id}
              child={c}
              goal={goal}
              recent={recent}
              today={demoDayOffset}
              waiting={waiting}
              sipText={sip ? `SIP ${formatINR(sip.amount)}/month in ${fundById(sip.fundId)?.name}` : null}
              practice={stats ? `Practice portfolio ${formatINR(Math.round(stats.value))} (${signed(stats.returnPct)}, index ${signed(stats.indexReturnPct)})` : null}
              onOpen={() => switchTo(c)}
              onSend={() => { s.receivePocketMoney(c.id); toast(`Sent ${formatINR(c.pocketMoney?.amount ?? 0)} to ${c.name}`) }}
              onResend={() => toast(`Reminder sent to ${c.name}`)}
            />
          )
        })}
      </section>
    </main>
  )
}

function KidCard({
  child: c, goal, recent, today, waiting, sipText, practice, onOpen, onSend, onResend,
}: {
  child: Child; goal?: Goal; recent: Txn[]; today: number; waiting: number
  sipText: string | null; practice: string | null
  onOpen: () => void; onSend: () => void; onResend: () => void
}) {
  const own = hasOwnPhone(c)
  const left = goal ? Math.max(0, goal.target - c.jars.save) : 0
  const goalLine = !goal
    ? ''
    : goal.status === 'pendingParent' ? 'Waiting for you to set the price'
    : goal.status === 'awaitingApproval' ? 'Waiting for your approval'
    : goal.status === 'complete' ? 'Goal reached'
    : `${formatINR(left)} to go`
  return (
    <article id={`kid-${c.id}`} className="sticker flex scroll-mt-4 flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        <span aria-hidden className="text-4xl">{c.avatar ?? ageBandInfo[c.ageBand].emoji}</span>
        <div className="flex-1">
          <h3 className="t-title">{c.name}</h3>
          <p className="t-caption text-ink-soft">Ages {ageBandInfo[c.ageBand].label} · {own ? 'own phone' : 'uses your phone'}</p>
        </div>
        <span className={`t-caption rounded-full px-3 py-1 font-bold ${c.inviteStatus === 'accepted' ? 'bg-leaf/20 text-leaf-ink' : 'bg-saffron/30'}`}>
          {c.inviteStatus === 'accepted' ? 'Joined' : 'Invite sent'}
        </span>
      </div>

      {waiting > 0 && <p role="status" className="t-body rounded-xl bg-saffron/30 px-3 py-2 font-bold">{waiting} {waiting === 1 ? 'request is' : 'requests are'} waiting for you</p>}

      <dl className="grid grid-cols-3 gap-2" aria-label={`${c.name}'s jars`}>
        {jarMeta.map((m) => (
          <div key={m.k} className="rounded-xl bg-paper-deep px-2 py-2">
            <dt className="t-caption flex items-center gap-1 text-ink-soft"><span className={`size-3 rounded-full ${m.dot}`} />{m.label}</dt>
            <dd className="t-money font-bold">{formatINR(c.jars[m.k])}</dd>
          </div>
        ))}
      </dl>

      {goal ? (
        <div className="flex items-center gap-3">
          <ProgressRing value={goal.status === 'pendingParent' ? 0 : Math.min(1, c.jars.save / goal.target)} size={60} stroke={7}>
            <span className="text-2xl" aria-hidden>{goal.emoji}</span>
          </ProgressRing>
          <div className="flex-1">
            <p className="font-bold">Saving for {goal.title.toLowerCase()}</p>
            <p className="t-caption text-ink-soft"><span className="t-money">{formatINR(Math.min(c.jars.save, goal.target))}</span> of {formatINR(goal.target)} · {goalLine}</p>
          </div>
        </div>
      ) : practice ? (
        <p className="t-body rounded-xl bg-paper-deep px-3 py-2">{practice}</p>
      ) : (
        <p className="t-caption text-ink-soft">No savings goal yet.</p>
      )}
      {sipText && <p className="t-caption rounded-xl bg-leaf/15 px-3 py-2 font-bold">{sipText}</p>}

      {recent.length > 0 && (
        <ul aria-label="Recent activity" className="divide-y divide-ink/10 rounded-xl border border-ink/10">
          {recent.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 px-3 py-2">
              <span className="t-caption"><span className="font-bold text-ink">{t.kind === 'pocket' ? 'Pocket money' : t.label}</span><span className="block text-ink-soft">{when(t.day, today)}</span></span>
              <span className={`t-money font-bold ${t.amount >= 0 ? 'text-leaf-ink' : 'text-ink'}`}>{t.amount >= 0 ? '+' : '−'}{formatINR(Math.abs(t.amount))}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="t-caption text-ink-soft">
        {c.pocketMoney ? `${formatINR(c.pocketMoney.amount)} on the ${ordinal(c.pocketMoney.dayOfMonth)} · next ${nextOccurrence(c.pocketMoney.dayOfMonth)}` : 'No pocket money set up'} · Spend limit {formatINR(c.controls.spendLimit)}/mo ·{' '}
        {c.controls.goalPurchaseAbove === 0 ? 'you approve every goal purchase' : `you approve goals over ${formatINR(c.controls.goalPurchaseAbove)}`}
      </p>

      <div className="flex flex-col gap-2">
        {c.pocketMoney?.mandate === 'active' && (
          <Button variant="secondary" onClick={onSend}>Send {formatINR(c.pocketMoney.amount)} now</Button>
        )}
        {c.inviteStatus === 'sent' && <Button variant="secondary" onClick={onResend}>Resend invite</Button>}
        {own ? (
          <>
            <p className="t-caption text-ink-soft">{c.name} uses {CHILD_APP_FULL} on their own phone{c.phone ? ` (+91 ${c.phone.slice(0, 5)} ${c.phone.slice(5)})` : ''}.</p>
            <Button variant="ghost" onClick={onOpen}>Open on {c.name}'s phone (demo)</Button>
          </>
        ) : (
          <Button onClick={onOpen} className="!min-h-14">Open {c.name}'s page <span aria-hidden>→</span></Button>
        )}
      </div>
    </article>
  )
}
