import { ChartLegend, LineChart } from '../../../components/ui/LineChart'
import { formatINR } from '../../../lib/money'
import { funds, type RiskLabel } from '../funds'

/** Small, self-contained diagrams for the lessons. Each is plain markup so it reads on a phone. */

const Arrow = () => <span aria-hidden className="text-center text-2xl text-ink-soft">↓</span>

export function PoolDiagram() {
  const steps = [
    ['👨‍👩‍👧‍👦', 'Many investors', 'Each puts in a little'],
    ['🫙', 'One big pool', 'Money collected together'],
    ['🧑‍💼', 'Fund manager', 'Works at the AMC and decides what to buy'],
    ['🏢', 'Shares and bonds', 'Companies and governments'],
  ]
  return (
    <figure className="sticker flex flex-col gap-1 p-4" aria-label="How a mutual fund works: investors, pool, fund manager, shares and bonds">
      {steps.map(([icon, title, sub], i) => (
        <div key={title} className="flex flex-col gap-1">
          {i > 0 && <Arrow />}
          <div className="flex items-center gap-3 rounded-xl bg-paper-deep px-3 py-2">
            <span aria-hidden className="text-3xl">{icon}</span>
            <div><p className="font-bold">{title}</p><p className="t-caption text-ink-soft">{sub}</p></div>
          </div>
        </div>
      ))}
    </figure>
  )
}

export function NavFormula() {
  return (
    <figure className="sticker flex flex-col gap-3 p-4" aria-label="NAV formula and an example">
      <p className="t-body rounded-xl bg-paper-deep p-3 text-center font-bold">NAV = (what the fund owns − its costs) ÷ number of units</p>
      <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-2">
        <dt className="text-ink-soft">You invest</dt><dd className="t-money font-bold">{formatINR(5000)}</dd>
        <dt className="text-ink-soft">NAV that day</dt><dd className="t-money font-bold">{formatINR(100)}</dd>
        <dt className="text-ink-soft">Units you get</dt><dd className="t-money font-bold">5,000 ÷ 100 = 50</dd>
        <dt className="text-ink-soft">NAV later rises to</dt><dd className="t-money font-bold">{formatINR(112)}</dd>
        <dt className="font-bold">Your 50 units are worth</dt><dd className="t-money font-bold text-leaf-ink">{formatINR(5600)}</dd>
      </dl>
    </figure>
  )
}

export function SipTable() {
  const rows = [
    ['Month 1', 100, 5],
    ['Month 2', 80, 6.25],
    ['Month 3', 125, 4],
  ] as const
  return (
    <figure className="sticker p-4" aria-label="Three months of a ₹500 SIP at different NAVs">
      <table className="w-full text-left">
        <caption className="t-caption pb-2 text-left text-ink-soft">A ₹500 SIP over three months</caption>
        <thead>
          <tr className="t-caption text-ink-soft"><th className="pb-1 font-bold">When</th><th className="pb-1 text-right font-bold">NAV</th><th className="pb-1 text-right font-bold">Units bought</th></tr>
        </thead>
        <tbody>
          {rows.map(([m, nav, units]) => (
            <tr key={m} className="border-t border-ink/10"><td className="py-2">{m}</td><td className="t-money py-2 text-right">{formatINR(nav)}</td><td className="t-money py-2 text-right font-bold">{units.toFixed(2)}</td></tr>
          ))}
          <tr className="border-t-2 border-ink/30 font-bold"><td className="py-2">Total</td><td className="t-money py-2 text-right">{formatINR(1500)}</td><td className="t-money py-2 text-right">15.25</td></tr>
        </tbody>
      </table>
      <p className="t-body mt-3 rounded-xl bg-paper-deep p-3">You paid about <b className="t-money">₹98.36</b> a unit on average. The average NAV was about <b className="t-money">₹101.67</b>.</p>
    </figure>
  )
}

