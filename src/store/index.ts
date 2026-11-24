import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { personas, type PersonaId } from '../demo/personas'
import type { AgeBand } from '../theme/bands'
import { useCelebrations, type CelebrationEvent } from './celebrations'
import { moneySummary } from './money'
import { controlPresets, pocketMoneySuggestion } from './presets'
import { DEMO_MOBILE } from '../lib/brand'
import type { Account, Child, Controls, DeclineReason, Goal, Balances, Chore, Guardian, PocketMoney, Request, RiskProfile, Sim, SimSnapshot, Sip, Txn } from './types'

export type KycStatus = 'verified' | 'pending' | 'failed'

interface DemoState {
  activePersona: PersonaId
  kycStatus: KycStatus
  pocketMoneyLate: boolean
  declineNextSip: boolean
  demoDayOffset: number
  guardian: Guardian
  account: Account
  children: Child[]
  goals: Goal[]
  requests: Request[]
  transactions: Txn[]
  sims: Record<string, Sim>
  sips: Sip[]
  /** Lesson ids each child has finished (Learn tab). */
  learned: Record<string, string[]>
  chores: Chore[]
  /** Child currently being set up in the onboarding flow. */
  draftChildId: string | null
}

interface DemoActions {
  setPersona: (id: PersonaId) => void
  setScenario: (patch: Partial<Pick<DemoState, 'kycStatus' | 'pocketMoneyLate' | 'declineNextSip'>>) => void
  advanceDay: (days?: number) => void
  reset: () => void
  addChild: (name: string, ageBand: AgeBand, phone?: string) => string
  login: (mobile: string) => void
  completeSignup: (name: string) => void
  submitKyc: (pan: string) => void
  resolveKyc: (status: 'verified' | 'failed') => void
  childLogin: (childId: string, avatar: string) => void
  childLogout: (childId: string) => void
  updateChild: (id: string, patch: Partial<Omit<Child, 'id'>>) => void
  updateControls: (id: string, patch: Partial<Controls>) => void
  setPocketMoney: (id: string, pm: PocketMoney | null) => void
  loadDemoFamily: () => void
  // Flow 2: savings goals
  setSavingRate: (childId: string, savePercent: number) => void
  spendMoney: (childId: string, amount: number, category: string, label: string) => 'ok' | 'insufficient' | 'limit'
  addChore: (childId: string, title: string, reward: number) => void
  completeChore: (id: string) => void
  approveChore: (id: string) => void
  sendBackChore: (id: string) => void
  removeChore: (id: string) => void
  receivePocketMoney: (childId: string) => void
  addBonusToSave: (childId: string, amount: number) => void
  createGoal: (childId: string, t: { templateId: string; title: string; emoji: string; target: number; askParent: boolean }) => string
  requestMoney: (childId: string, amount: number, reason: string) => 'auto' | 'pending'
  requestGoalPurchase: (goalId: string) => 'auto' | 'pending'
  resolveRequest: (id: string, action: 'approve' | 'askLater', opts?: { amount?: number }) => void
  reask: (id: string) => void
  // Flow 3: simulator and real SIP
  simTrade: (childId: string, fundId: string, amount: number, side: 'buy' | 'sell') => void
  simAdvance: (childId: string, weeks: number) => void
  setQuiz: (childId: string, quiz: NonNullable<Sim['quiz']>) => void
  submitSip: (childId: string, p: { fundId: string; amount: number; profile: RiskProfile; snapshot: SimSnapshot; reasonChip?: string; resubmissionOf?: string }) => string
  decideSip: (id: string, d: { approve: true } | { approve: false; reasons: DeclineReason[]; note?: string; suggestedAmount?: number }) => void
  markSipSeen: (id: string) => void
  markGoalSeen: (id: string) => void
  markLearned: (childId: string, lessonId: string) => void
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
  account: { loggedIn: false, mobile: DEMO_MOBILE, isNew: false, kycSubmitted: true },
  children: [],
  goals: [],
  requests: [],
  transactions: [],
  sims: {},
  sips: [],
  learned: {},
  chores: [],
  draftChildId: null,
}

const defaultSplit: Record<AgeBand, Balances> = {
  '8-11': { spend: 50, save: 50 },
  '12-14': { spend: 60, save: 40 },
  '15-17': { spend: 60, save: 40 },
}
const uid = (p: string) => p + Math.random().toString(36).slice(2, 8)

