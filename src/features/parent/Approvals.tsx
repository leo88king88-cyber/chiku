import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { ChoiceChips } from '../../components/ui/ChoiceChips'
import { formatINR } from '../../lib/money'
import { useStore } from '../../store'
import { useToast } from '../../store/toast'
import type { Request } from '../../store/types'

/** Everything waiting on Priya, across children. */
export function Approvals() {
  const navigate = useNavigate()
  const all = useStore((s) => s.requests)
  const requests = all.filter((r) => r.status === 'pending')
  return (
    <main className="flex flex-col gap-[var(--gap)] p-5">
      <header className="flex items-center gap-2">
        <button aria-label="Back" onClick={() => navigate('/p/home')} className="grid size-11 place-items-center rounded-full text-2xl">←</button>
        <h1 className="t-display">Approvals</h1>
      </header>
      {requests.length === 0 ? (
        <p className="sticker t-body p-5 text-center">All caught up 🎉<span className="t-caption block text-ink-soft">New requests from your children show up here.</span></p>
      ) : (
        <ul className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {requests.map((r) => (
              <motion.li key={r.id} layout exit={{ opacity: 0, x: 60 }} transition={{ duration: 0.25 }}>
                <RequestCard req={r} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </main>
  )
}

function RequestCard({ req }: { req: Request }) {
  const child = useStore((s) => s.children.find((c) => c.id === req.childId))
  const goal = useStore((s) => (req.kind === 'money' ? undefined : s.goals.find((g) => g.id === req.goalId)))
  const resolve = useStore((s) => s.resolveRequest)
  const toast = useToast((s) => s.show)
  const [price, setPrice] = useState(goal?.target ?? 0)
  if (!child) return null
  const later = () => {
    resolve(req.id, 'askLater')
    toast(`${child.name} will be told to ask again tomorrow`)
  }

  let title = ''
  let detail = ''
  let yes = 'Approve'
  if (req.kind === 'money') {
    title = `${child.name} asks for ${formatINR(req.amount)}`
    detail = `For: ${req.reason}. Goes to their Spend jar.`
  } else if (req.kind === 'goalPurchase') {
    title = `${child.name} reached the goal: ${goal?.emoji} ${goal?.title}`
    detail = `${formatINR(req.amount)} saved. Approve the purchase?`
    yes = 'Approve purchase'
  } else {
    title = `${child.name} wants to save for ${goal?.emoji} ${goal?.title}`
    detail = 'Set the price so we can start filling the jar.'
    yes = 'Confirm price'
  }
  const target = goal?.target ?? 0
  return (
    <article className="sticker flex flex-col gap-3 p-4">
      <div>
        <h2 className="t-title">{title}</h2>
        <p className="t-body mt-1 text-ink-soft">{detail}</p>
      </div>
      {req.kind === 'goalAmount' && (
        <ChoiceChips
          label="Price"
          value={price}
          options={[...new Set([Math.max(100, target - 500), target, target + 500])].map((v) => ({ value: v, label: formatINR(v) }))}
          onChange={setPrice}
        />
      )}
      <div className="flex flex-col gap-2">
        <Button onClick={() => { resolve(req.id, 'approve', { amount: price }); toast(`Done. ${child.name} has been notified.`) }}>{yes}</Button>
        {req.kind !== 'goalAmount' && <Button variant="secondary" onClick={later}>Ask again tomorrow</Button>}
      </div>
    </article>
  )
}
