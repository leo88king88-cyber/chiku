import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useStore } from '../store'
import { smartHome } from './smartHome'
import { personaList, type PersonaId } from './personas'

const deviceNote: Record<PersonaId, string> = {
  priya: 'Parent, 38',
  aarav: "9 · Priya's phone",
  ananya: "13 · Priya's phone",
  rohan: '16 · own phone',
}

export function DemoToolbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const s = useStore()

  const go = (persona: PersonaId) => {
    // Persona first, so every screen settles; then route. Screens we are leaving may redirect
    // when the persona changes, and the toolbar must win. Replace, so history never links two phones.
    const path = smartHome(persona)
    s.setPersona(persona)
    setTimeout(() => navigate(path, { replace: true }), 80)
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="fixed right-3 top-1.5 z-50 min-h-11 rounded-full bg-ink px-4 text-sm font-bold text-paper shadow-lg lg:hidden"
      >
        Demo {open ? '×' : '⚙'}
      </button>

      <aside
        aria-label="Demo toolbar"
        className={`${open ? 'block' : 'hidden'} fixed inset-x-3 top-14 z-40 max-h-[80dvh] overflow-y-auto rounded-2xl bg-ink p-4 text-sm text-paper shadow-2xl lg:static lg:mr-0 lg:block lg:max-h-[min(844px,calc(100dvh-32px))] lg:w-72 lg:shrink-0`}
      >
        <h2 className="text-base font-bold">Demo controls</h2>
        <p className="mt-1 text-paper/70">Route: <code>{pathname}</code></p>

        <Section title="Who is using the app">
          <div className="grid grid-cols-2 gap-2">
            {personaList.map((p) => (
              <button
                key={p.id}
                onClick={() => go(p.id)}
                aria-pressed={s.activePersona === p.id}
                className={`min-h-11 rounded-xl px-2 text-left font-bold ${s.activePersona === p.id ? 'bg-saffron text-ink' : 'bg-white/10'}`}
              >
                {p.emoji} {p.name}
                <span className="block font-normal opacity-80">{deviceNote[p.id]}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-paper/70">Aarav and Ananya borrow Priya's phone. Rohan has his own, so he logs in separately.</p>
        </Section>

        <Section title="Data">
          <Button variant="secondary" className="w-full !text-sm" onClick={() => { s.loadDemoFamily(); navigate('/p/home', { replace: true }); setOpen(false) }}>
            Load demo family (skip onboarding)
          </Button>
          <Button
            variant="secondary"
            className="mt-2 w-full !text-sm"
            onClick={() => {
              s.reset()
              // Wait a tick: logging out makes the parent gate redirect, and the toolbar must win.
              setTimeout(() => navigate('/', { replace: true }), 80)
              setOpen(false)
            }}
          >
            Reset demo data
          </Button>
        </Section>
      </aside>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4">
      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-saffron">{title}</h3>
      {children}
    </section>
  )
}