function makeChild(name: string, ageBand: AgeBand, confirmed = false, phone?: string): Child {
  const n = name.trim()
  return {
    id: uid('c_'),
    name: n,
    ageBand,
    controls: { ...controlPresets[ageBand], isDefault: !confirmed },
    pocketMoney: null,
    inviteCode: `SIKKA-${n.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6)}-${Math.floor(1000 + Math.random() * 9000)}`,
    inviteStatus: 'sent',
    ...(phone ? { phone, loggedIn: false } : {}),
    money: { spend: 0, save: 0 },
    split: defaultSplit[ageBand],
  }
}

export function splitAmount(amount: number, split: Balances): Balances {
  const save = Math.round((amount * split.save) / 100)
  return { spend: amount - save, save }
}

/** The goal a child is currently working on or waiting on (at most one). */
export const currentGoalOf = (goals: Goal[], childId: string) =>
  goals.find((g) => g.childId === childId && g.status !== 'purchased')

const thresholdsReached = (saved: number, target: number) => [25, 50, 75, 100].filter((t) => (saved / target) * 100 >= t)

/** Pure: add money to a child and work out milestones. */
function deposit(s: DemoState, childId: string, parts: Balances, label: string, kind: Txn['kind']) {
  const child = s.children.find((c) => c.id === childId)
  if (!child) return null
  const money = { spend: child.money.spend + parts.spend, save: child.money.save + parts.save }
  const total = parts.spend + parts.save
  const events: CelebrationEvent[] = [{ id: uid('e_'), childId, kind: 'arrival', label, parts }]
  let goals = s.goals
  const goal = currentGoalOf(s.goals, childId)
  if (goal && goal.status === 'active') {
    const reached = thresholdsReached(money.save, goal.target)
    const fresh = reached.filter((t) => !goal.milestonesHit.includes(t))
    if (fresh.length) {
      const done = fresh.includes(100)
      goals = s.goals.map((g) => (g.id === goal.id ? { ...g, milestonesHit: reached, status: done ? 'complete' : 'active' } : g))
      events.push(done ? { id: uid('e_'), childId, kind: 'complete', goalId: goal.id } : { id: uid('e_'), childId, kind: 'milestone', goalId: goal.id, pct: Math.max(...fresh) })
    }
  }
  const patch: Partial<DemoState> = {
    children: s.children.map((c) => (c.id === childId ? { ...c, money } : c)),
    goals,
    transactions: [...s.transactions, { id: uid('t_'), childId, kind, amount: total, label, day: s.demoDayOffset }],
    ...(kind === 'pocket' ? { pocketMoneyLate: false } : {}),
  }
  return { patch, events }
}

/** Pure: mark a goal purchased and take its price out of Saved. */
function purchase(s: DemoState, goal: Goal): Partial<DemoState> {
  return {
    goals: s.goals.map((g) => (g.id === goal.id ? { ...g, status: 'purchased' } : g)),
    children: s.children.map((c) => (c.id === goal.childId ? { ...c, money: { ...c.money, save: Math.max(0, c.money.save - goal.target) } } : c)),
    transactions: [...s.transactions, { id: uid('t_'), childId: goal.childId, kind: 'goal', amount: -goal.target, label: goal.title, day: s.demoDayOffset }],
  }
}

export const SIM_CASH = 100000
export const SIM_START_WEEK = 12
export const defaultSim = (): Sim => ({ week: SIM_START_WEEK, cash: SIM_CASH, trades: [] })
/** Stable fallback for selectors (a fresh object each render would loop). */
export const EMPTY_SIM: Sim = defaultSim()
export const EMPTY_LEARNED: string[] = []

export const STORAGE_KEY = 'chiku-demo-v1'

