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
  jars: Jars
  /** Percent of each pocket-money drop that goes to each jar (sums to 100). */
  split: Jars
}

export interface Jars {
  spend: number
  save: number
  share: number
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
}

export interface Txn {
  id: string
  childId: string
  kind: 'pocket' | 'spend' | 'goal' | 'gift'
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
)

export interface Guardian {
  name: string
  phoneMasked: string
  panMasked: string
  bankMasked: string
  upiId: string
}
