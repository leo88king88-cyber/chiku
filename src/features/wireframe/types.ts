import type { Jars } from '../../store/types'

export type PersonaKey = 'priya' | 'ananya'
export type FlowKey = 'parent' | 'child'
export type Fidelity = 'styled' | 'wire'

/** The goal lifecycle shown in Ananya's flow. */
export type GoalPhase = 'active' | 'milestone' | 'completed' | 'unlockRequested' | 'unlocked' | 'declined'
export type UnlockDeclineReason = 'tooExpensive' | 'notNow' | 'differentGoal'

export interface WireGoal {
  templateId: string
  title: string
  emoji: string
  target: number
  phase: GoalPhase
}

export interface WireState {
  kyc: 'verified' | 'pending' | 'failed'
  controlsSkipped: boolean
  pocketLate: boolean
  avatar: string
  pocket: { amount: number; day: number; autopay: boolean }
  jars: Jars
  split: Jars
  goal: WireGoal | null
  /** Waiting on the parent to fill in the price instead of the child. */
  askedParentForPrice: boolean
  unlock: { askLater: boolean; decline?: { reason: UnlockDeclineReason; note?: string } }
}

export type WireEvent =
  | { type: 'SET'; patch: Partial<WireState> }
  | { type: 'CREATE_GOAL'; templateId: string; title: string; emoji: string; target: number; askParent: boolean }
  | { type: 'DEPOSIT'; amount: number }
  | { type: 'REQUEST_UNLOCK' }
  | { type: 'APPROVE' }
  | { type: 'ASK_LATER' }
  | { type: 'DECLINE'; reason: UnlockDeclineReason; note?: string }
  | { type: 'REASK' }
  | { type: 'NEW_GOAL' }
