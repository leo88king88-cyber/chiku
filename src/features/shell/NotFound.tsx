import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Chiku } from '../../components/mascot/Chiku'
import { smartHome } from '../../demo/smartHome'
import { useStore } from '../../store'

export function NotFound() {
  const navigate = useNavigate()
  const persona = useStore((s) => s.activePersona)
  return (
    <main className="flex flex-col items-center gap-4 p-8 pt-16 text-center">
      <Chiku size={110} />
      <h1 className="t-display">Oops, nothing here</h1>
      <p className="t-body text-ink-soft">That page doesn't exist, or the link is out of date.</p>
      <Button onClick={() => navigate(smartHome(persona))} className="w-full">Go home</Button>
    </main>
  )
}
