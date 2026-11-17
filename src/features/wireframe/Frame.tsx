import { MotionConfig } from 'framer-motion'
import type { ReactNode } from 'react'
import { StaticModeContext } from '../../components/ui/staticMode'
import { Toast } from '../../components/ui/Toast'
import { screens } from './screens'
import { FidelityContext, type Act } from './screens/shared'
import { sceneFor, type Step } from './scenes'
import type { Fidelity, FlowKey, WireState } from './types'

const W = 390
const H = 844
const BEZEL = 10
const bandOf = (flow: FlowKey) => (flow === 'parent' ? 'pro' : 'teen')
const noop: (a: Act) => void = () => undefined

/** A frozen, scaled phone showing one step in one state. No router or store needed to render it. */
export function StaticFrame({ step, variantId, scale, fidelity }: { step: Step; variantId?: string; scale: number; fidelity: Fidelity }) {
  const { state, view } = sceneFor(step, variantId)
  const Screen = screens[step.id]
  const outerW = (W + BEZEL * 2) * scale
  const outerH = (H + BEZEL * 2) * scale
  return (
    <figure className="m-0 shrink-0" style={{ width: outerW, height: outerH }} aria-label={`Screen ${step.n}: ${step.title}`}>
      <div
        data-band={bandOf(step.flow)}
        data-fidelity={fidelity}
        className="relative box-content origin-top-left overflow-hidden rounded-[44px] border-[10px] border-ink bg-paper transform-gpu"
        style={{ width: W, height: H, transform: `scale(${scale})` }}
      >
        <StaticModeContext.Provider value>
          <FidelityContext.Provider value={fidelity}>
            <MotionConfig reducedMotion="always">
              <div inert className="relative h-full overflow-hidden">
                <Screen s={state} view={view} act={noop} live={false} />
              </div>
            </MotionConfig>
          </FidelityContext.Provider>
        </StaticModeContext.Provider>
      </div>
    </figure>
  )
}

/** The live phone for Play mode: full-bleed on phones, framed from 640px up. */
export function PlayFrame({ flow, fidelity, children }: { flow: FlowKey; fidelity: Fidelity; children: ReactNode }) {
  return (
    <div
      data-band={bandOf(flow)}
      data-fidelity={fidelity}
      className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-paper transform-gpu sm:h-[min(844px,calc(100dvh-11rem))] sm:w-[390px] sm:flex-none sm:rounded-[44px] sm:border-[10px] sm:border-ink sm:shadow-2xl"
    >
      <FidelityContext.Provider value={fidelity}>
        <MotionConfig reducedMotion="user">
          <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
        </MotionConfig>
      </FidelityContext.Provider>
      <Toast />
    </div>
  )
}

export type { WireState }
