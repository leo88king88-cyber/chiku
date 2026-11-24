import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { formatINR } from '../../lib/money'
import { currentGoalOf, useActiveChild, useActivePersona, useStore } from '../../store'
import { goalPath } from './goalPath'
import { SavingRate } from './SavingRate'

/** The Goal tab: your goal if you have one, otherwise a clear way to start. */
export function ChildGoals() {
  const navigate = useNavigate()
  const child = useActiveChild()
  const { band } = useActivePersona()
  const goal = useStore((s) => (child ? currentGoalOf(s.goals, child.id) : undefined))
  if (!child) return null
  if (goal) return <Navigate to={goalPath(goal)} replace />
  return (
    <main className="flex flex-col gap-[var(--gap)] p-5">
      <h1 className="t-display">My goal</h1>
      <section className="sticker flex flex-col items-center gap-3 p-6 text-center">
        <span className="text-6xl" aria-hidden>🎯</span>
        <h2 className="t-title">No goal yet</h2>
        <p className="t-body">You have {formatINR(child.money.save)} saved. Pick something to save for and watch it grow.</p>
        <Button className="w-full !min-h-14" onClick={() => navigate('/c/goal/new')}>Pick a goal</Button>
      </section>
      <SavingRate child={child} kid={band === 'kid'} />
    </main>
  )
}
