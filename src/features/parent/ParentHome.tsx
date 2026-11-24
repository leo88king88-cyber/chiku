import { Navigate, useNavigate } from 'react-router-dom'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { Button } from '../../components/ui/Button'
import { hasOwnPhone, personaIdForChild } from '../../demo/personas'
import { smartHome } from '../../demo/smartHome'
import { CHILD_APP_FULL } from '../../lib/brand'
import { nextOccurrence, ordinal } from '../../lib/dates'
import { formatINR } from '../../lib/money'
import { useStore } from '../../store'
import { daysAgoText, moneySummary } from '../../store/money'
import { ageBandInfo } from '../../store/presets'
import { useToast } from '../../store/toast'
import type { Child, Chore, Txn } from '../../store/types'
import { fundById } from '../invest/funds'

/**
 * Priya's home: the whole family on one page. A strip to open each child, the totals, what needs her, and
 * a card per child with three plain numbers (total, spent, left), what she pays them, and what they spent.
 */
export function ParentHome() {
  const navigate = useNavigate()
  const s = useStore()
  const { children, guardian, kycStatus, requests, pocketMoneyLate, sips, transactions, chores, demoDayOffset } = s
  const toast = useToast((t) => t.show)
  if (children.length === 0) return <Navigate to="/p/add-child" replace />

  const pending = requests.filter((r) => r.status === 'pending')
  const review = chores.filter((k) => k.status === 'review')
  const waiting = pending.length + review.length
  const todo = chores.filter((k) => k.status === 'todo').length
  const withKids = children.reduce((n, c) => n + c.money.spend + c.money.save, 0)
  const monthly = children.reduce((n, c) => n + (c.pocketMoney?.mandate === 'active' ? c.pocketMoney.amount : 0), 0)
  const first = guardian.name.split(' ')[0] || 'there'

  const switchTo = (c: Child) => {
    const id = personaIdForChild(c)
    s.setPersona(id)
    navigate(smartHome(id), { replace: true })
  }
  // Children on this phone open their page. Own-phone children have their own device, so the strip scrolls to them.
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
          const n = pending.filter((r) => r.childId === c.id).length + review.filter((k) => k.childId === c.id).length
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
          <p className="t-caption text-ink-soft">Kids have in total</p>
          <p className="t-title t-money"><AnimatedNumber value={withKids} /></p>
        </div>
        <div className="sticker p-3">
          <p className="t-caption text-ink-soft">Pocket money a month</p>
          <p className="t-title t-money">{formatINR(monthly)}</p>
        </div>
        <button onClick={() => navigate(pending.length > 0 ? '/p/approvals' : '/p/tasks')} className={`sticker p-3 text-left ${waiting > 0 ? '!bg-saffron/30' : ''}`}>
          <p className="t-caption text-ink-soft">Waiting for you</p>
          <p className="t-title">{waiting === 0 ? 'All clear' : `${waiting} ${waiting === 1 ? 'item' : 'items'}`}</p>
        </button>
        <button onClick={() => navigate('/p/tasks')} className="sticker p-3 text-left">
          <p className="t-caption text-ink-soft">Tasks you set</p>
          <p className="t-title">{todo === 0 ? 'Add a task' : `${todo} open`}</p>
        </button>
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
          const sum = moneySummary(c, transactions, demoDayOffset)
          const sip = sips.find((x) => x.childId === c.id)
          const mine = chores.filter((k) => k.childId === c.id)
          return (
            <KidCard
              key={c.id}
              child={c}
              sum={sum}
              today={demoDayOffset}
              requestsWaiting={pending.filter((r) => r.childId === c.id).length}
              tasksToDo={mine.filter((k: Chore) => k.status === 'todo').length}
              tasksToCheck={mine.filter((k: Chore) => k.status === 'review').length}
              sipText={sip ? `SIP ${formatINR(sip.amount)}/month in ${fundById(sip.fundId)?.name}` : null}
              onOpen={() => switchTo(c)}
              onSend={() => { s.receivePocketMoney(c.id); toast(`Sent ${formatINR(c.pocketMoney?.amount ?? 0)} to ${c.name}`) }}
              onResend={() => toast(`Reminder sent to ${c.name}`)}
              onTasks={() => navigate(`/p/tasks?child=${c.id}`)}
            />
          )
        })}
      </section>
    </main>
  )
}

