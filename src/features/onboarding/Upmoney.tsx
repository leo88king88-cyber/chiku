import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CHILD_APP_FULL, PARENT_APP } from '../../lib/brand'
import { useStore } from '../../store'

const holdings = [
  { name: 'Sagar Nifty 50 Index Fund', kind: 'Mutual fund', value: '₹1,82,000', change: '+14.2%' },
  { name: 'Tara Flexi Cap Fund', kind: 'Mutual fund', value: '₹94,500', change: '+11.8%' },
]

/**
 * The existing parent app's home, shown as a mock. A banner inside it introduces the kids' app; tapping
 * "Try now" opens that app's welcome screen. Styled as the host app, not as Sikka.
 */
export function Upmoney() {
  const navigate = useNavigate()
  const first = useStore((s) => s.guardian.name.split(' ')[0]) || 'there'
  return (
    <div className="flex min-h-full flex-col bg-white text-[#1f2d3d]">
      <div className="flex items-center justify-between px-6 pb-1 pt-3 text-sm font-bold" aria-hidden>
        <span>9:41</span>
        <span>▪▪▪▪ WiFi 🔋</span>
      </div>

      <header className="bg-[#1f2d3d] px-6 pb-6 pt-4 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-[#b4bfcc]">Good morning,</p>
            <h1 className="text-2xl font-bold">{first} <span aria-hidden>👋</span></h1>
          </div>
          <span aria-hidden className="grid size-12 place-items-center rounded-full bg-[#238451] text-xl font-bold">{first[0]}</span>
        </div>
        <section aria-label="Portfolio" className="mt-5 rounded-2xl bg-[#323f4f] p-5">
          <p className="text-sm text-[#b4bfcc]">Portfolio Value</p>
          <p className="mt-1 text-[36px] font-bold leading-tight">₹4,82,310</p>
          <p className="mt-1 text-sm font-bold text-[#7be0a0]">▲ +2.4% today</p>
        </section>
      </header>

      <main className="flex flex-col gap-5 px-5 py-5">
        <div className="grid grid-cols-3 gap-3">
          {['Invest', 'Withdraw', 'SIP'].map((a) => (
            <button key={a} className="min-h-12 rounded-xl bg-[#eef1f6] font-bold">{a}</button>
          ))}
        </div>

        <section aria-label="Your investments" className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#1b7548]">Your investments</h2>
          {holdings.map((h) => (
            <div key={h.name} className="flex items-center justify-between gap-3 rounded-2xl bg-[#f0f3f8] p-4">
              <div>
                <p className="font-bold">{h.name}</p>
                <p className="text-sm text-[#5b6878]">{h.kind}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{h.value}</p>
                <p className="text-sm font-bold text-[#1b7548]">{h.change}</p>
              </div>
            </div>
          ))}
        </section>

        <motion.section
          aria-label={`New: ${CHILD_APP_FULL}`}
          animate={{ scale: [1, 1.015, 1] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          className="flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-[#14603a] to-[#238451] p-5 text-white shadow-lg"
        >
          <div className="flex items-start gap-4">
            <span aria-hidden className="grid size-16 shrink-0 place-items-center rounded-2xl bg-white"><span className="grid size-11 place-items-center rounded-full bg-[#f4c242] text-2xl font-bold text-[#14603a]">₹</span></span>
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-[#d6f5e3]">New · {CHILD_APP_FULL}</p>
              <p className="text-xl font-bold leading-snug">Turn your kids' pocket money into lifelong saving habits</p>
            </div>
          </div>
          <div className="flex items-end justify-between gap-3">
            <p className="text-sm text-[#e6f8ee]">Kids' accounts linked to your {PARENT_APP} login and KYC.</p>
            <button onClick={() => navigate('/p/welcome')} className="min-h-12 shrink-0 rounded-full bg-[#f4c242] px-5 font-bold text-[#1f2d3d]">Try now →</button>
          </div>
        </motion.section>

        <p className="text-sm text-[#5b6878]">Mutual fund investments are subject to market risks.</p>
      </main>
    </div>
  )
}
