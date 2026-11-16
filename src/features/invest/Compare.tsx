import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { DisclosureBanner } from '../../components/ui/DisclosureBanner'
import { ChartLegend, LineChart } from '../../components/ui/LineChart'
import { formatINR } from '../../lib/money'
import { useActiveChild } from '../../store'
import { InvestHeader } from './InvestHeader'
import { signed, signedINR } from '../../lib/money'
import { useSim } from './useSim'

export function Compare() {
  const child = useActiveChild()
  if (!child) return null
  return <Body childId={child.id} />
}

/** Honest framing: show the plain index result next to the child's picks, and say what it does and doesn't mean. */
function Body({ childId }: { childId: string }) {
  const navigate = useNavigate()
  const { sim, stats, history } = useSim(childId)
  if (sim.trades.length === 0) return <Navigate to="/c/invest/sim" replace />
  const diff = stats.returnPct - stats.indexReturnPct
  const ahead = diff >= 0
  const series = [
    { name: 'Your picks', color: 'var(--color-plum)', points: history.portfolio },
    { name: 'Index fund, same amounts', color: 'var(--color-sky)', points: history.index, dashed: true },
  ]
  return (
    <div className="flex min-h-full flex-col">
      <InvestHeader title="You vs a plain index fund" back="/c/invest/sim" />
      <main className="flex flex-col gap-[var(--gap)] px-5 pb-8 pt-3">
        <p className="t-body">
          We put the <b>same money on the same days</b> into a simple index fund, so you can see what your picks added.
        </p>
        <section className="sticker p-4">
          <LineChart label="Your picks against the index fund" series={series} />
          <ChartLegend series={series} />
        </section>
        <div className="grid grid-cols-2 gap-3">
          <div className="sticker p-3">
            <p className="t-caption text-ink-soft">Your picks</p>
            <p className={`t-title ${stats.gain >= 0 ? 'text-leaf-ink' : 'text-tomato-ink'}`}>{signed(stats.returnPct)}</p>
            <p className="t-caption t-money">{signedINR(stats.gain)}</p>
          </div>
          <div className="sticker p-3">
            <p className="t-caption text-ink-soft">Index fund</p>
            <p className={`t-title ${stats.indexGain >= 0 ? 'text-leaf-ink' : 'text-tomato-ink'}`}>{signed(stats.indexReturnPct)}</p>
            <p className="t-caption t-money">{signedINR(stats.indexGain)}</p>
          </div>
        </div>
        <section className="sticker flex flex-col gap-2 p-4" aria-label="What this means">
          <h2 className="t-title">{ahead ? `You're ${diff.toFixed(1)} points ahead` : `The index is ${Math.abs(diff).toFixed(1)} points ahead`}</h2>
          <p className="t-body">
            {ahead
              ? `That feels good, but ${sim.week} weeks is far too short to mean anything. A few lucky weeks can look like skill.`
              : `That's normal. Beating the index is hard, and ${sim.week} weeks is too short to judge anyone, including you.`}
          </p>
          <ul className="t-body list-disc pl-5 text-ink-soft">
            <li>Over many years, a lot of fund-manager-picked funds have not beaten a plain index fund after costs.</li>
            <li>An index fund costs about 0.20% a year. Your picks cost more, which comes out of your returns.</li>
            <li>Results from the past do not tell you what happens next.</li>
          </ul>
          <p className="t-caption text-ink-soft">Practice invested {formatINR(stats.invested)} of virtual money.</p>
        </section>
        <Button className="w-full" onClick={() => navigate('/c/invest/quiz')}>I'm ready for a real SIP</Button>
        <Button variant="ghost" onClick={() => navigate('/c/invest/sim')}>Keep practising</Button>
        <DisclosureBanner invest />
      </main>
    </div>
  )
}
