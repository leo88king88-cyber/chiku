import type { RiskProfile } from '../../store/types'

export interface Question {
  q: string
  options: { label: string; score: number }[]
}

/** Three scored questions. Scores add up to 0 to 6. */
export const questions: Question[] = [
  {
    q: 'Your ₹10,000 drops to ₹8,500 in a month. What do you do?',
    options: [
      { label: 'Sell it all to stop the loss', score: 0 },
      { label: 'Wait and see', score: 1 },
      { label: 'Invest a bit more, it is cheaper now', score: 2 },
    ],
  },
  {
    q: 'How long can you leave this money untouched?',
    options: [
      { label: 'Less than a year', score: 0 },
      { label: '1 to 3 years', score: 1 },
      { label: '3 years or more', score: 2 },
    ],
  },
  {
    q: 'What matters more to you?',
    options: [
      { label: 'Not losing what I put in', score: 0 },
      { label: 'A bit of both', score: 1 },
      { label: 'Growing it, even if it bounces around', score: 2 },
    ],
  },
]

export const gate = {
  q: 'True or false: a mutual fund can be worth less than what you put in.',
  correct: 'True',
}

export function profileFor(score: number): RiskProfile {
  return score <= 2 ? 'conservative' : score <= 4 ? 'balanced' : 'growth'
}

export const profileInfo: Record<RiskProfile, { label: string; maxRisk: number; text: string; emoji: string }> = {
  conservative: { label: 'Careful saver', maxRisk: 2, emoji: '🛡️', text: 'You prefer steady over exciting. Lower-risk funds fit you best.' },
  balanced: { label: 'Balanced', maxRisk: 4, emoji: '⚖️', text: 'You can handle some ups and downs. Hybrid funds or a mix can fit.' },
  growth: { label: 'Growth seeker', maxRisk: 5, emoji: '🚀', text: 'You can sit through big swings for higher growth over years. Not a promise of returns.' },
}
