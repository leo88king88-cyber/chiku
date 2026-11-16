import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { ChoiceChips } from '../../components/ui/ChoiceChips'
import { formatINR } from '../../lib/money'
import { useActiveChild, useActivePersona, useStore } from '../../store'
import { useToast } from '../../store/toast'
import { ChildHeader } from './ChildHeader'

const reasons = [
  { value: 'A snack', label: '🍿 A snack' },
  { value: 'A gift', label: '🎁 A gift' },
  { value: 'School stuff', label: '📚 School stuff' },
  { value: 'Something fun', label: '🎮 Something fun' },
]

/** Ask for extra money with a reason. Tap-only for kids; optional note for teens. */
export function RequestMoney() {
  const navigate = useNavigate()
  const child = useActiveChild()
  const { band } = useActivePersona()
  const requestMoney = useStore((s) => s.requestMoney)
  const parent = useStore((s) => s.guardian.name.split(' ')[0])
  const toast = useToast((s) => s.show)
  const [amount, setAmount] = useState(200)
  const [reason, setReason] = useState('A snack')
  const [note, setNote] = useState('')
  if (!child) return null
  const kid = band === 'kid'

  const send = () => {
    const full = note.trim() ? `${reason}: ${note.trim()}` : reason
    const res = requestMoney(child.id, amount, full)
    toast(res === 'auto' ? `${formatINR(amount)} added to your Spend jar!` : `Asked ${parent} for ${formatINR(amount)}`)
    navigate('/c/home')
  }

  return (
    <div className="flex min-h-full flex-col">
      <ChildHeader title="Extra money" />
      <main className="flex flex-1 flex-col gap-[var(--gap)] px-5 pt-3">
        <section className="flex flex-col gap-2">
          <h2 className="t-title">How much?</h2>
          <ChoiceChips label="Amount" value={amount} options={[50, 100, 200, 500].map((v) => ({ value: v, label: formatINR(v) }))} onChange={setAmount} />
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="t-title">What for?</h2>
          <ChoiceChips label="Reason" value={reason} options={reasons} onChange={setReason} />
        </section>
        {!kid && (
          <label className="flex flex-col gap-2">
            <span className="font-bold">Add a note (optional)</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} autoComplete="off" placeholder="e.g. group project chart paper" className="sticker min-h-12 px-4 outline-none focus-visible:ring-4 focus-visible:ring-sky" />
          </label>
        )}
        <p className="t-caption text-ink-soft">
          {amount <= child.controls.extraMoneyAbove
            ? `Up to ${formatINR(child.controls.extraMoneyAbove)} is sent straight away.`
            : `${parent} will get this to approve.`}
        </p>
      </main>
      <footer className="px-5 pb-5 pt-3">
        <Button onClick={send} className="w-full !min-h-14">{kid ? 'Ask!' : 'Send request'}</Button>
      </footer>
    </div>
  )
}
