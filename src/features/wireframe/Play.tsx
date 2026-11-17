import { useEffect } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Segmented } from '../../components/ui/Segmented'
import { Switch } from '../../components/ui/Switch'
import { useToast } from '../../store/toast'
import { PlayFrame } from './Frame'
import { scenes, stepById } from './scenes'
import { screens } from './screens'
import type { Act } from './screens/shared'
import { useWire } from './store'
import type { FlowKey, PersonaKey } from './types'

/** Clickable prototype. Both personas share one state, so a request made as Ananya shows up for Priya. */
export function Play() {
  const { flow: flowParam } = useParams()
  const flow: FlowKey = flowParam === 'child' ? 'child' : 'parent'
  const [sp, setSp] = useSearchParams()
  const navigate = useNavigate()
  const w = useWire()
  const toast = useToast((s) => s.show)

  // `?fresh=1` restarts the flow, `?scene=step:variant` jumps to a seeded scene. Otherwise resume.
  useEffect(() => {
    const scene = sp.get('scene')
    if (scene) {
      const [stepId, variantId] = scene.split(':')
      if (stepById(stepId as never)) useWire.getState().jump(stepId as never, variantId)
    } else if (sp.get('fresh')) useWire.getState().start(flow)
    if (sp.get('scene') || sp.get('fresh')) setSp({}, { replace: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const persona = w.persona
  const cursor = w.cursor[persona]
  const step = stepById(cursor.step)
  const Screen = screens[step.id]

  const act = (a: Act) => {
    if (a.type === 'GO') w.go(persona, a.step, a.view)
    else if (a.type === 'TOAST') toast(a.message)
    else if (a.type === 'PERSONA') w.switchPersona(a.to)
    else w.dispatch(a)
  }

  const phase = w.state.goal?.phase
  const priyaHasWork = phase === 'unlockRequested' && !w.state.unlock.askLater
  const ananyaHasNews = phase === 'unlocked' || phase === 'declined' || (phase === 'unlockRequested' && w.state.unlock.askLater)
  const frameFlow: FlowKey = persona === 'priya' ? 'parent' : 'child'

  return (
    <div className="mx-auto flex min-h-dvh max-w-[520px] flex-col gap-3 px-3 pb-3 pt-3 sm:items-center sm:px-5">
      <header className="flex w-full max-w-[390px] flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Link to={`/c/wireframe?flow=${frameFlow}&focus=${step.id}`} className="inline-flex min-h-11 items-center font-bold underline">← Storyboard</Link>
          <Button variant="secondary" className="!min-h-11 !px-3 !text-sm" onClick={() => { w.reset(); toast('Prototype reset') }}>Reset</Button>
        </div>
        <Segmented<PersonaKey>
          label="Switch persona"
          value={persona}
          onChange={(p) => w.switchPersona(p)}
          options={[
            { value: 'priya', label: priyaHasWork ? 'Priya  ●  new request' : 'Priya', hint: 'Parent' },
            { value: 'ananya', label: ananyaHasNews ? 'Ananya  ●  update' : 'Ananya', hint: 'Child' },
          ]}
        />
        <details className="rounded-[var(--radius-btn)] bg-white px-3">
          <summary className="flex min-h-11 cursor-pointer items-center font-bold">Options and scenes</summary>
          <div className="flex flex-col gap-3 pb-3">
            <label className="flex min-h-11 items-center justify-between gap-2"><span>Guardian KYC</span>
              <select value={w.state.kyc} onChange={(e) => w.dispatch({ type: 'SET', patch: { kyc: e.target.value as 'verified' } })} className="min-h-11 rounded-lg border border-ink/30 bg-white px-2">
                <option value="verified">Verified</option><option value="pending">Pending</option><option value="failed">Failed</option>
              </select>
            </label>
            <div className="flex min-h-11 items-center justify-between gap-2"><span>Pocket money late</span><Switch label="Pocket money late" checked={w.state.pocketLate} onChange={(v) => w.dispatch({ type: 'SET', patch: { pocketLate: v } })} /></div>
            <label className="flex flex-col gap-1"><span className="font-bold">Jump to scene</span>
              <select defaultValue="" onChange={(e) => { if (e.target.value) { const [s, v] = e.target.value.split(':'); w.jump(s as never, v); e.target.value = '' } }} className="min-h-11 rounded-lg border border-ink/30 bg-white px-2">
                <option value="">Choose a scene…</option>
                {scenes.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>
            <Button variant="ghost" onClick={() => navigate('/c/home')}>Back to app</Button>
          </div>
        </details>
      </header>
      <PlayFrame flow={frameFlow}>
        <Screen s={w.state} view={cursor.view} act={act} live />
      </PlayFrame>
      <p className="t-caption text-center text-ink-soft">Step {step.n}: {step.title}. Switching persona keeps your progress.</p>
    </div>
  )
}
