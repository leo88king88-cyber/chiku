import type { FlowKey, WireState } from './types'
import { SPLIT_DEFAULT } from './machine'

export type StepId =
  | 'p-welcome' | 'p-cant' | 'p-add' | 'p-kyc' | 'p-controls' | 'p-pocket' | 'p-invite' | 'p-approvals' | 'p-decision'
  | 'a-join' | 'a-home' | 'a-pick' | 'a-amount' | 'a-arrives' | 'a-milestone' | 'a-complete' | 'a-ask' | 'a-wait' | 'a-outcome'

/** Fresh state: Ananya has already been added, with her usual jars and no goal. */
export const baseState = (): WireState => ({
  kyc: 'verified',
  controlsSkipped: false,
  pocketLate: false,
  avatar: '🦊',
  pocket: { amount: 1500, day: 1, autopay: false },
  jars: { spend: 340, save: 1100, share: 60 },
  split: SPLIT_DEFAULT,
  goal: null,
  askedParentForPrice: false,
  unlock: { askLater: false },
})

const HEADPHONES = { templateId: 'headphones', title: 'Headphones', emoji: '🎧', target: 2499 }
const goal = (phase: NonNullable<WireState['goal']>['phase']) => ({ ...HEADPHONES, phase })

export interface Variant {
  id: string
  label: string
  /** Patches the step's base state to show this variant. */
  state?: Partial<WireState>
  /** Which overlay or sub-view the screen should open in. */
  view?: string
}

export interface Step {
  id: StepId
  flow: FlowKey
  n: number
  title: string
  /** State that exists when the user arrives at this step. */
  state: Partial<WireState>
  variants: Variant[]
  does: string
  why: string
  states: string
  connector?: { dir: 'to' | 'from'; step: StepId; label: string }
}

const live = { pocket: { amount: 1500, day: 1, autopay: true } }
const heard = { jars: { spend: 790, save: 2900, share: 210 } }

