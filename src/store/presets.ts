import type { AgeBand } from '../theme/bands'
import type { Controls } from './types'

export const controlPresets: Record<AgeBand, Omit<Controls, 'isDefault'>> = {
  '8-11': { spendLimit: 300, goalPurchaseAbove: 0, extraMoneyAbove: 100, notifySpends: 'every', weeklySummary: true },
  '12-14': { spendLimit: 1000, goalPurchaseAbove: 1000, extraMoneyAbove: 300, notifySpends: 'large', weeklySummary: true },
  '15-17': { spendLimit: 2500, goalPurchaseAbove: 2500, extraMoneyAbove: 500, notifySpends: 'large', weeklySummary: true },
}

export const pocketMoneySuggestion: Record<AgeBand, { amount: number; dayOfMonth: number }> = {
  '8-11': { amount: 500, dayOfMonth: 1 },
  '12-14': { amount: 1500, dayOfMonth: 1 },
  '15-17': { amount: 2000, dayOfMonth: 1 },
}

export const ageBandInfo: Record<AgeBand, { label: string; tag: string; blurb: string; emoji: string }> = {
  '8-11': { label: '8 to 11', tag: 'Little saver', blurb: 'Big pictures, a friendly mascot, almost no typing.', emoji: '🧒' },
  '12-14': { label: '12 to 14', tag: 'Teen', blurb: 'Cleaner look, their own spend/save/share split.', emoji: '👧' },
  '15-17': { label: '15 to 17', tag: 'Almost grown-up', blurb: 'Near-adult app, real investing with your approval.', emoji: '🧑' },
}