export function IndexVsActive() {
  const cols = [
    { title: 'Index fund', icon: '📋', lines: ['Copies a list, such as the Nifty 50', 'No one picks winners', 'Low cost, around 0.2% a year here'] },
    { title: 'Active fund', icon: '🔍', lines: ['A manager picks the companies', 'Tries to beat the index', 'Higher cost, around 1% a year here'] },
  ]
  return (
    <figure className="grid grid-cols-2 gap-3" aria-label="Index fund compared with active fund">
      {cols.map((c) => (
        <div key={c.title} className="sticker flex flex-col gap-2 p-3">
          <p className="text-3xl" aria-hidden>{c.icon}</p>
          <p className="t-title">{c.title}</p>
          <ul className="flex flex-col gap-1">{c.lines.map((l) => <li key={l} className="t-caption">{l}</li>)}</ul>
        </div>
      ))}
    </figure>
  )
}

const scale: { label: string; tone: string; match?: RiskLabel }[] = [
  { label: 'Low', tone: 'bg-leaf/50' },
  { label: 'Low to Moderate', tone: 'bg-leaf', match: 'Low to Moderate' },
  { label: 'Moderate', tone: 'bg-saffron/50' },
  { label: 'Moderately High', tone: 'bg-saffron' },
  { label: 'High', tone: 'bg-tomato/60', match: 'High' },
  { label: 'Very High', tone: 'bg-tomato', match: 'Very High' },
]

export function Riskometer() {
  return (
    <figure className="sticker flex flex-col gap-2 p-4" aria-label="The riskometer scale from Low to Very High">
      <p className="t-caption text-ink-soft">The riskometer every fund shows, lowest to highest</p>
      <ol className="flex flex-col gap-2">
        {scale.map((r) => {
          const here = r.match ? funds.filter((f) => f.risk === r.match) : []
          return (
            <li key={r.label} className="flex items-stretch gap-3">
              <span aria-hidden className={`w-3 shrink-0 rounded-full ${r.tone}`} />
              <div className="py-1">
                <p className="font-bold">{r.label}</p>
                {here.length > 0 && <p className="t-caption text-ink-soft">In your practice list: {here.map((f) => f.category.toLowerCase()).join(', ')}</p>}
              </div>
            </li>
          )
        })}
      </ol>
    </figure>
  )
}

export function CostBars() {
  const rows = [
    { label: 'Index fund, 0.20%', fee: 20, w: '20%' },
    { label: 'Active fund, 1.00%', fee: 100, w: '100%' },
  ]
  return (
    <figure className="sticker flex flex-col gap-3 p-4" aria-label="Yearly fee on ₹10,000 at two expense ratios">
      <p className="t-caption text-ink-soft">Yearly fee on {formatINR(10000)} invested</p>
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex justify-between"><span className="t-body">{r.label}</span><b className="t-money">{formatINR(r.fee)}</b></div>
          <span className="mt-1 block h-3 overflow-hidden rounded-full bg-ink/10"><span className="block h-full rounded-full bg-plum" style={{ width: r.w }} /></span>
        </div>
      ))}
      <p className="t-body rounded-xl bg-paper-deep p-3">Illustration: {formatINR(1000)} a month for 20 years. At an assumed 9.8% a year after costs it grows to about <b className="t-money">₹7.46 lakh</b>. At 9.0% it is about <b className="t-money">₹6.73 lakh</b>. That 0.8 point gap costs about <b className="t-money">₹73,000</b>.</p>
    </figure>
  )
}

const futureValue = (monthly: number, annual: number, months: number) => {
  let v = 0
  for (let i = 0; i < months; i++) v = (v + monthly) * (1 + annual / 12)
  return v
}

export function CompoundChart() {
  const years = Array.from({ length: 11 }, (_, y) => y)
  const series = [
    { name: 'What you put in', color: 'var(--color-sky)', points: years.map((y) => 500 * 12 * y) },
    { name: 'Illustrative value', color: 'var(--color-plum)', points: years.map((y) => futureValue(500, 0.1, y * 12)) },
  ]
  return (
    <figure className="sticker p-4" aria-label="₹500 a month for 10 years, what you put in and an illustrative value">
      <p className="t-caption text-ink-soft">{formatINR(500)} a month for 10 years (year 0 to year 10)</p>
      <LineChart height={150} label="Illustration of compounding" series={series} />
      <ChartLegend series={series} />
      <p className="t-body mt-2">Put in <b className="t-money">{formatINR(60000)}</b>. At an assumed 10% a year it would be about <b className="t-money">{formatINR(103000)}</b>.</p>
      <p className="t-caption mt-1 text-ink-soft">An illustration, not a prediction. Real returns vary and can be negative.</p>
    </figure>
  )
}
