import type { StepId } from '../scenes'
import { AAmount, AArrives, AComplete, AHome, AJoin, AMilestone, AOutcome, APick, AWait } from './ananya'
import { PAdd, PApprovals, PCant, PControls, PDecision, PInvite, PKyc, PPocket, PWelcome } from './priya'
import type { ScreenComponent } from './shared'

/** One component per step, shared by the storyboard (static) and Play mode (live). */
export const screens: Record<StepId, ScreenComponent> = {
  'p-welcome': PWelcome,
  'p-cant': PCant,
  'p-add': PAdd,
  'p-kyc': PKyc,
  'p-controls': PControls,
  'p-pocket': PPocket,
  'p-invite': PInvite,
  'p-approvals': PApprovals,
  'p-decision': PDecision,
  'a-join': AJoin,
  'a-home': AHome,
  'a-pick': APick,
  'a-amount': AAmount,
  'a-arrives': AArrives,
  'a-milestone': AMilestone,
  'a-complete': AComplete,
  'a-ask': AComplete,
  'a-wait': AWait,
  'a-outcome': AOutcome,
}
