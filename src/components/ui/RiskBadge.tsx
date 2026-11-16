import type { RiskLabel } from '../../features/invest/funds'

const tone: Record<RiskLabel, string> = {
  'Low to Moderate': 'bg-leaf/20 text-ink',
  High: 'bg-saffron/40 text-ink',
  'Very High': 'bg-tomato/25 text-ink',
}

export function RiskBadge({ risk }: { risk: RiskLabel }) {
  return <span className={`t-caption inline-block rounded-full px-2.5 py-0.5 font-bold ${tone[risk]}`}>{risk} risk</span>
}