export const steps: Step[] = [
  // ───────────── Flow 1: Priya (parent, 38)
  {
    id: 'p-welcome', flow: 'parent', n: 1, title: 'Welcome', state: {},
    variants: [{ id: 'default', label: 'Default' }],
    does: 'Reads the promise and taps “Get started”.',
    why: 'Three one-line promises answer “is it safe, and do I stay in control?” before we ask for anything. One primary action, and “about 2 minutes” sets the cost up front.',
    states: 'Returning parents skip this screen. Back leads to the dashboard.',
  },
  {
    id: 'p-cant', flow: 'parent', n: 2, title: 'Can and can never', state: {},
    variants: [{ id: 'default', label: 'Default' }],
    does: 'Reads what Ananya can do and the hard limits.',
    why: 'Trust is the adoption blocker. Showing the “can never” list (no F&O, margin or crypto) before any data entry lets a cautious parent say yes with eyes open. The market-risk line is there from the first minute.',
    states: 'Static content. The risk disclosure is always visible.',
  },
  {
    id: 'p-add', flow: 'parent', n: 3, title: 'Add your child', state: {},
    variants: [{ id: 'default', label: 'Filled in' }],
    does: 'Types a first name and picks an age band.',
    why: 'An age band is enough to choose limits and the app’s look, and it is faster than a date of birth. Each card previews how the child’s app will feel, so Priya sees the value of the choice.',
    states: 'Continue is disabled until valid. Going back edits the same child, never a duplicate. A second child re-enters here and skips KYC.',
  },
  {
    id: 'p-kyc', flow: 'parent', n: 4, title: 'Guardian KYC', state: {},
    variants: [
      { id: 'verified', label: 'Verified', state: { kyc: 'verified' } },
      { id: 'pending', label: 'Pending', state: { kyc: 'pending' } },
      { id: 'failed', label: 'Failed', state: { kyc: 'failed' } },
    ],
    does: 'Waits a moment while we check her existing account. Nothing to type or upload.',
    why: 'Priya already completed KYC on the main platform. Reusing it removes the biggest drop-off in guardian onboarding, and “verified from your existing account” says so plainly.',
    states: 'Verified. Pending: keep going, real investing stays locked. Failed: reason, retry, or continue without investing. A short “checking” spinner shows first.',
  },
  {
    id: 'p-controls', flow: 'parent', n: 5, title: 'Controls', state: {},
    variants: [
      { id: 'summary', label: 'Recommended' },
      { id: 'skipped', label: 'Skipped', state: { controlsSkipped: true } },
    ],
    does: 'Accepts the preset for ages 12 to 14 with one tap, or customises it.',
    why: 'Smart defaults make the common path one tap. A plain-language “why these settings” builds trust. Investing approval is shown locked on, so the safety promise is visible, not buried.',
    states: 'Summary, customise, and skip. Skipping applies safe defaults and flags them for review on the dashboard.',
  },
  {
    id: 'p-pocket', flow: 'parent', n: 6, title: 'Pocket money', state: {},
    variants: [
      { id: 'set', label: 'Set up' },
      { id: 'upi', label: 'UPI sheet', view: 'upi' },
    ],
    does: 'Confirms ₹1,500 on the 1st and approves UPI AutoPay.',
    why: 'A UPI mandate is a pattern Priya already trusts. The amount is capped at the mandate, and the PIN step mirrors a real UPI app, so it feels safe and familiar.',
    states: 'UPI sheet: pick app, approve mandate, PIN, done. “I’ll do this later” skips and the dashboard reminds her.',
  },
  {
    id: 'p-invite', flow: 'parent', n: 7, title: 'Invite sent', state: { ...live },
    variants: [
      { id: 'default', label: 'AutoPay on' },
      { id: 'skipped', label: 'Skipped', state: { pocket: { amount: 1500, day: 1, autopay: false }, controlsSkipped: true } },
    ],
    does: 'Shares Ananya’s invite code on WhatsApp.',
    why: 'A kid joins from her own phone, so the invite is a code that doubles as a link. A short recap confirms exactly what was set up.',
    states: 'Notes change if pocket money or controls were skipped. Share falls back to copying the text on desktop.',
  },
  {
    id: 'p-approvals', flow: 'parent', n: 8, title: 'Approvals', state: { ...live, ...heard, goal: goal('unlockRequested') },
    variants: [
      { id: 'pending', label: 'Request waiting' },
      { id: 'empty', label: 'All caught up', state: { goal: null } },
    ],
    does: 'Sees Ananya’s unlock request with the goal and amount saved.',
    why: 'One list holds every request, and the card carries all the context needed to decide without opening anything else.',
    states: 'Request waiting, and an empty “all caught up” state.',
    connector: { dir: 'from', step: 'a-ask', label: 'From Ananya, step 8' },
  },
  {
    id: 'p-decision', flow: 'parent', n: 9, title: 'Decide', state: { ...live, ...heard, goal: goal('unlockRequested') },
    variants: [
      { id: 'choose', label: 'Decline sheet', view: 'choose' },
      { id: 'approved', label: 'Approved', state: { goal: goal('unlocked') }, view: 'approved' },
      { id: 'later', label: 'Ask tomorrow', state: { unlock: { askLater: true } }, view: 'later' },
      { id: 'declined', label: 'Declined', state: { goal: goal('declined'), unlock: { askLater: false, decline: { reason: 'notNow' } } }, view: 'declined' },
    ],
    does: 'Approves, asks Ananya to try again tomorrow, or declines with a reason.',
    why: 'Structured reasons make a “no” kind and teach something. “Ask again tomorrow” avoids a hard no. Every outcome tells Ananya, so she is never left guessing.',
    states: 'Decline sheet, approved, snoozed, declined with the reason sent.',
  },

  // ───────────── Flow 2: Ananya (child, 13)
  {
    id: 'a-join', flow: 'child', n: 1, title: 'Join', state: { ...live },
    variants: [{ id: 'default', label: 'Default' }],
    does: 'Opens her invite and picks a buddy avatar.',
    why: 'Her first action is a choice, not a form, which gives a small sense of ownership. There is no typing, and it feels like hers rather than a bank’s app.',
    states: 'An invalid or expired code shows “Invite not found”.',
  },
  {
    id: 'a-home', flow: 'child', n: 2, title: 'Home', state: { ...live },
    variants: [
      { id: 'empty', label: 'No goal' },
      { id: 'late', label: 'Pocket money late', state: { pocketLate: true } },
    ],
    does: 'Sees her money in three jars and her own split. No goal yet.',
    why: 'Ananya wants autonomy and hates being patronised, so her split is visible and editable. The empty state gives one clear next step.',
    states: 'No goal, and late pocket money (banner with “Remind Priya”). A request-extra-money button is always present.',
  },
  {
    id: 'a-pick', flow: 'child', n: 3, title: 'Pick a goal', state: { ...live },
    variants: [{ id: 'default', label: 'Picture grid' }],
    does: 'Taps a picture, such as headphones.',
    why: 'A picture grid is quicker than typing, and templates arrive with realistic prices. “Something else” covers anything not listed.',
    states: 'Custom goal asks for a name. Only one active goal at a time.',
  },
  {
    id: 'a-amount', flow: 'child', n: 4, title: 'Set the price', state: { ...live },
    variants: [{ id: 'default', label: 'Price' }],
    does: 'Adjusts the price, or asks Priya to fill it in.',
    why: 'A stepper keeps her in control without a keyboard. “Ask Priya to fill it in” covers the case where she doesn’t know the real price.',
    states: 'Asking Priya creates a waiting goal. If she already has enough saved, the goal completes at once.',
  },
  {
    id: 'a-arrives', flow: 'child', n: 5, title: 'Pocket money arrives', state: { ...live, goal: goal('active') },
    variants: [{ id: 'default', label: 'Arrival', state: { jars: { spend: 790, save: 1700, share: 210 }, goal: goal('milestone') } }],
    does: 'Watches ₹1,500 split into Spend, Save and Share.',
    why: 'This is the delight moment. Money visibly moves toward her goal, which is what makes saving feel real. It auto-dismisses and never blocks her.',
    states: 'Reduced-motion users get the same result without movement. A late payment resolves here.',
  },
  {
    id: 'a-milestone', flow: 'child', n: 6, title: 'Milestone', state: { ...live, jars: { spend: 790, save: 1700, share: 210 }, goal: goal('milestone') },
    variants: [{ id: 'default', label: '50%' }],
    does: 'Sees the halfway celebration.',
    why: 'Milestones turn a long goal into short, winnable steps. The celebration is brief and light, so it never feels childish for a teen.',
    states: '25, 50 and 75 percent. Several in one drop queue in order.',
  },
  {
    id: 'a-complete', flow: 'child', n: 7, title: 'Goal complete', state: { ...live, ...heard, goal: goal('completed') },
    variants: [{ id: 'default', label: 'Complete' }],
    does: 'Sees she did it and taps “Ask Priya to buy it”.',
    why: 'Her saved money stays locked until Priya says yes. Purchases over ₹1,000 need approval, and it is framed as asking, not as a permission slip.',
    states: 'A goal under the parent’s limit is approved instantly.',
  },
  {
    id: 'a-ask', flow: 'child', n: 8, title: 'Ask to unlock', state: { ...live, ...heard, goal: goal('completed') },
    variants: [{ id: 'sheet', label: 'Request sheet', view: 'sheet' }],
    does: 'Confirms the request to unlock ₹2,499 for the headphones.',
    why: 'It says exactly what happens next, and that her savings are safe while she waits, which lowers the anxiety of asking.',
    states: 'Sheet before sending, then the waiting screen.',
    connector: { dir: 'to', step: 'p-approvals', label: 'Appears in Priya’s approvals, step 8' },
  },
  {
    id: 'a-wait', flow: 'child', n: 9, title: 'Waiting', state: { ...live, ...heard, goal: goal('unlockRequested') },
    variants: [
      { id: 'waiting', label: 'Waiting' },
      { id: 'later', label: 'Ask tomorrow', state: { unlock: { askLater: true } } },
    ],
    does: 'Waits. She can nudge Priya.',
    why: 'A clear status removes uncertainty. The nudge is limited so it doesn’t become nagging.',
    states: 'Waiting, and “Priya said ask again tomorrow” with the button locked until the next day.',
  },
  {
    id: 'a-outcome', flow: 'child', n: 10, title: 'Outcome', state: { ...live, ...heard, goal: goal('unlocked') },
    variants: [
      { id: 'unlocked', label: 'Unlocked' },
      { id: 'declined', label: 'Declined', state: { goal: goal('declined'), unlock: { askLater: false, decline: { reason: 'notNow', note: 'Let’s wait until after exams.' } } } },
    ],
    does: 'Unlocked: picks her next goal. Declined: reads why and chooses what to do.',
    why: 'A decline always comes with a reason and a next action, so it never dead-ends. The same screen invites a new goal when she succeeds.',
    states: 'Unlocked, and declined with one of three reasons plus an optional note.',
  },
]

export const stepById = (id: StepId) => steps.find((s) => s.id === id)!
export const flowSteps = (flow: FlowKey) => steps.filter((s) => s.flow === flow)
export const firstStep = (flow: FlowKey) => flowSteps(flow)[0].id

/** Everything a step needs to render a variant without any clicking. */
export function sceneFor(step: Step, variantId?: string) {
  const variant = step.variants.find((v) => v.id === variantId) ?? step.variants[0]
  const state: WireState = { ...baseState(), ...step.state, ...variant.state }
  return { state, view: variant.view }
}

export interface Scene { id: string; label: string; stepId: StepId; variantId: string }
/** Flat list for the "jump to scene" menu. */
export const scenes: Scene[] = steps.flatMap((s) =>
  s.variants.map((v) => ({ id: `${s.id}:${v.id}`, label: `${s.flow === 'parent' ? 'Priya' : 'Ananya'} ${s.n}. ${s.title}${s.variants.length > 1 ? ` · ${v.label}` : ''}`, stepId: s.id, variantId: v.id })),
)
