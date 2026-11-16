import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { personas, type PersonaId } from '../demo/personas'

export type KycStatus = 'verified' | 'pending' | 'failed'

interface DemoState {
  activePersona: PersonaId
  /** Scenario switches driven by the demo toolbar. */
  kycStatus: KycStatus
  pocketMoneyLate: boolean
  declineNextSip: boolean
  /** Days the demo clock has been advanced (for "ask again tomorrow" etc). */
  demoDayOffset: number
}

interface DemoActions {
  setPersona: (id: PersonaId) => void
  setScenario: (patch: Partial<Omit<DemoState, 'activePersona' | 'demoDayOffset'>>) => void
  advanceDay: () => void
  reset: () => void
}

const initial: DemoState = {
  activePersona: 'priya',
  kycStatus: 'verified',
  pocketMoneyLate: false,
  declineNextSip: false,
  demoDayOffset: 0,
}

export const STORAGE_KEY = 'chiku-demo-v1'

export const useStore = create<DemoState & DemoActions>()(
  persist(
    (set) => ({
      ...initial,
      setPersona: (id) => set({ activePersona: id }),
      setScenario: (patch) => set(patch),
      advanceDay: () => set((s) => ({ demoDayOffset: s.demoDayOffset + 1 })),
      reset: () => set({ ...initial }),
    }),
    { name: STORAGE_KEY, version: 1 },
  ),
)

export const useActivePersona = () => personas[useStore((s) => s.activePersona)]
