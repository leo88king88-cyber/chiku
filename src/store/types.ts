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
}

export interface Guardian {
  name: string
  phoneMasked: string
  panMasked: string
  bankMasked: string
  upiId: string
}
