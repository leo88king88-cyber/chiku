import { useLocation, useParams, Navigate } from 'react-router-dom'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { Confetti } from '../../components/ui/Confetti'
import { MilestoneTrack } from '../../components/ui/MilestoneTrack'
import { ProgressRing } from '../../components/ui/ProgressRing'
import { Chiku } from '../../components/mascot/Chiku'
import { formatINR } from '../../lib/money'
import { useActiveChild, useActivePersona, useStore, splitAmount } from '../../store'
import { ChildHeader } from './ChildHeader'
import { SavingRate } from './SavingRate'

export function GoalDetail() {
  const { id } = useParams()
  const child = useActiveChild()
  const { band } = useActivePersona()
  const goal = useStore((s) => s.goals.find((g) => g.id === id))
  const parent = useStore((s) => s.guardian.name.split(' ')[0])
  const created = Boolean((useLocation().state as { created?: boolean } | null)?.created)
  if (!goal || !child || goal.childId !== child.id) return <Navigate to="/c/home" replace />
  if (goal.status === 'complete' || goal.status === 'awaitingApproval' || goal.status === 'purchased') {
    return <Navigate to={`/c/goal/${goal.id}/done`} replace />
  }
  const kid = band === 'kid'
  const saved = Math.min(child.money.save, goal.target)
  const left = Math.max(0, goal.target - child.money.save)
  const perDrop = child.pocketMoney ? splitAmount(child.pocketMoney.amount, child.split).save : 0
  const drops = perDrop > 0 ? Math.ceil(left / perDrop) : null

  return (
    <div className="relative flex min-h-full flex-col">
      {created && <Confetti count={18} />}
      <ChildHeader />
      <main className="flex flex-col items-center gap-[var(--gap)] px-5 pb-8 text-center">
        <ProgressRing value={goal.status === 'pendingParent' ? 0 : saved / goal.target} size={kid ? 220 : 180} stroke={kid ? 18 : 12}>
          <span className={kid ? 'text-8xl' : 'text-6xl'} aria-hidden>{goal.emoji}</span>
        </ProgressRing>
        <h1 className="t-display">{goal.title}</h1>
        {goal.status === 'pendingParent' ? (
          <div className="sticker flex items-center gap-3 p-4 text-left">
            {kid && <Chiku size={64} />}
            <p className="t-body">{parent} is filling in the price. We'll start saving for it once it's set.</p>
          </div>
        ) : (
          <>
            <p className="t-title">
              <AnimatedNumber value={saved} /> <span className="font-normal text-ink-soft">of {formatINR(goal.target)}</span>
            </p>
            <div className="w-full"><MilestoneTrack hit={goal.milestonesHit} /></div>
            <p className="t-body">
              {drops === null
                ? 'Add pocket money to start filling this goal.'
                : kid
                  ? `About ${drops} pocket-money ${drops === 1 ? 'day' : 'days'} to go!`
                  : `About ${drops} more pocket-money ${drops === 1 ? 'drop' : 'drops'} at ${formatINR(perDrop)} each.`}
            </p>
          </>
        )}
        <SavingRate child={child} kid={kid} />
      </main>
    </div>
  )
}
