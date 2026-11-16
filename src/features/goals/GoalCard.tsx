import { Link } from 'react-router-dom'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { ProgressRing } from '../../components/ui/ProgressRing'
import { formatINR } from '../../lib/money'
import { useStore } from '../../store'
import type { Child, Goal } from '../../store/types'
import { goalPath } from './goalPath'

/** Home-screen goal summary. `kid` gets a bigger ring and shorter, friendlier copy. */
export function GoalCard({ goal, child, kid }: { goal: Goal; child: Child; kid: boolean }) {
  const parent = useStore((s) => s.guardian.name.split(' ')[0])
  const saved = Math.min(child.jars.save, goal.target)
  const left = Math.max(0, goal.target - child.jars.save)
  const line =
    goal.status === 'pendingParent'
      ? `${parent} is setting the price`
      : goal.status === 'awaitingApproval'
        ? `Waiting for ${parent} to say yes`
        : goal.status === 'complete'
          ? kid ? 'You did it! Tap me!' : 'Goal reached. Ask for approval.'
          : kid ? `Only ${formatINR(left)} to go!` : `${formatINR(left)} to go`
  return (
    <Link to={goalPath(goal)} className="sticker flex items-center gap-4 p-4 no-underline">
      <ProgressRing value={goal.status === 'pendingParent' ? 0 : saved / goal.target} size={kid ? 132 : 96} stroke={kid ? 14 : 9}>
        <span className={kid ? 'text-6xl' : 'text-4xl'} aria-hidden>{goal.emoji}</span>
      </ProgressRing>
      <div className="flex-1">
        <h3 className="t-title">{goal.title}</h3>
        <p className="t-body">
          <b><AnimatedNumber value={saved} /></b> of {formatINR(goal.target)}
        </p>
        <p className="t-caption mt-1 text-ink-soft">{line}</p>
      </div>
    </Link>
  )
}
