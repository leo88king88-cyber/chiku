import { motion } from 'framer-motion'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Chiku } from '../../components/mascot/Chiku'
import { formatINR } from '../../lib/money'
import { currentGoalOf, useActiveChild, useActivePersona, useStore } from '../../store'
import { ChildHeader } from './ChildHeader'
import { goalPath } from './goalPath'
import { goalTemplates, type GoalTemplate } from './templates'

const custom: GoalTemplate = { id: 'custom', title: '', emoji: '✨', price: 1000, audience: ['teen'] }

/** Pick a picture, confirm the price (or ask a parent to), done. `next` is the post-purchase variant. */
export function NewGoal({ next = false }: { next?: boolean }) {
  const navigate = useNavigate()
  const child = useActiveChild()
  const { band } = useActivePersona()
  const createGoal = useStore((s) => s.createGoal)
  const existing = useStore((s) => (child ? currentGoalOf(s.goals, child.id) : undefined))
  const parent = useStore((s) => s.guardian.name.split(' ')[0])
  const kid = band === 'kid'
  const [picked, setPicked] = useState<GoalTemplate | null>(null)
  const [amount, setAmount] = useState(0)
  const [title, setTitle] = useState('')

  if (!child) return null
  if (existing) return <Navigate to={goalPath(existing)} replace />

  const choices = goalTemplates.filter((t) => t.audience.includes(kid ? 'kid' : 'teen'))
  const pick = (t: GoalTemplate) => {
    setPicked(t)
    setAmount(t.price)
  }
  const finalTitle = picked?.id === 'custom' ? title.trim() : picked?.title ?? ''
  const create = (askParent: boolean) => {
    if (!picked || !finalTitle) return
    const id = createGoal(child.id, { templateId: picked.id, title: finalTitle, emoji: picked.emoji, target: amount, askParent })
    navigate(`/c/goal/${id}`, { state: { created: true } })
  }

  if (!picked) {
    return (
      <div className="flex min-h-full flex-col">
        <ChildHeader />
        <main className="flex flex-col gap-[var(--gap)] px-5 pb-6 pt-2">
          <div className="flex items-center gap-3">
            {kid && <Chiku size={72} />}
            <h1 className="t-display">{next ? 'Pick your next goal!' : kid ? 'What do you want?' : 'What are you saving for?'}</h1>
          </div>
          <ul className="grid grid-cols-2 gap-3">
            {choices.map((t, i) => (
              <motion.li key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <button onClick={() => pick(t)} className={`sticker flex w-full flex-col items-center gap-1 p-3 ${kid ? 'min-h-40' : 'min-h-28'}`}>
                  <span className={kid ? 'text-6xl' : 'text-4xl'} aria-hidden>{t.emoji}</span>
                  <span className="font-bold">{t.title}</span>
                  <span className="t-caption t-money text-ink-soft">{formatINR(t.price)}</span>
                </button>
              </motion.li>
            ))}
            {!kid && (
              <li>
                <button onClick={() => pick(custom)} className="sticker flex min-h-28 w-full flex-col items-center justify-center gap-1 p-3">
                  <span className="text-4xl" aria-hidden>✨</span>
                  <span className="font-bold">Something else</span>
                </button>
              </li>
            )}
          </ul>
        </main>
      </div>
    )
  }

  const step = kid ? 100 : 50
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center gap-2 px-3 pt-3">
        <button aria-label="Back" onClick={() => setPicked(null)} className="grid size-11 place-items-center rounded-full text-2xl">←</button>
      </header>
      <motion.main initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="flex flex-1 flex-col items-center gap-[var(--gap)] px-5 text-center">
        <motion.span initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 12 }} className={kid ? 'text-[96px]' : 'text-7xl'} aria-hidden>
          {picked.emoji}
        </motion.span>
        {picked.id === 'custom' ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            autoComplete="off"
            placeholder="What is it?"
            aria-label="Goal name"
            className="sticker min-h-14 w-full px-4 text-center text-[18px] outline-none focus-visible:ring-4 focus-visible:ring-sky"
          />
        ) : (
          <h1 className="t-display">{picked.title}</h1>
        )}
        <div className="flex items-center gap-3">
          <button aria-label={`Less ${step} rupees`} onClick={() => setAmount((a) => Math.max(step, a - step))} className="sticker grid size-14 place-items-center text-3xl">−</button>
          <motion.p key={amount} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="t-display t-money min-w-36">{formatINR(amount)}</motion.p>
          <button aria-label={`More ${step} rupees`} onClick={() => setAmount((a) => a + step)} className="sticker grid size-14 place-items-center text-3xl">+</button>
        </div>
        {kid ? <p className="t-body text-ink-soft">Is that the price?</p> : <p className="t-caption text-ink-soft">Adjust to the real price, or let {parent} fill it in.</p>}
      </motion.main>
      <footer className="flex flex-col gap-2 px-5 pb-5 pt-3">
        <Button disabled={!finalTitle} onClick={() => create(false)} className="w-full !min-h-14">{kid ? "Yes, that's my goal!" : 'Create goal'}</Button>
        <Button variant="secondary" disabled={!finalTitle} onClick={() => create(true)} className="w-full">Ask {parent} to fill it in</Button>
      </footer>
    </div>
  )
}

/** Route wrapper for the post-purchase "pick your next goal" screen. */
export function NextGoal() {
  return <NewGoal next />
}
