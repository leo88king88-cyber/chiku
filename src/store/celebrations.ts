import { create } from 'zustand'
import type { Balances } from './types'

export type CelebrationEvent = { id: string; childId: string } & (
  | { kind: 'arrival'; label: string; parts: Balances }
  | { kind: 'milestone'; goalId: string; pct: number }
  | { kind: 'complete'; goalId: string }
)

/** Ephemeral (not persisted) queue of moments to celebrate on screen. */
export const useCelebrations = create<{
  queue: CelebrationEvent[]
  push: (events: CelebrationEvent[]) => void
  dismiss: (id: string) => void
}>((set) => ({
  queue: [],
  push: (events) => set((s) => ({ queue: [...s.queue, ...events] })),
  dismiss: (id) => set((s) => ({ queue: s.queue.filter((e) => e.id !== id) })),
}))
