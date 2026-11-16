import type { Band } from '../theme/bands'

export type PersonaId = 'priya' | 'aarav' | 'ananya' | 'rohan'
export type View = 'parent' | 'child'

export interface Persona {
  id: PersonaId
  name: string
  role: string
  emoji: string
  band: Band
  view: View
  home: string
}

export const personas: Record<PersonaId, Persona> = {
  priya: { id: 'priya', name: 'Priya', role: 'Parent, 38', emoji: '👩', band: 'pro', view: 'parent', home: '/p/home' },
  aarav: { id: 'aarav', name: 'Aarav', role: 'Child, 9', emoji: '🧒', band: 'kid', view: 'child', home: '/c/home' },
  ananya: { id: 'ananya', name: 'Ananya', role: 'Teen, 13', emoji: '👧', band: 'teen', view: 'child', home: '/c/home' },
  rohan: { id: 'rohan', name: 'Rohan', role: 'Teen, 16', emoji: '🧑', band: 'pro', view: 'child', home: '/c/home' },
}

export const personaList = Object.values(personas)

export const flowStarts = [
  { label: '1. Parent onboarding', path: '/p/welcome', persona: 'priya' as PersonaId },
  { label: '2a. Aarav goal', path: '/c/home', persona: 'aarav' as PersonaId },
  { label: '2b. Ananya goal', path: '/c/home', persona: 'ananya' as PersonaId },
  { label: '3. Rohan simulator', path: '/c/invest/sim', persona: 'rohan' as PersonaId },
  { label: '3. Priya approvals', path: '/p/approvals', persona: 'priya' as PersonaId },
]
