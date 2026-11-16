export interface GoalTemplate {
  id: string
  title: string
  emoji: string
  price: number
  audience: ('kid' | 'teen')[]
}

export const goalTemplates: GoalTemplate[] = [
  { id: 'lego', title: 'Lego set', emoji: '🧱', price: 1999, audience: ['kid'] },
  { id: 'football', title: 'Football', emoji: '⚽', price: 899, audience: ['kid'] },
  { id: 'cycle', title: 'New cycle', emoji: '🚲', price: 4500, audience: ['kid', 'teen'] },
  { id: 'artkit', title: 'Art kit', emoji: '🎨', price: 699, audience: ['kid'] },
  { id: 'dino', title: 'Dino toy', emoji: '🦖', price: 799, audience: ['kid'] },
  { id: 'bat', title: 'Cricket bat', emoji: '🏏', price: 1299, audience: ['kid', 'teen'] },
  { id: 'headphones', title: 'Headphones', emoji: '🎧', price: 2499, audience: ['teen'] },
  { id: 'sneakers', title: 'Sneakers', emoji: '👟', price: 3499, audience: ['teen'] },
  { id: 'concert', title: 'Concert ticket', emoji: '🎟️', price: 1999, audience: ['teen'] },
  { id: 'books', title: 'Book bundle', emoji: '📚', price: 599, audience: ['teen'] },
  { id: 'console', title: 'Game pass', emoji: '🎮', price: 1499, audience: ['teen'] },
]

export const findTemplate = (id: string) => goalTemplates.find((t) => t.id === id)
