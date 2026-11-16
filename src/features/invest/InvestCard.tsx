import { Link } from 'react-router-dom'
import { formatINR } from '../../lib/money'
import { useStore } from '../../store'
import { fundById } from './funds'
import { signed, signedINR } from '../../lib/money'
import { useSim } from './useSim'

/** Home-screen entry to the simulator and to the real SIP, whatever state it is in. */
export function InvestCard({ childId }: { childId: string }) {
  const { sim, stats } = useSim(childId)
  const sips = useStore((s) => s.sips)
  const req = useStore((s) => s.requests.filter((r) => r.kind === 'sip' && r.childId === childId).at(-1))
  const sip = sips.find((s) => s.childId === childId)
  const parent = useStore((s) => s.guardian.name.split(' ')[0])
  const pending = req?.status === 'pending'
  const declined = req?.status === 'declined'
  const status = sip
    ? `SIP active: ${formatINR(sip.amount)}/month in ${fundById(sip.fundId)?.name}`
    : pending
      ? `⏳ Waiting for ${parent} to approve your SIP`
      : declined
        ? `${parent} said not yet. Tap to adjust.`
        : null
  return (
    <section aria-label="Investing" className="sticker flex flex-col gap-2 p-4">
      <h2 className="t-title">Investing</h2>
      <Link to="/c/invest/sim" className="flex min-h-11 items-center justify-between no-underline">
        <span>
          <b>Practice portfolio</b>
          <span className="t-caption block text-ink-soft">Virtual money · week {sim.week}</span>
        </span>
        <span className="text-right">
          <b className="t-money">{formatINR(Math.round(stats.value))}</b>
          {sim.trades.length > 0 && <span className={`t-caption block ${stats.gain >= 0 ? 'text-leaf' : 'text-tomato'}`}>{signedINR(stats.gain)} ({signed(stats.returnPct)})</span>}
        </span>
      </Link>
      {status && (
        <Link to={sip ? '/c/invest/sip-confirmed' : '/c/invest/status'} className="t-body flex min-h-11 items-center rounded-xl bg-paper-deep px-3 no-underline">{status}</Link>
      )}
      <p className="t-caption text-ink-soft">Mutual fund investments are subject to market risks.</p>
    </section>
  )
}
