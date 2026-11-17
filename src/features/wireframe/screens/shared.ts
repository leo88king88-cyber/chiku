import { createContext, type ReactNode } from 'react'
import type { StepId } from '../scenes'
import type { Fidelity, WireEvent, WireState } from '../types'

export type Act = { type: 'GO'; step: StepId; view?: string } | { type: 'TOAST'; message: string } | { type: 'PERSONA'; to: 'priya' | 'ananya' } | WireEvent

export interface ScreenProps {
  s: WireState
  /** Overlay or sub-view to open in (for example the UPI sheet). */
  view?: string
  act: (a: Act) => void
  /** False in storyboard frames: demo-only controls are hidden. */
  live: boolean
}
export type ScreenComponent = (p: ScreenProps) => ReactNode

export const FidelityContext = createContext<Fidelity>('styled')

export const go = (step: StepId, view?: string): Act => ({ type: 'GO', step, view })
export const avatars = ['🦊', '🐯', '🦄', '🐼', '🚀', '⚽']
