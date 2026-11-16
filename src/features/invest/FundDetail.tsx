import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { ChoiceChips } from '../../components/ui/ChoiceChips'
import { DisclosureBanner } from '../../components/ui/DisclosureBanner'
import { ChartLegend, LineChart } from '../../components/ui/LineChart'
import { RiskBadge } from '../../components/ui/RiskBadge'
import { formatINR } from '../../lib/money'
import { useActiveChild, useStore } from '../../store'
import { useToast } from '../../store/toast'
import { fundById, INDEX_ID, navSeries } from './funds'
import { InvestHeader } from './InvestHeader'
import { signed } from '../../lib/money'
import { useSim } from './useSim'

export function FundDetail() {
  const { id = '' } = useParams()
  const child = useActiveChild()
  const fund = fundById(id)
  if (!child || !fund) return <Navigate to="/c/invest/sim" replace />
  return <Detail childId={child.id} fundId={id} />
}

function Detail({ childId, fundId }: { childId: string; fundId: string }) {
  const fund = fundById(fundId)!
  const { sim, holdings } = useSim(childId)
  const trade = useStore((s) => s.simTrade)
  const toast = useToast((s) => s.show)
  const [amount, setAmount] = useState(10000)
  const held = holdings.find((h) => h.fund.id === fundId)
  const own = navSeries(fundId, sim.week)
  const idx = navSeries(INDEX_ID, sim.week)
  const change = (own.at(-1)! / own[0] - 1) * 100
  const series = [{ name: fund.name, color: 'var(--color-plum)', points: own }, ...(fundId !== INDEX_ID ? [{ name: 'Index fund', color: 'var(--color-sky)', points: idx, dashed: true }] : [])]

  return (
    <div className="flex min-h-full flex-col">
      <InvestHeader title={fund.name} back="/c/invest/sim" />
      <main className="flex flex-col gap-[var(--gap)] px-5 pb-8 pt-3">
        <div className="flex flex-wrap items-center gap-2"><RiskBadge risk={fund.risk} /><span className="t-caption text-ink-soft">{fund.category}</span></div>
        <p className="t-body">{fund.blurb}</p>
        <section className="sticker p-4">
          <p className="t-caption text-ink-soft">Last {sim.week} weeks (mock data, starts at 100)</p>
          <p className={`t-title ${change >= 0 ? 'text-leaf-ink' : 'text-tomato-ink'}`}>{signed(change)}</p>
          <LineChart label={`${fund.name} price`} series={series} />
          <ChartLegend series={series} />
        </section>
        <dl className="sticker grid grid-cols-2 gap-3 p-4">
          <div><dt className="t-caption text-ink-soft">Yearly cost</dt><dd className="font-bold">{fund.expense.toFixed(2)}%</dd></div>
          <div><dt className="t-caption text-ink-soft">Your holding</dt><dd className="t-money font-bold">{held ? formatINR(held.value) : 'None yet'}</dd></div>
        </dl>
        <section className="flex flex-col gap-2">
          <h2 className="t-title">Practise with</h2>
          <ChoiceChips label="Amount" value={amount} options={[5000, 10000, 25000].map((v) => ({ value: v, label: formatINR(v) }))} onChange={setAmount} />
          <p className="t-caption text-ink-soft">Cash available: <b className="t-money">{formatINR(sim.cash)}</b></p>
          <div className="flex gap-2">
            <Button className="flex-1" disabled={amount > sim.cash} onClick={() => { trade(childId, fundId, amount, 'buy'); toast(`Bought ${formatINR(amount)} of ${fund.category.toLowerCase()} (practice)`) }}>Buy</Button>
            {held && <Button variant="secondary" className="flex-1" onClick={() => { trade(childId, fundId, Math.min(amount, held.value), 'sell'); toast('Sold (practice)') }}>Sell</Button>}
          </div>
        </section>
        <DisclosureBanner invest />
      </main>
    </div>
  )
}