function KidCard({
  child: c, sum, today, requestsWaiting, tasksToDo, tasksToCheck, sipText, onOpen, onSend, onResend, onTasks,
}: {
  child: Child
  sum: { left: number; spent: number; total: number; sinceDaysAgo: number | null; recentSpends: Txn[] }
  today: number
  requestsWaiting: number
  tasksToDo: number
  tasksToCheck: number
  sipText: string | null
  onOpen: () => void; onSend: () => void; onResend: () => void; onTasks: () => void
}) {
  const own = hasOwnPhone(c)
  const since = sum.sinceDaysAgo === null ? 'since they joined' : `since last pocket money (${sum.sinceDaysAgo <= 0 ? 'today' : sum.sinceDaysAgo === 1 ? 'yesterday' : `${sum.sinceDaysAgo} days ago`})`
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

      {requestsWaiting > 0 && <p role="status" className="t-body rounded-xl bg-saffron/30 px-3 py-2 font-bold">{requestsWaiting} {requestsWaiting === 1 ? 'request is' : 'requests are'} waiting for you</p>}
      {tasksToCheck > 0 && (
        <button onClick={onTasks} className="t-body min-h-11 rounded-xl bg-saffron/30 px-3 py-2 text-left font-bold">
          {tasksToCheck} {tasksToCheck === 1 ? 'task is' : 'tasks are'} waiting for you to check →
        </button>
      )}

      <div>
        <dl className="grid grid-cols-3 gap-2" aria-label={`${c.name}'s money`}>
          <div className="rounded-xl bg-paper-deep px-2 py-2"><dt className="t-caption text-ink-soft">Total</dt><dd className="t-money font-bold">{formatINR(sum.total)}</dd></div>
          <div className="rounded-xl bg-paper-deep px-2 py-2"><dt className="t-caption text-ink-soft">Spent</dt><dd className="t-money font-bold">{formatINR(sum.spent)}</dd></div>
          <div className="rounded-xl bg-leaf/15 px-2 py-2"><dt className="t-caption text-ink-soft">Left</dt><dd className="t-money font-bold text-leaf-ink">{formatINR(sum.left)}</dd></div>
        </dl>
        <p className="t-caption mt-1 text-ink-soft">Spent {since}.</p>
      </div>

      <div className="rounded-xl border border-ink/10 px-3 py-2">
        <p className="t-caption text-ink-soft">Pocket money from you</p>
        <p className="t-body font-bold">
          {c.pocketMoney ? <><span className="t-money">{formatINR(c.pocketMoney.amount)}</span> a month, on the {ordinal(c.pocketMoney.dayOfMonth)}. Next: {nextOccurrence(c.pocketMoney.dayOfMonth)}</> : 'Not set up yet'}
        </p>
      </div>

      <div>
        <h4 className="t-caption mb-1 font-bold uppercase tracking-wide text-ink-soft">Recent spends</h4>
        {sum.recentSpends.length === 0 ? (
          <p className="t-caption text-ink-soft">Nothing spent yet.</p>
        ) : (
          <ul aria-label="Recent spends" className="divide-y divide-ink/10 rounded-xl border border-ink/10">
            {sum.recentSpends.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="t-caption"><span className="font-bold text-ink">{t.label}</span><span className="block text-ink-soft">{daysAgoText(t.day, today)}</span></span>
                <span className="t-money font-bold">−{formatINR(Math.abs(t.amount))}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="t-caption text-ink-soft">
        Tasks: {tasksToDo} to do · {tasksToCheck} to check · Spend limit {formatINR(c.controls.spendLimit)}/mo
      </p>
      {sipText && <p className="t-caption rounded-xl bg-leaf/15 px-3 py-2 font-bold">{sipText}</p>}

      <div className="flex flex-col gap-2">
        {c.pocketMoney?.mandate === 'active' && <Button variant="secondary" onClick={onSend}>Send {formatINR(c.pocketMoney.amount)} now</Button>}
        <Button variant="secondary" onClick={onTasks}>Add a task</Button>
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
