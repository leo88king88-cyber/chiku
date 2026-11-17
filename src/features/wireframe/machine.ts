import type { Jars } from '../../store/types'
import type { GoalPhase, WireEvent, WireState } from './types'

/**
 * Allowed goal-phase moves. Anything not listed is ignored, so the UI can never reach an
 * impossible state (for example approving a request that was never made).
 *
 *   active -> milestone -> completed -> unlockRequested -> unlocked | declined
 *   declined -> unlockRequested (ask again) | goal cleared (new goal)
 */
export const transitions: Record<GoalPhase, GoalPhase[]> = {
  active: ['active', 'milestone', 'completed'],
  milestone: ['active', 'milestone', 'completed'],
  completed: ['unlockRequested'],
  unlockRequested: ['unlockRequested', 'unlocked', 'declined'],
  unlocked: [],
  declined: ['unlockRequested'],
}

export const canMove = (from: GoalPhase, to: GoalPhase) => transitions[from].includes(to)

export const SPLIT_DEFAULT: Jars = { spend: 50, save: 40, share: 10 }

export function splitAmount(amount: number, split: Jars): Jars {
  const spend = Math.round((amount * split.spend) / 100)
  const share = Math.round((amount * split.share) / 100)
  return { spend, share, save: amount - spend - share }
}

const buckets = (saved: number, target: number) => Math.floor(Math.min(1, saved / target) * 4)

export function reduce(s: WireState, e: WireEvent): WireState {
  const g = s.goal
  switch (e.type) {
    case 'SET':
      return { ...s, ...e.patch }

    case 'CREATE_GOAL': {
      if (g && g.phase !== 'unlocked' && g.phase !== 'declined') return s
      const phase: GoalPhase = e.askParent ? 'active' : s.jars.save >= e.target ? 'completed' : 'active'
      return {
        ...s,
        askedParentForPrice: e.askParent,
        unlock: { askLater: false },
        goal: { templateId: e.templateId, title: e.title, emoji: e.emoji, target: e.target, phase },
      }
    }

    case 'DEPOSIT': {
      const parts = splitAmount(e.amount, s.split)
      const jars = { spend: s.jars.spend + parts.spend, save: s.jars.save + parts.save, share: s.jars.share + parts.share }
      let goal = g
      if (g && (g.phase === 'active' || g.phase === 'milestone') && !s.askedParentForPrice) {
        const next: GoalPhase =
          jars.save >= g.target ? 'completed' : buckets(jars.save, g.target) > buckets(s.jars.save, g.target) ? 'milestone' : 'active'
        if (canMove(g.phase, next)) goal = { ...g, phase: next }
      }
      return { ...s, jars, goal, pocketLate: false }
    }

    case 'REQUEST_UNLOCK':
      return g && canMove(g.phase, 'unlockRequested') ? { ...s, goal: { ...g, phase: 'unlockRequested' }, unlock: { askLater: false } } : s

    case 'REASK':
      return g && canMove(g.phase, 'unlockRequested') ? { ...s, goal: { ...g, phase: 'unlockRequested' }, unlock: { askLater: false } } : s

    case 'APPROVE':
      return g && canMove(g.phase, 'unlocked')
        ? { ...s, goal: { ...g, phase: 'unlocked' }, unlock: { askLater: false }, jars: { ...s.jars, save: Math.max(0, s.jars.save - g.target) } }
        : s

    case 'ASK_LATER':
      return g?.phase === 'unlockRequested' ? { ...s, unlock: { ...s.unlock, askLater: true } } : s

    case 'DECLINE':
      return g && canMove(g.phase, 'declined')
        ? { ...s, goal: { ...g, phase: 'declined' }, unlock: { askLater: false, decline: { reason: e.reason, note: e.note } } }
        : s

    case 'NEW_GOAL':
      return g && (g.phase === 'unlocked' || g.phase === 'declined') ? { ...s, goal: null, askedParentForPrice: false, unlock: { askLater: false } } : s
  }
}
