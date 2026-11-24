import { Button } from '../../components/ui/Button'
import { formatINR } from '../../lib/money'
import { useActiveChild, useActivePersona, useStore } from '../../store'
import { useToast } from '../../store/toast'
import type { Chore } from '../../store/types'

/** The Tasks tab: jobs a parent set. Do one, tap "I did it", and the parent pays you after checking. */
export function ChildTasks() {
  const child = useActiveChild()
  const { band } = useActivePersona()
  const chores = useStore((s) => s.chores)
  const complete = useStore((s) => s.completeChore)
  const parent = useStore((s) => s.guardian.name.split(' ')[0])
  const toast = useToast((s) => s.show)
  if (!child) return null
  const kid = band === 'kid'
  const mine = chores.filter((k) => k.childId === child.id)
  const todo = mine.filter((k) => k.status === 'todo')
  const review = mine.filter((k) => k.status === 'review')
  const paid = mine.filter((k) => k.status === 'paid')

  const row = (k: Chore, right: React.ReactNode) => (
    <li key={k.id} className="sticker flex items-center gap-3 p-3">
      <div className="flex-1">
        <p className={`font-bold ${kid ? 'text-[18px]' : ''}`}>{k.title}</p>
        <p className="t-caption t-money text-ink-soft">Earn {formatINR(k.reward)}</p>
      </div>
      {right}
    </li>
  )

  return (
    <main className="flex flex-col gap-[var(--gap)] p-5">
      <header>
        <h1 className="t-display">My tasks</h1>
        <p className="t-body mt-1 text-ink-soft">Do a task, tap "I did it", and {parent} pays you after checking.</p>
      </header>

      {mine.length === 0 && (
        <section className="sticker flex flex-col items-center gap-2 p-6 text-center">
          <span className="text-5xl" aria-hidden>🧹</span>
          <h2 className="t-title">No tasks yet</h2>
          <p className="t-body text-ink-soft">Ask {parent} to add some. Each one pays you extra money.</p>
        </section>
      )}

      {todo.length > 0 && (
        <section aria-label="To do" className="flex flex-col gap-3">
          <h2 className="t-title">To do</h2>
          <ul className="flex flex-col gap-3">
            {todo.map((k) => row(k, <Button onClick={() => { complete(k.id); toast(`Sent to ${parent} to check`) }}>I did it</Button>))}
          </ul>
        </section>
      )}
      {review.length > 0 && (
        <section aria-label="Waiting for your parent" className="flex flex-col gap-3">
          <h2 className="t-title">Waiting for {parent}</h2>
          <ul className="flex flex-col gap-3">
            {review.map((k) => row(k, <span className="t-caption rounded-full bg-saffron/30 px-3 py-1 font-bold">⏳ Checking</span>))}
          </ul>
        </section>
      )}
      {paid.length > 0 && (
        <section aria-label="Done" className="flex flex-col gap-3">
          <h2 className="t-title">Done</h2>
          <ul className="flex flex-col gap-3">
            {paid.map((k) => row(k, <span className="t-caption rounded-full bg-leaf/20 px-3 py-1 font-bold text-leaf-ink">✓ Paid</span>))}
          </ul>
        </section>
      )}
    </main>
  )
}
