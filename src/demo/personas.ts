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
  /** Whose phone this persona is using. Aarav and Ananya borrow Priya's. */
  device: 'priya' | 'rohan'
}

export const personas: Record<PersonaId, Persona> = {
  priya: { id: 'priya', name: 'Priya', role: 'Parent, 38', emoji: '👩', band: 'pro', view: 'parent', home: '/p/home', device: 'priya' },
  aarav: { id: 'aarav', name: 'Aarav', role: 'Child, 9', emoji: '🧒', band: 'kid', view: 'child', home: '/c/home', device: 'priya' },
  ananya: { id: 'ananya', name: 'Ananya', role: 'Teen, 13', emoji: '👧', band: 'teen', view: 'child', home: '/c/home', device: 'priya' },
  rohan: { id: 'rohan', name: 'Rohan', role: 'Teen, 16', emoji: '🧑', band: 'pro', view: 'child', home: '/c/home', device: 'rohan' },
}

export const personaList = Object.values(personas)

const bandOf = { '8-11': 'aarav', '12-14': 'ananya', '15-17': 'rohan' } as const

/** Which persona plays a child record: matched by name, else by age band. */
export function personaIdForChild(c: { name: string; ageBand: keyof typeof bandOf }): PersonaId {
  return personaList.find((p) => p.view === 'child' && p.name.toLowerCase() === c.name.toLowerCase())?.id ?? bandOf[c.ageBand]
}

/** Children under 15 share a parent's phone; 15-17 have their own. */
export const hasOwnPhone = (c: { ageBand: string }) => c.ageBand === '15-17'
