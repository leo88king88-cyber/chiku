import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { personas, type PersonaId } from '../demo/personas'
import type { AgeBand } from '../theme/bands'
import { useCelebrations, type CelebrationEvent } from './celebrations'
import { controlPresets, pocketMoneySuggestion } from './presets'
import type { Child, Controls, Goal, Guardian, Jars, PocketMoney, Request, Txn } from './types'

export type KycStatus = 'verified' | 'pending' | 'failed'

interface DemoState {
  activePersona: PersonaId
  kycStatus: KycStatus
  pocketMoneyLate: boolean
  declineNextSip: boolean
  demoDayOffset: number
  guardian: Guardian
  children: Child[]
  goals: Goal[]
  requests: Request[]
  transactions: Txn[]
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
  // Flow 2: savings goals
  setSplit: (childId: string, split: Jars) => void
  receivePocketMoney: (childId: string) => void
  addBonusToSave: (childId: string, amount: number) => void
  createGoal: (childId: string, t: { templateId: string; title: string; emoji: string; target: number; askParent: boolean }) => string
  requestMoney: (childId: string, amount: number, reason: string) => 'auto' | 'pending'
  requestGoalPurchase: (goalId: string) => 'auto' | 'pending'
  resolveRequest: (id: string, action: 'approve' | 'askLater', opts?: { amount?: number }) => void
  reask: (id: string) => void
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
  goals: [],
  requests: [],
  transactions: [],
  draftChildId: null,
}

const defaultSplit: Record<AgeBand, Jars> = {
  '8-11': { spend: 40, save: 50, share: 10 },
  '12-14': { spend: 50, save: 40, share: 10 },
  '15-17': { spend: 50, save: 40, share: 10 },
}
const uid = (p: string) => p + Math.random().toString(36).slice(2, 8)

function makeChild(name: string, ageBand: AgeBand, confirmed = false): Child {
  const n = name.trim()
  return {
    id: uid('c_'),
    name: n,
    ageBand,
    controls: { ...controlPresets[ageBand], isDefault: !confirmed },
    pocketMoney: null,
    inviteCode: `CHIKU-${n.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6)}-${Math.floor(1000 + Math.random() * 9000)}`,
    inviteStatus: 'sent',
    jars: { spend: 0, save: 0, share: 0 },
    split: defaultSplit[ageBand],
  }
}

export function splitAmount(amount: number, split: Jars): Jars {
  const spend = Math.round((amount * split.spend) / 100)
  const share = Math.round((amount * split.share) / 100)
  return { spend, share, save: amount - spend - share }
}

/** The goal a child is currently working on or waiting on (at most one). */
export const currentGoalOf = (goals: Goal[], childId: string) =>
  goals.find((g) => g.childId === childId && g.status !== 'purchased')

const thresholdsReached = (saved: number, target: number) => [25, 50, 75, 100].filter((t) => (saved / target) * 100 >= t)

/** Pure: apply a deposit to a child's jars and work out milestones. */
function deposit(s: DemoState, childId: string, parts: Jars, label: string, kind: Txn['kind']) {
  const child = s.children.find((c) => c.id === childId)
  if (!child) return null
  const jars = { spend: child.jars.spend + parts.spend, save: child.jars.save + parts.save, share: child.jars.share + parts.share }
  const total = parts.spend + parts.save + parts.share
  const events: CelebrationEvent[] = [{ id: uid('e_'), childId, kind: 'arrival', label, parts }]
  let goals = s.goals
  const goal = currentGoalOf(s.goals, childId)
  if (goal && goal.status === 'active') {
    const reached = thresholdsReached(jars.save, goal.target)
    const fresh = reached.filter((t) => !goal.milestonesHit.includes(t))
    if (fresh.length) {
      const done = fresh.includes(100)
      goals = s.goals.map((g) => (g.id === goal.id ? { ...g, milestonesHit: reached, status: done ? 'complete' : 'active' } : g))
      events.push(done ? { id: uid('e_'), childId, kind: 'complete', goalId: goal.id } : { id: uid('e_'), childId, kind: 'milestone', goalId: goal.id, pct: Math.max(...fresh) })
    }
  }
  const patch: Partial<DemoState> = {
    children: s.children.map((c) => (c.id === childId ? { ...c, jars } : c)),
    goals,
    transactions: [...s.transactions, { id: uid('t_'), childId, kind, amount: total, label, day: s.demoDayOffset }],
    ...(kind === 'pocket' ? { pocketMoneyLate: false } : {}),
  }
  return { patch, events }
}

