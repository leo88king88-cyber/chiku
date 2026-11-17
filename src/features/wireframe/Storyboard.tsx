import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Segmented } from '../../components/ui/Segmented'
import { StaticFrame } from './Frame'
import { flowSteps, stepById, type Step, type StepId } from './scenes'
import { useWire } from './store'
import type { FlowKey } from './types'

const SCALE = 0.62
const COL = 276

const flowMeta: Record<FlowKey, { who: string; role: string; need: string; verb: string }> = {
  parent: { who: 'Priya', role: 'Parent, 38', need: 'Wants safety, visibility and control without nagging.', verb: 'What Priya does' },
  child: { who: 'Ananya', role: 'Child, 13', need: 'Wants her own money and autonomy, and hates being patronised.', verb: 'What Ananya does' },
}

export function Storyboard() {
  const [sp, setSp] = useSearchParams()
  const flow: FlowKey = sp.get('flow') === 'child' ? 'child' : 'parent'
  const fidelity = useWire((s) => s.fidelity)
  const setFidelity = useWire((s) => s.setFidelity)
  const [chosen, setChosen] = useState<Record<string, string>>({})
  const [flash, setFlash] = useState<StepId | null>(null)
  const strip = useRef<HTMLOListElement>(null)
  const pending = useRef<StepId | null>(null)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const list = flowSteps(flow)
  const meta = flowMeta[flow]

  const focusStep = (id: StepId) => {
    const el = document.getElementById(`step-${id}`)
    if (!el) return false
    el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    setFlash(id)
    clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlash(null), 2200)
    return true
  }
  // After switching flows through a connector, scroll once the target step exists.
  useEffect(() => {
    if (pending.current && focusStep(pending.current)) pending.current = null
  }, [flow])
  useEffect(() => {
    const f = sp.get('focus') as StepId | null
    if (f) setTimeout(() => focusStep(f), 150)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const jumpTo = (id: StepId) => {
    const target = stepById(id)
    if (target.flow === flow) focusStep(id)
    else {
      pending.current = id
      setSp({ flow: target.flow })
    }
  }
  const nudge = (dir: 1 | -1) => strip.current?.scrollBy({ left: dir * COL * 2, behavior: 'smooth' })

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-4 pb-12">
      <header className="flex flex-col gap-3 px-5 pb-1 pt-3">
        <div className="flex items-center justify-between gap-2">
          <Link to="/c/home" className="inline-flex min-h-11 items-center font-bold underline">← Back to app</Link>
          <Link to={`/c/wireframe/play/${flow}?fresh=1`} className="inline-flex min-h-11 items-center rounded-[var(--radius-btn)] bg-ink px-5 font-bold text-paper no-underline">▶ Play {meta.who}'s flow</Link>
        </div>
        <h1 className="t-display">UX flows</h1>
        <div className="flex max-w-[420px] flex-col gap-3">
        <Segmented<FlowKey>
          label="Flow"
          value={flow}
          onChange={(v) => setSp({ flow: v })}
          options={[
            { value: 'parent', label: 'Priya', hint: 'Parent, 38' },
            { value: 'child', label: 'Ananya', hint: 'Child, 13' },
          ]}
        />
        <Segmented<'wire' | 'styled'>
          label="Fidelity"
          value={fidelity}
          onChange={setFidelity}
          options={[
            { value: 'wire', label: 'Wireframe' },
            { value: 'styled', label: 'Styled' },
          ]}
        />
        </div>
      </header>

      <section aria-label="Who this flow is for" className="sticker mx-5 p-4">
        <p className="t-title">{meta.who} <span className="t-caption font-normal text-ink-soft">· {meta.role}</span></p>
        <p className="t-body mt-1">{meta.need}</p>
      </section>

      <section aria-label="Connector between the two flows" className="mx-5">
        <p className="t-caption mb-2 font-bold uppercase tracking-wide text-ink-soft">Where the two flows meet</p>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => jumpTo('a-ask')} className="sticker min-h-11 px-3 text-left"><span className="t-caption block text-ink-soft">Ananya · step 8</span><b>Ask to unlock</b></button>
          <span aria-hidden className="t-title">⟶</span>
          <button onClick={() => jumpTo('p-approvals')} className="sticker min-h-11 px-3 text-left"><span className="t-caption block text-ink-soft">Priya · step 8</span><b>Approvals</b></button>
        </div>
      </section>

      <div className="relative">
        <ol ref={strip} aria-label={`${meta.who}'s flow, ${list.length} screens`} className="flex snap-x snap-mandatory overflow-x-auto px-5 pb-4 [scrollbar-width:thin]">
          {list.map((step, i) => (
            <StepItem
              key={step.id}
              step={step}
              last={i === list.length - 1}
              flashing={flash === step.id}
              variantId={chosen[step.id]}
              onVariant={(v) => setChosen((c) => ({ ...c, [step.id]: v }))}
              fidelity={fidelity}
              verb={meta.verb}
              onConnector={jumpTo}
            />
          ))}
        </ol>
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between px-1 md:flex">
          <button aria-label="Scroll left" onClick={() => nudge(-1)} className="pointer-events-auto grid size-11 place-items-center rounded-full bg-ink text-xl text-paper">‹</button>
          <button aria-label="Scroll right" onClick={() => nudge(1)} className="pointer-events-auto grid size-11 place-items-center rounded-full bg-ink text-xl text-paper">›</button>
        </div>
      </div>
      <p className="t-caption px-5 text-center text-ink-soft">Swipe sideways through the screens. “Play from here” opens the same screen as a clickable prototype.</p>
    </div>
  )
}

