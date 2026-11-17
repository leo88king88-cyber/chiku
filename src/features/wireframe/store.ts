import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { reduce } from './machine'
import { baseState, firstStep, sceneFor, stepById, type StepId } from './scenes'
import type { FlowKey, PersonaKey, WireEvent, WireState } from './types'

export interface Cursor { step: StepId; view?: string }

interface WireStore {
  state: WireState
  persona: PersonaKey
  cursor: Record<PersonaKey, Cursor>
  dispatch: (e: WireEvent) => void
  go: (persona: PersonaKey, step: StepId, view?: string) => void
  switchPersona: (p: PersonaKey) => void
  jump: (stepId: StepId, variantId: string) => void
  start: (flow: FlowKey) => void
  reset: () => void
}

const personaOf = (flow: FlowKey): PersonaKey => (flow === 'parent' ? 'priya' : 'ananya')
const initialCursor = (): Record<PersonaKey, Cursor> => ({ priya: { step: firstStep('parent') }, ananya: { step: firstStep('child') } })

/** Where a persona should land when switched to, so the open request is always one tap away. */
export function landing(persona: PersonaKey, s: WireState, current: Cursor): Cursor {
  const phase = s.goal?.phase
  if (persona === 'priya' && phase === 'unlockRequested' && !s.unlock.askLater) return { step: 'p-approvals' }
  if (persona === 'ananya') {
    if (phase === 'unlockRequested') return { step: 'a-wait' }
    if (phase === 'unlocked' || phase === 'declined') return { step: 'a-outcome' }
  }
  return current
}

export const useWire = create<WireStore>()(
  persist(
    (set, get) => ({
      state: baseState(),
      persona: 'priya',
      cursor: initialCursor(),
      dispatch: (e) => set((w) => ({ state: reduce(w.state, e) })),
      go: (persona, step, view) => set((w) => ({ cursor: { ...w.cursor, [persona]: { step, view } } })),
      switchPersona: (persona) => {
        const w = get()
        set({ persona, cursor: { ...w.cursor, [persona]: landing(persona, w.state, w.cursor[persona]) } })
      },
      jump: (stepId, variantId) => {
        const step = stepById(stepId)
        const { state, view } = sceneFor(step, variantId)
        const persona = personaOf(step.flow)
        set((w) => ({ state, persona, cursor: { ...w.cursor, [persona]: { step: stepId, view } } }))
      },
      start: (flow) => set({ state: baseState(), persona: personaOf(flow), cursor: initialCursor() }),
      reset: () => set({ state: baseState(), cursor: initialCursor() }),
    }),
    { name: 'chiku-wire-v1', version: 1 },
  ),
)