/** Pure: mark a goal purchased and take its price out of the Save jar. */
function purchase(s: DemoState, goal: Goal): Partial<DemoState> {
  return {
    goals: s.goals.map((g) => (g.id === goal.id ? { ...g, status: 'purchased' } : g)),
    children: s.children.map((c) => (c.id === goal.childId ? { ...c, jars: { ...c.jars, save: Math.max(0, c.jars.save - goal.target) } } : c)),
    transactions: [...s.transactions, { id: uid('t_'), childId: goal.childId, kind: 'goal', amount: -goal.target, label: goal.title, day: s.demoDayOffset }],
  }
}

export const STORAGE_KEY = 'chiku-demo-v1'

export const useStore = create<DemoState & DemoActions>()(
  persist(
    (set, get) => ({
      ...initial,
      setPersona: (id) => set({ activePersona: id }),
      setScenario: (patch) => set(patch),
      advanceDay: () => set((s) => ({ demoDayOffset: s.demoDayOffset + 1 })),
      reset: () => {
        useCelebrations.setState({ queue: [] })
        set({ ...initial })
      },
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

      loadDemoFamily: () => {
        useCelebrations.setState({ queue: [] })
        set(() => {
          const mk = (n: string, b: AgeBand, jars: Jars, split = defaultSplit[b]) => ({
            ...makeChild(n, b, true),
            inviteStatus: 'accepted' as const,
            jars,
            split,
            pocketMoney: { ...pocketMoneySuggestion[b], mandate: 'active' as const, upiApp: 'PhonePe', vpa: guardian.upiId },
          })
          const aarav = mk('Aarav', '8-11', { spend: 120, save: 1500, share: 30 })
          const ananya = mk('Ananya', '12-14', { spend: 340, save: 1100, share: 60 }, { spend: 50, save: 40, share: 10 })
          const rohan = mk('Rohan', '15-17', { spend: 500, save: 2000, share: 100 })
          const spends: [string, number, string, number][] = [
            ['Snacks', 60, 'Samosa and chai with friends', -2],
            ['Snacks', 90, 'Bubble tea', -5],
            ['Games', 150, 'In-app game pass', -7],
            ['Friends', 120, "Priyanka's birthday gift", -9],
            ['Snacks', 70, 'Canteen lunch', -12],
            ['Stationery', 80, 'Gel pens', -15],
            ['Games', 100, 'Game top-up', -19],
            ['Friends', 40, 'Share a cab', -23],
          ]
          return {
            kycStatus: 'verified' as const,
            draftChildId: null,
            children: [aarav, ananya, rohan],
            requests: [],
            goals: [
              {
                id: uid('g_'), childId: ananya.id, templateId: 'headphones', title: 'Headphones', emoji: '🎧', target: 2499,
                status: 'active' as const, milestonesHit: thresholdsReached(ananya.jars.save, 2499), createdDay: -10,
              },
            ],
            transactions: spends.map(([category, amt, label, day]) => ({ id: uid('t_'), childId: ananya.id, kind: 'spend' as const, amount: -amt, label, category, day })),
          }
        })
      },

      setSplit: (childId, split) =>
        set((s) => ({ children: s.children.map((c) => (c.id === childId ? { ...c, split } : c)) })),

      receivePocketMoney: (childId) => {
        const s = get()
        const child = s.children.find((c) => c.id === childId)
        if (!child?.pocketMoney) return
        const r = deposit(s, childId, splitAmount(child.pocketMoney.amount, child.split), 'Pocket money', 'pocket')
        if (!r) return
        set(r.patch)
        useCelebrations.getState().push(r.events)
      },
      addBonusToSave: (childId, amount) => {
        const r = deposit(get(), childId, { spend: 0, save: amount, share: 0 }, 'Birthday money', 'gift')
        if (!r) return
        set(r.patch)
        useCelebrations.getState().push(r.events)
      },

      createGoal: (childId, t) => {
        const s = get()
        const child = s.children.find((c) => c.id === childId)
        const id = uid('g_')
        const saved = child?.jars.save ?? 0
        const reached = t.askParent ? [] : thresholdsReached(saved, t.target)
        const done = reached.includes(100)
        const goal: Goal = {
          id, childId, templateId: t.templateId, title: t.title, emoji: t.emoji, target: t.target,
          status: t.askParent ? 'pendingParent' : done ? 'complete' : 'active',
          milestonesHit: reached, createdDay: s.demoDayOffset,
        }
        const requests: Request[] = t.askParent
          ? [...s.requests, { id: uid('r_'), childId, kind: 'goalAmount', goalId: id, status: 'pending', createdDay: s.demoDayOffset }]
          : s.requests
        set({ goals: [...s.goals, goal], requests })
        if (done) useCelebrations.getState().push([{ id: uid('e_'), childId, kind: 'complete', goalId: id }])
        return id
      },

      requestMoney: (childId, amount, reason) => {
        const s = get()
        const child = s.children.find((c) => c.id === childId)
        if (!child) return 'pending'
        if (amount <= child.controls.extraMoneyAbove) {
          const r = deposit(s, childId, { spend: amount, save: 0, share: 0 }, `From ${s.guardian.name.split(' ')[0]}: ${reason}`, 'gift')
          if (r) {
            set({ ...r.patch, requests: [...s.requests, { id: uid('r_'), childId, kind: 'money', amount, reason, status: 'approved', createdDay: s.demoDayOffset }] })
          }
          return 'auto'
        }
        set({ requests: [...s.requests, { id: uid('r_'), childId, kind: 'money', amount, reason, status: 'pending', createdDay: s.demoDayOffset }] })
        return 'pending'
      },

      requestGoalPurchase: (goalId) => {
        const s = get()
        const goal = s.goals.find((g) => g.id === goalId)
        const child = s.children.find((c) => c.id === goal?.childId)
        if (!goal || !child) return 'pending'
        const needs = child.controls.goalPurchaseAbove === 0 || goal.target > child.controls.goalPurchaseAbove
        if (!needs) {
          set(purchase(s, goal))
          return 'auto'
        }
        set({
          goals: s.goals.map((g) => (g.id === goalId ? { ...g, status: 'awaitingApproval' } : g)),
          requests: [...s.requests, { id: uid('r_'), childId: goal.childId, kind: 'goalPurchase', goalId, amount: goal.target, status: 'pending', createdDay: s.demoDayOffset }],
        })
        return 'pending'
      },

      resolveRequest: (id, action, opts) => {
        const s = get()
        const req = s.requests.find((r) => r.id === id)
        if (!req) return
        const setStatus = (status: Request['status'], extra: Partial<Request> = {}) =>
          s.requests.map((r) => (r.id === id ? ({ ...r, status, ...extra } as Request) : r))
        if (action === 'askLater') {
          set({ requests: setStatus('askLater', { retryAfterDay: s.demoDayOffset + 1 }) })
          return
        }
        if (req.kind === 'money') {
          const r = deposit(s, req.childId, { spend: req.amount, save: 0, share: 0 }, `From ${s.guardian.name.split(' ')[0]}: ${req.reason}`, 'gift')
          if (r) {
            set({ ...r.patch, requests: setStatus('approved') })
            useCelebrations.getState().push(r.events)
          }
        } else if (req.kind === 'goalPurchase') {
          const goal = s.goals.find((g) => g.id === req.goalId)
          if (goal) set({ ...purchase(s, goal), requests: setStatus('approved') })
        } else {
          const goal = s.goals.find((g) => g.id === req.goalId)
          const child = s.children.find((c) => c.id === req.childId)
          if (!goal || !child) return
          const target = opts?.amount ?? goal.target
          const reached = thresholdsReached(child.jars.save, target)
          const done = reached.includes(100)
          set({
            goals: s.goals.map((g) => (g.id === goal.id ? { ...g, target, milestonesHit: reached, status: done ? 'complete' : 'active' } : g)),
            requests: setStatus('approved'),
          })
          if (done) useCelebrations.getState().push([{ id: uid('e_'), childId: child.id, kind: 'complete', goalId: goal.id }])
        }
      },

      reask: (id) =>
        set((s) => ({
          requests: s.requests.map((r) =>
            r.id === id && r.status === 'askLater' && s.demoDayOffset >= (r.retryAfterDay ?? 0)
              ? { ...r, status: 'pending' as const, createdDay: s.demoDayOffset, retryAfterDay: undefined }
              : r,
          ),
        })),
    }),
    {
      name: STORAGE_KEY,
      version: 3,
      migrate: (persisted) => {
        const p = { ...initial, ...(persisted as object) } as DemoState
        p.children = p.children.map((c) => ({ ...c, jars: c.jars ?? { spend: 0, save: 0, share: 0 }, split: c.split ?? defaultSplit[c.ageBand] }))
        return p
      },
    },
  ),
)

export const useActivePersona = () => personas[useStore((s) => s.activePersona)]

export function useDraftChild(): Child | undefined {
  return useStore((s) => s.children.find((c) => c.id === s.draftChildId))
}

/** The child the active persona is playing: matched by name, else by age band. */
export function useActiveChild(): Child | undefined {
  const persona = useActivePersona()
  return useStore((s) => {
    if (persona.view !== 'child') return undefined
    const bandOf = { kid: '8-11', teen: '12-14', pro: '15-17' } as const
    return (
      s.children.find((c) => c.name.toLowerCase() === persona.name.toLowerCase()) ??
      s.children.find((c) => c.ageBand === bandOf[persona.band])
    )
  })
}
