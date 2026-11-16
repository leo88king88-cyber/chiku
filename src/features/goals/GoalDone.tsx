import { motion } from 'framer-motion'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Chiku } from '../../components/mascot/Chiku'
import { Confetti } from '../../components/ui/Confetti'
import { formatINR } from '../../lib/money'
import { useActiveChild, useActivePersona, useStore } from '../../store'
import { useToast } from '../../store/toast'
import { ChildHeader } from './ChildHeader'

/** Goal reached: celebrate, ask a parent to approve the purchase, then pick the next goal. */
export function GoalDone() {
  const { id } = useParams()
  const navigate = useNavigate()
  const child = useActiveChild()
  const { band } = useActivePersona()
  const goal = useStore((s) => s.goals.find((g) => g.id === id))
  const req = useStore((s) => s.requests.filter((r) => r.kind === 'goalPurchase' && r.goalId === id).at(-1))
  const day = useStore((s) => s.demoDayOffset)
  const parent = useStore((s) => s.guardian.name.split(' ')[0])
  const { requestGoalPurchase, reask, markGoalSeen } = useStore.getState()
  const toast = useToast((s) => s.show)
  if (!goal || !child || goal.childId !== child.id) return <Navigate to="/c/home" replace />
  if (goal.status === 'active' || goal.status === 'pendingParent') return <Navigate to={`/c/goal/${goal.id}`} replace />
  const kid = band === 'kid'
  const asked = goal.status === 'awaitingApproval'
  const snoozed = asked && req?.status === 'askLater'
  const canReask = snoozed && day >= (req?.retryAfterDay ?? 0)

  let heading = `You did it, ${child.name}!`
  let body = `You saved ${formatINR(goal.target)} for the ${goal.title.toLowerCase()}.`
  if (goal.status === 'purchased') {
    heading = 'Approved! 🎉'
    body = `${parent} said yes to the ${goal.title.toLowerCase()}. Time to celebrate!`
  } else if (snoozed) {
    heading = `${parent} said ask again tomorrow`
    body = "That's okay. Your money is safe in your jar."
  } else if (asked) {
    heading = `Waiting for ${parent}`
    body = `We asked ${parent} to approve the ${goal.title.toLowerCase()}. You'll get a ping.`
  }

  return (
    <div className="relative flex min-h-full flex-col">
      {(goal.status === 'complete' || goal.status === 'purchased') && <Confetti count={goal.status === 'purchased' ? 40 : 30} />}
      <ChildHeader />
      <main className="flex flex-1 flex-col items-center gap-[var(--gap)] px-5 text-center">
        {kid && <Chiku size={100} cheer={!asked || goal.status === 'purchased'} />}
        <motion.span
          initial={{ scale: 0.3, rotate: -15 }}
          animate={{ scale: 1, rotate: 0, y: asked && goal.status !== 'purchased' ? 0 : [0, -10, 0] }}
          transition={{ type: 'spring', stiffness: 220, damping: 10, y: { repeat: Infinity, duration: 1.6 } }}
          className={kid ? 'text-[110px]' : 'text-8xl'}
          aria-hidden
        >
          {goal.emoji}
        </motion.span>
        <h1 className="t-display">{heading}</h1>
        <p className="t-body">{body}</p>
      </main>
      <footer className="flex flex-col gap-2 px-5 pb-5 pt-3">
        {goal.status === 'complete' && (
          <Button
            className="w-full !min-h-14"
            onClick={() => {
              if (requestGoalPurchase(goal.id) === 'auto') toast(`Under ${parent}'s limit, so it's approved!`)
            }}
          >
            Ask {parent} to buy it
          </Button>
        )}
        {snoozed && (
          <Button className="w-full" disabled={!canReask} onClick={() => req && reask(req.id)}>
            {canReask ? 'Ask again' : 'You can ask again tomorrow'}
          </Button>
        )}
        {goal.status === 'purchased' && (
          <Button className="w-full !min-h-14" onClick={() => { markGoalSeen(goal.id); navigate('/c/next-goal') }}>Pick your next goal</Button>
        )}
        <Button variant="ghost" onClick={() => { if (goal.status === 'purchased') markGoalSeen(goal.id); navigate('/c/home') }}>Back home</Button>
      </footer>
    </div>
  )
}
