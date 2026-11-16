import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { personas, type PersonaId } from '../demo/personas'
import type { AgeBand } from '../theme/bands'
import { controlPresets, pocketMoneySuggestion } from './presets'
import type { Child, Controls, Guardian, PocketMoney } from './types'

export type KycStatus = 'verified' | 'pending' | 'failed'

interface DemoState {
  activePersona: PersonaId
  kycStatus: KycStatus
  pocketMoneyLate: boolean
  declineNextSip: boolean
  demoDayOffset: number
  guardian: Guardian
  children: Child[]
  /** Child currently being set up in the onboarding flow. */
  draftChildId: string | null
}

interface DemoActions {
  setPersona: (id: PersonaId) => void
  setScenario: (patch: Partial<Pick<DemoState, 'kycStatus' | 'pocketMoneyLate' | 'declineNextSip'>>) => void
  advanceDay: () => void
  reset: () => void
  addChild: (name: string, ageBand: AgeBand) => string
  updateChild: (id: string, patch: Partial<Omit<Child, 'id'>>) => void
  updateControls: (id: string, patch: Partial<Controls>) => void
  setPocketMoney: (id: string, pm: PocketMoney | null) => void
  loadDemoFamily: () => void
}

const guardian: Guardian = {
  name: 'Priya Menon',
  phoneMasked: '+91 98•••• 4521',
  panMasked: 'ABCPM••••F',
  bankMasked: 'HDFC Bank ••4821',
  upiId: 'priya.menon@okhdfcbank',
}

const initial: DemoState = {
  activePersona: 'priya',
  kycStatus: 'verified',
  pocketMoneyLate: false,
  declineNextSip: false,
  demoDayOffset: 0,
  guardian,
  children: [],
  draftChildId: null,
}

function makeChild(name: string, ageBand: AgeBand, confirmed = false): Child {
  const n = name.trim()
  return {
    id: 'c_' + Math.random().toString(36).slice(2, 8),
    name: n,
    ageBand,
    controls: { ...controlPresets[ageBand], isDefault: !confirmed },
    pocketMoney: null,
    inviteCode: `CHIKU-${n.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6)}-${Math.floor(1000 + Math.random() * 9000)}`,
    inviteStatus: 'sent',
  }
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
      addChild: (name, ageBand) => {
        const child = makeChild(name, ageBand)
        set((s) => ({ children: [...s.children, child], draftChildId: child.id }))
        return child.id
      },
      updateChild: (id, patch) =>
        set((s) => ({ children: s.children.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      updateControls: (id, patch) =>
        set((s) => ({
          children: s.children.map((c) => (c.id === id ? { ...c, controls: { ...c.controls, ...patch } } : c)),
        })),
      setPocketMoney: (id, pocketMoney) =>
        set((s) => ({ children: s.children.map((c) => (c.id === id ? { ...c, pocketMoney } : c)) })),
      loadDemoFamily: () =>
        set(() => {
          const mk = (n: string, b: AgeBand) => ({
            ...makeChild(n, b, true),
            inviteStatus: 'accepted' as const,
            pocketMoney: {
              ...pocketMoneySuggestion[b],
              mandate: 'active' as const,
              upiApp: 'PhonePe',
              vpa: guardian.upiId,
            },
          })
          return { kycStatus: 'verified', draftChildId: null, children: [mk('Aarav', '8-11'), mk('Ananya', '12-14'), mk('Rohan', '15-17')] }
        }),
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      migrate: (persisted) => ({ ...initial, ...(persisted as object) }),
    },
  ),
)

export const useActivePersona = () => personas[useStore((s) => s.activePersona)]

export function useDraftChild(): Child | undefined {
  return useStore((s) => s.children.find((c) => c.id === s.draftChildId))
}
