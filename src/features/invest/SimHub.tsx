import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'
import { Button } from '../../components/ui/Button'
import { DisclosureBanner } from '../../components/ui/DisclosureBanner'
import { ChartLegend, LineChart } from '../../components/ui/LineChart'
import { RiskBadge } from '../../components/ui/RiskBadge'
import { formatINR, signed, signedINR } from '../../lib/money'
import { useActiveChild, useStore } from '../../store'
import { funds } from './funds'
import { InvestHeader } from './InvestHeader'
import { useSim } from './useSim'

export function SimHub() {
  const child = useActiveChild()
  if (!child) return null
  return <Hub childId={child.id} childName={child.name} />
}

function Hub({ childId, childName }: { childId: string; childName: string }) {
  const navigate = useNavigate()
  const { sim, stats, history, holdings, recap } = useSim(childId)
  const advance = useStore((s) => s.simAdvance)
  const parent = useStore((s) => s.guardian.name.split(' ')[0])
  const sipReq = useStore((s) => s.requests.filter((r) => r.kind === 'sip' && r.childId === childId).at(-1))
  const hasInvested = sim.trades.length > 0
  const up = stats.gain >= 0

  return (
    <div className="flex min-h-full flex-col">
      <InvestHeader title="Practice investing" tag="Virtual money" />
      <main className="flex flex-col gap-[var(--gap)] px-5 pb-8 pt-3">
        <section aria-label="Portfolio" className="sticker p-4">
          <p className="t-caption text-ink-soft">{childName}'s practice portfolio · week {sim.week}</p>
          <p className="t-display"><AnimatedNumber value={Math.round(stats.value)} /></p>
          {hasInvested ? (
            <p className={`t-body font-bold ${up ? 'text-leaf' : 'text-tomato'}`}>
              {signedINR(stats.gain)} ({signed(stats.returnPct)}) on {formatINR(stats.invested)} invested
            </p>
          ) : (
            <p className="t-body text-ink-soft">All {formatINR(stats.cash)} is cash. Pick a fund below to start.</p>
          )}
          {hasInvested && (
            <div className="mt-3">
              <LineChart
                label="Practice portfolio against the index fund"
                series={[
                  { name: 'Index fund, same amounts', color: 'var(--color-sky)', points: history.index, dashed: true },
                  { name: 'Your picks', color: 'var(--color-plum)', points: history.portfolio },
                ]}
              />
              <ChartLegend series={[{ name: 'Your picks', color: 'var(--color-plum)' }, { name: 'Index fund, same amounts', color: 'var(--color-sky)', dashed: true }]} />
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => advance(childId, 1)} disabled={sim.week >= 104}>Fast-forward 1 week</Button>
            {hasInvested && <Button variant="secondary" className="flex-1" onClick={() => navigate('/c/invest/compare')}>Compare</Button>}
          </div>
        </section>

        {recap && recap.invested && (
          <motion.section key={recap.week} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} aria-label="Weekly recap" className="sticker p-4">
            <h2 className="t-title">Week {recap.week} recap</h2>
            <p className="t-body mt-1">
              Your picks <b className={recap.portfolioPct >= 0 ? 'text-leaf' : 'text-tomato'}>{signed(recap.portfolioPct, 2)}</b>, index fund <b>{signed(recap.indexPct, 2)}</b>.
            </p>
            {recap.best && (
              <p className="t-caption mt-1 text-ink-soft">
                Strongest: {recap.best.fund.name} {signed(recap.best.pct, 2)}
                {recap.worst && recap.worst.fund.id !== recap.best.fund.id ? `. Weakest: ${recap.worst.fund.name} ${signed(recap.worst.pct, 2)}.` : '.'}
              </p>
            )}
            <p className="t-caption mt-1 text-ink-soft">One week tells you very little. Look at months, not days.</p>
          </motion.section>
        )}

        {holdings.length > 0 && (
          <section aria-label="Holdings" className="flex flex-col gap-2">
            <h2 className="t-title">Your holdings</h2>
            <ul className="sticker divide-y divide-ink/10 px-4">
              {holdings.map((h) => (
                <li key={h.fund.id}>
                  <Link to={`/c/invest/fund/${h.fund.id}`} className="flex min-h-14 items-center justify-between gap-3 py-2 no-underline">
                    <span><b>{h.fund.name}</b><span className="t-caption block text-ink-soft">{formatINR(h.invested)} invested</span></span>
                    <span className="text-right"><b className="t-money">{formatINR(h.value)}</b><span className={`t-caption block ${h.gainPct >= 0 ? 'text-leaf' : 'text-tomato'}`}>{signed(h.gainPct)}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="t-caption text-ink-soft">Cash available: <b className="t-money">{formatINR(stats.cash)}</b></p>
          </section>
        )}

        <section aria-label="Funds" className="flex flex-col gap-2">
          <h2 className="t-title">Funds to practise with</h2>
          <ul className="flex flex-col gap-2">
            {funds.map((f) => (
              <li key={f.id}>
                <Link to={`/c/invest/fund/${f.id}`} className="sticker flex min-h-14 flex-col gap-1 p-3 no-underline">
                  <span className="flex items-center justify-between gap-2"><b>{f.name}</b><span aria-hidden>›</span></span>
                  <span className="flex items-center gap-2"><RiskBadge risk={f.risk} /><span className="t-caption text-ink-soft">{f.category}</span></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="sticker !bg-saffron/25 p-4">
          <h2 className="t-title">Ready for the real thing?</h2>
          <p className="t-body mt-1">Ask {parent} to approve a real SIP from just ₹500 a month. Your practice history goes with the request.</p>
          <Button className="mt-3 w-full" onClick={() => navigate(sipReq ? '/c/invest/status' : '/c/invest/quiz')}>
            {sipReq ? 'See my SIP request' : 'Start a real SIP'}
          </Button>
        </section>
        <DisclosureBanner invest />
      </main>
    </div>
  )
}
