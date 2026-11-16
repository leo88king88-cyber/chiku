import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { DisclosureBanner } from '../../components/ui/DisclosureBanner'
import { useActiveChild } from '../../store'
import { InvestHeader } from './InvestHeader'

const carries = [
  ['🧾', 'Your KYC is pre-filled', 'No forms. We use what your parent already verified.'],
  ['🔁', 'Your SIP keeps running', 'Same fund, same date. You take over the AutoPay.'],
  ['📈', 'Your practice history comes too', 'See how you decided, and how it turned out.'],
]

/** Teaser for the one-tap graduation to the main platform at 18. */
export function Graduation() {
  const navigate = useNavigate()
  const child = useActiveChild()
  if (!child) return null
  return (
    <div className="flex min-h-full flex-col">
      <InvestHeader title="Turning 18" back="/c/home" />
      <main className="flex flex-col gap-[var(--gap)] px-5 pb-8 pt-3">
        <h2 className="t-display">At 18, {child.name}, you graduate.</h2>
        <p className="t-body">Your account moves to the main investing platform in one tap. Nothing to rebuild.</p>
        <div className="sticker flex items-center gap-4 p-4" aria-label="Timeline">
          <div className="flex-1 text-center"><p className="t-caption text-ink-soft">Today</p><p className="t-title">16</p></div>
          <div className="h-1.5 flex-[2] overflow-hidden rounded-full bg-ink/10"><motion.div className="h-full origin-left bg-leaf" initial={{ scaleX: 0 }} animate={{ scaleX: 0.5 }} transition={{ duration: 1 }} /></div>
          <div className="flex-1 text-center"><p className="t-caption text-ink-soft">Graduate</p><p className="t-title">18</p></div>
        </div>
        <ul className="flex flex-col gap-3">
          {carries.map(([icon, title, body], i) => (
            <motion.li key={title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.12 }} className="sticker flex items-start gap-3 p-3">
              <span aria-hidden className="text-2xl">{icon}</span>
              <div><p className="font-bold">{title}</p><p className="t-caption text-ink-soft">{body}</p></div>
            </motion.li>
          ))}
        </ul>
        <p className="t-caption text-ink-soft">Until then your parent stays in the loop and approves every new investment.</p>
        <Button className="w-full" onClick={() => navigate('/c/home')}>Got it</Button>
        <DisclosureBanner invest />
      </main>
    </div>
  )
}