export const useStore = create<DemoState & DemoActions>()(
  persist(
    (set, get) => ({
      ...initial,
      setPersona: (id) => set({ activePersona: id }),
      setScenario: (patch) => set(patch),
      advanceDay: (days = 1) => set((s) => ({ demoDayOffset: s.demoDayOffset + days })),
      reset: () => {
        useCelebrations.setState({ queue: [] })
        set({ ...initial })
      },
      login: (mobile) =>
        set((s) => ({
          account: { loggedIn: true, mobile, isNew: mobile !== DEMO_MOBILE, kycSubmitted: mobile === DEMO_MOBILE },
          kycStatus: mobile === DEMO_MOBILE ? 'verified' : 'pending',
          guardian: mobile === DEMO_MOBILE ? initial.guardian : { ...s.guardian, name: '', panMasked: '', phoneMasked: `+91 ${mobile.slice(0, 2)}•••• ${mobile.slice(-4)}` },
        })),
      completeSignup: (name) => set((s) => ({ guardian: { ...s.guardian, name: name.trim() } })),
      submitKyc: (pan) =>
        set((s) => ({
          account: { ...s.account, kycSubmitted: true },
          kycStatus: 'pending',
          guardian: { ...s.guardian, panMasked: `${pan.slice(0, 3)}••••${pan.slice(-1)}` },
        })),
      resolveKyc: (status) => set({ kycStatus: status }),
      childLogin: (childId, avatar) =>
        set((s) => ({ children: s.children.map((c) => (c.id === childId ? { ...c, avatar, loggedIn: true, inviteStatus: 'accepted' as const } : c)) })),
      childLogout: (childId) =>
        set((s) => ({ children: s.children.map((c) => (c.id === childId ? { ...c, loggedIn: false } : c)) })),
      addChild: (name, ageBand, phone) => {
        const child = makeChild(name, ageBand, false, phone)
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
          const mk = (n: string, b: AgeBand, money: Balances) => ({
            ...makeChild(n, b, true),
            inviteStatus: 'accepted' as const,
            money,
            pocketMoney: { ...pocketMoneySuggestion[b], mandate: 'active' as const, upiApp: 'PhonePe', vpa: guardian.upiId },
          })
          const aarav = mk('Aarav', '8-11', { spend: 150, save: 1500 })
          const ananya = mk('Ananya', '12-14', { spend: 400, save: 1100 })
          // Rohan has his own phone, so the demo starts with his invite not yet accepted and no login.
          const rohan = { ...mk('Rohan', '15-17', { spend: 600, save: 2000 }), inviteStatus: 'sent' as const, phone: '9812345678', loggedIn: false }
          const spend = (childId: string, category: string, amt: number, label: string, day: number) =>
            ({ id: uid('t_'), childId, kind: 'spend' as const, amount: -amt, label, category, day })
          const pocket = (childId: string, amt: number, day: number) =>
            ({ id: uid('t_'), childId, kind: 'pocket' as const, amount: amt, label: 'Pocket money', day })
          // Oldest first, with the last pocket money before the recent spends, so "spent since pocket money" reads right.
          const transactions = [
            spend(ananya.id, 'Friends', 40, 'Share a cab', -23),
            spend(ananya.id, 'Games', 100, 'Game top-up', -19),
            spend(ananya.id, 'Stationery', 80, 'Gel pens', -15),
            spend(ananya.id, 'Snacks', 70, 'Canteen lunch', -12),
            spend(ananya.id, 'Friends', 120, "Priyanka's birthday gift", -9),
            spend(ananya.id, 'Games', 150, 'In-app game pass', -7),
            pocket(aarav.id, 500, -6), pocket(ananya.id, 1500, -6), pocket(rohan.id, 2000, -6),
            spend(aarav.id, 'Snacks', 40, 'Ice cream', -4),
            spend(ananya.id, 'Snacks', 90, 'Bubble tea', -5),
            spend(rohan.id, 'Sports', 150, 'Cricket nets', -3),
            spend(ananya.id, 'Snacks', 60, 'Samosa and chai with friends', -2),
            spend(aarav.id, 'Stationery', 30, 'Sticker pack', -1),
            spend(rohan.id, 'Snacks', 80, 'Lunch with friends', -1),
          ]
          const chore = (childId: string, title: string, reward: number, status: 'todo' | 'review' = 'todo') =>
            ({ id: uid('k_'), childId, title, reward, status, createdDay: -2 })
          return {
            kycStatus: 'verified' as const,
            account: { loggedIn: true, mobile: DEMO_MOBILE, isNew: false, kycSubmitted: true },
            guardian: initial.guardian,
            draftChildId: null,
            children: [aarav, ananya, rohan],
            requests: [],
            sips: [],
            sims: {
              [rohan.id]: {
                week: SIM_START_WEEK,
                cash: SIM_CASH - 80000,
                trades: [
                  { week: 0, fundId: 'flexi', amount: 50000, side: 'buy' as const },
                  { week: 4, fundId: 'mid', amount: 30000, side: 'buy' as const },
                ],
              },
            },
            goals: [
              {
                id: uid('g_'), childId: ananya.id, templateId: 'headphones', title: 'Headphones', emoji: '🎧', target: 2499,
                status: 'active' as const, milestonesHit: thresholdsReached(ananya.money.save, 2499), createdDay: -10,
              },
            ],
            transactions,
            chores: [
              chore(aarav.id, 'Make my bed', 20), chore(aarav.id, 'Water the plants', 30), chore(aarav.id, 'Tidy my toys', 30, 'review'),
              chore(ananya.id, 'Help with dinner', 50), chore(ananya.id, 'Organise my study desk', 40),
              chore(rohan.id, 'Wash the car', 100),
            ],
          }
        })
      },

      setSavingRate: (childId, savePercent) =>
        set((s) => ({ children: s.children.map((c) => (c.id === childId ? { ...c, split: { spend: 100 - savePercent, save: savePercent } } : c)) })),

      spendMoney: (childId, amount, category, label) => {
        const s = get()
        const child = s.children.find((c) => c.id === childId)
        if (!child || amount > child.money.spend) return 'insufficient'
        const { spent } = moneySummary(child, s.transactions, s.demoDayOffset)
        if (spent + amount > child.controls.spendLimit) return 'limit'
        set({
          children: s.children.map((c) => (c.id === childId ? { ...c, money: { ...c.money, spend: c.money.spend - amount } } : c)),
          transactions: [...s.transactions, { id: uid('t_'), childId, kind: 'spend', amount: -amount, label, category, day: s.demoDayOffset }],
        })
        return 'ok'
      },

      addChore: (childId, title, reward) =>
        set((s) => ({ chores: [...s.chores, { id: uid('k_'), childId, title: title.trim(), reward, status: 'todo', createdDay: s.demoDayOffset }] })),
      completeChore: (id) =>
        set((s) => ({ chores: s.chores.map((k) => (k.id === id && k.status === 'todo' ? { ...k, status: 'review' as const } : k)) })),
      sendBackChore: (id) =>
        set((s) => ({ chores: s.chores.map((k) => (k.id === id && k.status === 'review' ? { ...k, status: 'todo' as const } : k)) })),
      removeChore: (id) => set((s) => ({ chores: s.chores.filter((k) => k.id !== id) })),
      approveChore: (id) => {
        const s = get()
        const chore = s.chores.find((k) => k.id === id)
        if (!chore || chore.status !== 'review') return
        const r = deposit(s, chore.childId, { spend: chore.reward, save: 0 }, `Task: ${chore.title}`, 'chore')
        if (!r) return
        set({ ...r.patch, chores: s.chores.map((k) => (k.id === id ? { ...k, status: 'paid' as const } : k)) })
        useCelebrations.getState().push(r.events)
      },

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
        const r = deposit(get(), childId, { spend: 0, save: amount }, 'Gift', 'gift')
        if (!r) return
        set(r.patch)
        useCelebrations.getState().push(r.events)
      },

      createGoal: (childId, t) => {
        const s = get()
        const child = s.children.find((c) => c.id === childId)
        const id = uid('g_')
        const saved = child?.money.save ?? 0
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
          const r = deposit(s, childId, { spend: amount, save: 0 }, `From ${s.guardian.name.split(' ')[0]}: ${reason}`, 'gift')
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
        if (req.kind === 'sip') return
        if (action === 'askLater') {
          set({ requests: setStatus('askLater', { retryAfterDay: s.demoDayOffset + 1 }) })
          return
        }
        if (req.kind === 'money') {
          const r = deposit(s, req.childId, { spend: req.amount, save: 0 }, `From ${s.guardian.name.split(' ')[0]}: ${req.reason}`, 'gift')
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
          const reached = thresholdsReached(child.money.save, target)
          const done = reached.includes(100)
          set({
            goals: s.goals.map((g) => (g.id === goal.id ? { ...g, target, milestonesHit: reached, status: done ? 'complete' : 'active' } : g)),
            requests: setStatus('approved'),
          })
          if (done) useCelebrations.getState().push([{ id: uid('e_'), childId: child.id, kind: 'complete', goalId: goal.id }])
        }
      },

      simTrade: (childId, fundId, amount, side) =>
        set((s) => {
          const sim = s.sims[childId] ?? defaultSim()
          if (side === 'buy' && amount > sim.cash) return {}
          return {
            sims: {
              ...s.sims,
              [childId]: { ...sim, cash: sim.cash + (side === 'buy' ? -amount : amount), trades: [...sim.trades, { week: sim.week, fundId, amount, side }] },
            },
          }
        }),
      simAdvance: (childId, weeks) =>
        set((s) => {
          const sim = s.sims[childId] ?? defaultSim()
          return { sims: { ...s.sims, [childId]: { ...sim, week: Math.min(104, sim.week + weeks) } } }
        }),
      setQuiz: (childId, quiz) =>
        set((s) => ({ sims: { ...s.sims, [childId]: { ...(s.sims[childId] ?? defaultSim()), quiz } } })),

      submitSip: (childId, p) => {
        const s = get()
        const id = uid('r_')
        const decline = s.declineNextSip
        const req: Request = {
          id, childId, kind: 'sip', fundId: p.fundId, amount: p.amount, dayOfMonth: 5, profile: p.profile,
          snapshot: p.snapshot, reasonChip: p.reasonChip, resubmissionOf: p.resubmissionOf,
          status: decline ? 'declined' : 'pending', createdDay: s.demoDayOffset,
          ...(decline ? { decision: { reasons: ['tooRisky' as const], note: 'Auto-declined by the demo toolbar', decidedDay: s.demoDayOffset } } : {}),
        }
        set({ requests: [...s.requests, req], declineNextSip: false })
        return id
      },

      decideSip: (id, d) => {
        const s = get()
        const req = s.requests.find((r) => r.id === id)
        if (!req || req.kind !== 'sip') return
        if (d.approve) {
          set({
            requests: s.requests.map((r) => (r.id === id ? { ...r, status: 'approved' as const } : r)),
            sips: [...s.sips, { id: uid('s_'), childId: req.childId, fundId: req.fundId, amount: req.amount, dayOfMonth: req.dayOfMonth, startedDay: s.demoDayOffset }],
          })
        } else {
          set({
            requests: s.requests.map((r) =>
              r.id === id && r.kind === 'sip'
                ? { ...r, status: 'declined' as const, decision: { reasons: d.reasons, note: d.note, suggestedAmount: d.suggestedAmount, decidedDay: s.demoDayOffset } }
                : r,
            ),
          })
        }
      },
      markGoalSeen: (id) => set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, seen: true } : g)) })),
      markLearned: (childId, lessonId) =>
        set((s) => {
          const done = s.learned[childId] ?? []
          return done.includes(lessonId) ? {} : { learned: { ...s.learned, [childId]: [...done, lessonId] } }
        }),
      markSipSeen: (id) =>
        set((s) => ({ requests: s.requests.map((r) => (r.id === id && r.kind === 'sip' ? { ...r, seen: true } : r)) })),

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
      version: 6,
      // Never let a corrupted or hand-edited saved state crash the app: fall back per field.
      merge: (persisted, current) => {
        const p = (persisted && typeof persisted === 'object' ? persisted : {}) as Partial<DemoState>
        const arr = <T,>(v: unknown, d: T[]) => (Array.isArray(v) ? (v as T[]) : d)
        return {
          ...current,
          ...p,
          children: arr(p.children, current.children),
          goals: arr(p.goals, current.goals),
          requests: arr(p.requests, current.requests),
          transactions: arr(p.transactions, current.transactions),
          sips: arr(p.sips, current.sips),
          sims: p.sims && typeof p.sims === 'object' ? p.sims : current.sims,
          account: p.account && typeof p.account === 'object' ? p.account : current.account,
          learned: p.learned && typeof p.learned === 'object' ? p.learned : current.learned,
          chores: arr(p.chores, current.chores),
        }
      },
      migrate: (persisted) => {
        const p = { ...initial, ...(persisted as object) } as DemoState
        p.sims = p.sims ?? {}
        p.sips = p.sips ?? []
        // v6: three jars (spend/save/share) became two balances. Share folds into Can spend.
        p.chores = p.chores ?? []
        p.children = p.children.map((c) => {
          const old = c as unknown as { jars?: { spend?: number; save?: number; share?: number }; split?: { share?: number } }
          const money = c.money ?? { spend: (old.jars?.spend ?? 0) + (old.jars?.share ?? 0), save: old.jars?.save ?? 0 }
          const split = old.split && 'share' in old.split ? defaultSplit[c.ageBand] : (c.split ?? defaultSplit[c.ageBand])
          const { jars: _drop, ...rest } = c as unknown as Record<string, unknown>
          void _drop
          return { ...(rest as unknown as Child), money, split }
        })
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
