import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useStore, type KycStatus } from '../store'
import { flowStarts, personaList, type PersonaId } from './personas'

export function DemoToolbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const s = useStore()

  const go = (persona: PersonaId, path: string) => {
    s.setPersona(persona)
    navigate(path)
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

        <Section title="Persona">
          <div className="grid grid-cols-2 gap-2">
            {personaList.map((p) => (
              <button
                key={p.id}
                onClick={() => go(p.id, p.home)}
                aria-pressed={s.activePersona === p.id}
                className={`min-h-11 rounded-xl px-2 text-left font-bold ${s.activePersona === p.id ? 'bg-saffron text-ink' : 'bg-white/10'}`}
              >
                {p.emoji} {p.name}
                <span className="block font-normal opacity-80">{p.role}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Jump to flow">
          <div className="flex flex-col gap-2">
            {flowStarts.map((f) => (
              <button key={f.label} onClick={() => go(f.persona, f.path)} className="min-h-11 rounded-xl bg-white/10 px-3 text-left">
                {f.label}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Scenarios">
          <label className="flex min-h-11 items-center justify-between gap-2">
            Guardian KYC
            <select
              value={s.kycStatus}
              onChange={(e) => s.setScenario({ kycStatus: e.target.value as KycStatus })}
              className="min-h-11 rounded-lg bg-white px-2 text-ink"
            >
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </label>
          <Toggle label="Pocket money late" checked={s.pocketMoneyLate} onChange={(v) => s.setScenario({ pocketMoneyLate: v })} />
          <Toggle label="Parent declines next SIP" checked={s.declineNextSip} onChange={(v) => s.setScenario({ declineNextSip: v })} />
          <div className="flex min-h-11 items-center justify-between gap-2">
            <span>Demo day +{s.demoDayOffset}</span>
            <Button variant="secondary" onClick={s.advanceDay} className="!min-h-11 !px-3 !text-sm">Next day</Button>
          </div>
        </Section>

        <Section title="Data">
          <Button variant="secondary" className="w-full !text-sm" onClick={() => { s.loadDemoFamily(); navigate('/p/home'); setOpen(false) }}>
            Load demo family (skip onboarding)
          </Button>
        </Section>

        <Button
          variant="secondary"
          className="mt-4 w-full !text-sm"
          onClick={() => {
            s.reset()
            navigate('/')
            setOpen(false)
          }}
        >
          Reset demo data
        </Button>
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

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-2">
      {label}
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-6 accent-saffron" />
    </label>
  )
}