function StepItem({
  step, last, flashing, variantId, onVariant, fidelity, verb, onConnector,
}: {
  step: Step; last: boolean; flashing: boolean; variantId?: string; onVariant: (v: string) => void
  fidelity: 'wire' | 'styled'; verb: string; onConnector: (id: StepId) => void
}) {
  const vid = variantId ?? step.variants[0].id
  return (
    <li id={`step-${step.id}`} className="flex shrink-0 snap-center items-start">
      <div className="flex flex-col gap-3" style={{ width: COL }}>
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-ink font-bold text-paper" aria-hidden>{step.n}</span>
          <h2 className="t-title">{step.title}</h2>
        </div>
        <div className={`flex justify-center rounded-[48px] p-1 transition-shadow ${flashing ? 'ring-4 ring-saffron' : ''}`}>
          <StaticFrame step={step} variantId={vid} scale={SCALE} fidelity={fidelity} />
        </div>
        {step.variants.length > 1 && (
          <div role="radiogroup" aria-label={`${step.title} states`} className="flex flex-wrap justify-center gap-1.5">
            {step.variants.map((v) => (
              <button key={v.id} role="radio" aria-checked={v.id === vid} onClick={() => onVariant(v.id)} className={`min-h-11 rounded-full border-[length:var(--bw)] border-[color:var(--border-color)] px-3 t-caption font-bold ${v.id === vid ? 'bg-ink text-paper' : 'bg-white'}`}>{v.label}</button>
            ))}
          </div>
        )}
        <Link to={`/c/wireframe/play/${step.flow}?scene=${step.id}:${vid}`} className="t-caption inline-flex min-h-11 items-center justify-center font-bold underline">▶ Play from here</Link>
        <section className="sticker flex flex-col gap-2 p-3" aria-label={`Notes for step ${step.n}`}>
          <Note label={verb} text={step.does} />
          <Note label="Design decision, and why" text={step.why} />
          <Note label="States handled" text={step.states} />
        </section>
        {step.connector && (
          <button onClick={() => onConnector(step.connector!.step)} className="t-caption min-h-11 rounded-[var(--radius-btn)] border-[length:var(--bw)] border-dashed border-[color:var(--border-color)] bg-saffron/30 px-3 text-left font-bold">
            {step.connector.dir === 'to' ? '⟶ ' : '⟵ '}{step.connector.label}
          </button>
        )}
      </div>
      {!last && <span aria-hidden className="flex h-[536px] w-10 shrink-0 items-center justify-center pt-11 text-2xl text-ink-soft">→</span>}
    </li>
  )
}

function Note({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="t-caption font-bold uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="t-caption text-ink">{text}</p>
    </div>
  )
}
