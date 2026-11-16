import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Jar } from '../../components/ui/Jar'
import { Chiku } from '../../components/mascot/Chiku'
import { formatINR } from '../../lib/money'
import { currentGoalOf, useStore } from '../../store'
import type { Child } from '../../store/types'
import { GoalCard } from './GoalCard'
import { LateBanner } from './LateBanner'
import { RequestStatus } from './RequestStatus'

/** 8-11: big pictures, a mascot, almost no typing. */
export function HomeKid({ child }: { child: Child }) {
  const navigate = useNavigate()
  const goal = useStore((s) => currentGoalOf(s.goals, child.id))
  const j = child.jars
  const saveCap = goal?.target ?? Math.max(2000, j.save)
  const speech = !goal ? 'What do you want to save for?' : goal.status === 'complete' ? 'You did it! 🎉' : `Hi ${child.name}!`

  return (
    <main className="flex flex-col gap-[var(--gap)] p-5">
      <header className="flex items-center gap-3">
        <Chiku size={84} cheer={goal?.status === 'complete'} />
        <motion.p
          key={speech}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="sticker t-title flex-1 p-3"
        >
          {speech}
        </motion.p>
      </header>

      <LateBanner child={child} kid />

      <section aria-label="My jars" className="sticker flex justify-around px-2 py-4">
        <Jar kind="spend" label="Spend" amount={j.spend} fill={j.spend / child.controls.spendLimit} />
        <Jar kind="save" label="Save" amount={j.save} fill={j.save / saveCap} />
        <Jar kind="share" label="Share" amount={j.share} fill={j.share / 200} />
      </section>

      {goal ? (
        <GoalCard goal={goal} child={child} kid />
      ) : (
        <section className="sticker flex flex-col items-center gap-3 p-5 text-center">
          <span className="text-6xl" aria-hidden>🎯</span>
          <h2 className="t-title">No goal yet</h2>
          <p className="t-body">You've saved {formatINR(j.save)}. Pick something to save for!</p>
          <Button onClick={() => navigate('/c/goal/new')} className="w-full !min-h-16 !text-2xl">Pick a goal</Button>
        </section>
      )}

      <RequestStatus childId={child.id} kid />

      <Button variant="secondary" onClick={() => navigate('/c/request-money')} className="w-full !min-h-14">
        🙏 I need extra money
      </Button>
    </main>
  )
}
