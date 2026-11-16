import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Chiku } from '../../components/mascot/Chiku'
import { Confetti } from '../../components/ui/Confetti'
import { formatINR } from '../../lib/money'
import { useActiveChild, useActivePersona, useStore } from '../../store'
import { useCelebrations } from '../../store/celebrations'

const coinCount = 6

/** Full-frame moments: pocket money arriving, milestone stars, goal complete. Queue-driven. */
export function CelebrationLayer() {
  const child = useActiveChild()
  const { band } = useActivePersona()
  const goals = useStore((s) => s.goals)
  const navigate = useNavigate()
  const queue = useCelebrations((s) => s.queue)
  const dismiss = useCelebrations((s) => s.dismiss)
  const ev = child ? queue.find((e) => e.childId === child.id) : undefined
  const kid = band === 'kid'

  useEffect(() => {
    if (!ev || ev.kind === 'complete') return
    const t = setTimeout(() => dismiss(ev.id), ev.kind === 'arrival' ? 2600 : 2800)
    return () => clearTimeout(t)
  }, [ev, dismiss])

  const goal = ev && 'goalId' in ev ? goals.find((g) => g.id === ev.goalId) : undefined

  return (
    <AnimatePresence>
      {ev && child && (
        <motion.div
          key={ev.id}
          role="alertdialog"
          aria-label="Celebration"
          className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-paper px-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => ev.kind !== 'complete' && dismiss(ev.id)}
        >
          {ev.kind !== 'arrival' && <Confetti count={ev.kind === 'complete' ? 44 : 20} />}

          {ev.kind === 'arrival' && (
            <>
              <div className="relative h-24 w-full" aria-hidden>
                {Array.from({ length: coinCount }, (_, i) => (
                  <motion.span
                    key={i}
                    className="absolute top-0 text-3xl"
                    style={{ left: `${12 + i * 15}%` }}
                    initial={{ y: -80, opacity: 0 }}
                    animate={{ y: 70, opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 0.9, delay: i * 0.12, ease: 'easeIn' }}
                  >
                    🪙
                  </motion.span>
                ))}
              </div>
              <h2 className="t-display">{ev.label} is here!</h2>
              <p className="t-title t-money text-leaf">
                +{formatINR(ev.parts.spend + ev.parts.save + ev.parts.share)}
              </p>
              <div className="flex w-full justify-center gap-2">
                {([['spend', 'Spend', 'tomato'], ['save', 'Save', 'leaf'], ['share', 'Share', 'sky']] as const).map(([k, label, c], i) => (
                  <motion.div
                    key={k}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.15 }}
                    className="sticker flex-1 p-2"
                    style={{ borderColor: `var(--color-${c})` }}
                  >
                    <p className="t-caption font-bold">{label}</p>
                    <p className="t-money font-bold">+{formatINR(ev.parts[k])}</p>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {ev.kind === 'milestone' && (
            <>
              {kid && <Chiku size={96} cheer />}
              <motion.span
                initial={{ scale: 0, rotate: -40 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 12 }}
                className="text-7xl"
              >
                ⭐
              </motion.span>
              <h2 className="t-display">
                {ev.pct === 50 ? 'Halfway there' : `${ev.pct}% there`}, {child.name}!
              </h2>
              <p className="t-body">{goal ? `You're closing in on the ${goal.title.toLowerCase()}!` : 'Keep going!'}</p>
            </>
          )}

          {ev.kind === 'complete' && (
            <>
              <Chiku size={kid ? 120 : 90} cheer />
              <motion.span initial={{ scale: 0.2 }} animate={{ scale: [0.2, 1.25, 1] }} transition={{ duration: 0.7 }} className="text-8xl">
                {goal?.emoji ?? '🎉'}
              </motion.span>
              <h2 className="t-display">You did it, {child.name}!</h2>
              <p className="t-body">You saved enough for the {goal?.title.toLowerCase() ?? 'goal'}.</p>
              <Button
                onClick={() => {
                  dismiss(ev.id)
                  if (goal) navigate(`/c/goal/${goal.id}/done`)
                }}
                className="w-full"
              >
                See it!
              </Button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
