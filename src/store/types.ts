import type { AgeBand } from '../theme/bands'

export type NotifySpends = 'every' | 'large' | 'off'

export interface Controls {
  /** Monthly cap on what the child can spend from the Spend jar. */
  spendLimit: number
  /** Goal purchases above this need approval. 0 = every purchase. */
  goalPurchaseAbove: number
  /** Extra-money requests above this need approval. */
  extraMoneyAbove: number
  notifySpends: NotifySpends
  weeklySummary: boolean
  /** True until the parent confirms or edits the preset (e.g. they skipped). */
  isDefault: boolean
}

export interface PocketMoney {
  amount: number
  dayOfMonth: number
  mandate: 'active' | 'none'
  upiApp?: string
  vpa?: string
}

export interface Child {
  id: string
  name: string
  ageBand: AgeBand
  controls: Controls
  pocketMoney: PocketMoney | null
  inviteCode: string
  inviteStatus: 'sent' | 'accepted'
  avatar?: string
  /** Own-phone children (15-17) log in with this number. Younger children use a parent's phone. */
  phone?: string
  /** Own-phone children only: has completed the invite login on their own device. */
  loggedIn?: boolean
  /** What the child has: `spend` is available to spend now, `save` is kept for goals. */
  money: Balances
  /** Percent of each pocket-money drop that goes to `spend` and `save` (sums to 100). */
  split: Balances
}

export interface Balances {
  spend: number
  save: number
}

export type ChoreStatus = 'todo' | 'review' | 'paid'

/** A task a parent sets for a child. Doing it and getting it approved pays `reward` into Can spend. */
export interface Chore {
  id: string
  childId: string
  title: string
  reward: number
  status: ChoreStatus
  createdDay: number
}

export type GoalStatus = 'pendingParent' | 'active' | 'complete' | 'awaitingApproval' | 'purchased'

export interface Goal {
  id: string
  childId: string
  templateId: string
  title: string
  emoji: string
  target: number
  status: GoalStatus
  /** Milestone percentages already reached or celebrated. */
  milestonesHit: number[]
  createdDay: number
  /** Child has seen the "approved" celebration. */
  seen?: boolean
}

export interface Txn {
  id: string
  childId: string
  kind: 'pocket' | 'spend' | 'goal' | 'gift' | 'chore'
  /** Signed: positive adds money, negative removes it. */
  amount: number
  label: string
  category?: string
  /** Demo-clock day (0 = today, -3 = three days ago). */
  day: number
}

export type RequestStatus = 'pending' | 'approved' | 'declined' | 'askLater'

export type Request = {
  id: string
  childId: string
  status: RequestStatus
  createdDay: number
  /** Set when a parent says "ask again tomorrow". */
  retryAfterDay?: number
} & (
  | { kind: 'money'; amount: number; reason: string }
  | { kind: 'goalPurchase'; goalId: string; amount: number }
  | { kind: 'goalAmount'; goalId: string }
  | SipRequestBody
)

export type RiskProfile = 'conservative' | 'balanced' | 'growth'
export type DeclineReason = 'tooRisky' | 'wait' | 'smaller'

export interface SimTrade {
  week: number
  fundId: string
  amount: number
  side: 'buy' | 'sell'
}

/** Practice portfolio with virtual money. `week` is the simulator's "now" on the mock market. */
export interface Sim {
  week: number
  cash: number
  trades: SimTrade[]
  quiz?: { profile: RiskProfile; score: number }
}

/** Simulator history frozen at the moment the request was sent. */
export interface SimSnapshot {
  weeks: number
  invested: number
  gain: number
  returnPct: number
  indexReturnPct: number
  portfolio: number[]
  index: number[]
}

export interface SipRequestBody {
  kind: 'sip'
  fundId: string
  amount: number
  dayOfMonth: number
  profile: RiskProfile
  snapshot: SimSnapshot
  reasonChip?: string
  resubmissionOf?: string
  decision?: { reasons: DeclineReason[]; note?: string; suggestedAmount?: number; decidedDay: number }
  /** Child has opened the approval confirmation. */
  seen?: boolean
}

export interface Sip {
  id: string
  childId: string
  fundId: string
  amount: number
  dayOfMonth: number
  startedDay: number
}

/** The guardian's login on this app, shared with the parent app's login and KYC. */
export interface Account {
  loggedIn: boolean
  mobile: string
  /** True when the number has no parent-app account yet, so sign-up and KYC are needed. */
  isNew: boolean
  kycSubmitted: boolean
}

export interface Guardian {
  name: string
  phoneMasked: string
  panMasked: string
  bankMasked: string
  upiId: string
}
