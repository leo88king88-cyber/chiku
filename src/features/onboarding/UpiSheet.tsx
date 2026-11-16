import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Keypad } from '../../components/ui/Keypad'
import { Sheet } from '../../components/ui/Sheet'
import { formatINR } from '../../lib/money'
import { ordinal } from '../../lib/dates'
import { useStore } from '../../store'

const apps = [
  { name: 'PhonePe', color: '#5f259f' },
  { name: 'Google Pay', color: '#1a73e8' },
  { name: 'Paytm', color: '#0a8fc7' },
  { name: 'BHIM', color: '#c4570f' },
]

type Step = 'apps' | 'confirm' | 'pin' | 'done'

/** Mock UPI AutoPay mandate. Any 6-digit PIN works. Remount (via key) to reset. */
export function UpiSheet({
  open,
  onClose,
  onSuccess,
  amount,
  day,
  childName,
}: {
  open: boolean
  onClose: () => void
  onSuccess: (app: string, vpa: string) => void
  amount: number
  day: number
  childName: string
}) {
  const guardian = useStore((s) => s.guardian)
  const [step, setStep] = useState<Step>('apps')
  const [app, setApp] = useState(apps[0])
  const [pin, setPin] = useState('')

  useEffect(() => {
    if (pin.length !== 6) return
    const t1 = setTimeout(() => setStep('done'), 350)
    const t2 = setTimeout(() => onSuccess(app.name, guardian.upiId), 1700)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [pin]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Sheet open={open} onClose={step === 'done' ? undefined : onClose} title="UPI AutoPay">
      <p className="t-caption mb-3 flex items-center gap-2 text-ink-soft">🔒 Secure UPI · demo screen, no real money moves</p>

      {step === 'apps' && (
        <div className="flex flex-col gap-2">
          <h2 className="t-title">Pay with a UPI app</h2>
          {apps.map((a) => (
            <button
              key={a.name}
              onClick={() => {
                setApp(a)
                setStep('confirm')
              }}
              className="flex min-h-14 items-center gap-3 rounded-xl bg-paper px-3 text-left font-bold"
            >
              <span className="grid size-9 place-items-center rounded-full text-white" style={{ background: a.color }}>{a.name[0]}</span>
              {a.name}
            </button>
          ))}
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      )}

      {step === 'confirm' && (
        <div className="flex flex-col gap-3">
          <h2 className="t-title">Approve AutoPay</h2>
          <dl className="divide-y divide-ink/10 rounded-xl bg-paper px-4">
            {[
              ['To', 'Chiku Kids · pocket money'],
              ['Amount', `${formatINR(amount)} every month`],
              ['Debits on', `${ordinal(day)} of each month`],
              ['From', `${guardian.bankMasked} · ${guardian.upiId}`],
              ['Max per debit', formatINR(amount)],
            ].map(([k, v]) => (
              <div key={k} className="flex min-h-12 items-center justify-between gap-3 py-2">
                <dt className="text-ink-soft">{k}</dt>
                <dd className="t-money text-right font-bold">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="t-caption text-ink-soft">The money goes to {childName}'s jars on the day. Pause or cancel anytime in {app.name}.</p>
          <Button onClick={() => setStep('pin')} className="w-full">Approve</Button>
          <Button variant="ghost" onClick={() => setStep('apps')}>Back</Button>
        </div>
      )}

      {step === 'pin' && (
        <div className="flex flex-col gap-4">
          <h2 className="t-title text-center">Enter UPI PIN</h2>
          <p className="t-caption text-center text-ink-soft">{guardian.bankMasked} · demo: any 6 digits</p>
          <div className="flex justify-center gap-3" aria-label={`${pin.length} of 6 digits entered`}>
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} className={`size-4 rounded-full border-2 border-ink ${i < pin.length ? 'bg-ink' : ''}`} />
            ))}
          </div>
          <Keypad onDigit={(d) => setPin((p) => (p.length < 6 ? p + d : p))} onBackspace={() => setPin((p) => p.slice(0, -1))} />
        </div>
      )}

      {step === 'done' && (
        <div className="flex flex-col items-center gap-3 py-6" role="status">
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="grid size-16 place-items-center rounded-full bg-leaf text-4xl text-white">✓</motion.span>
          <h2 className="t-title">AutoPay is on</h2>
          <p className="t-caption text-ink-soft">{formatINR(amount)} every month · {ordinal(day)}</p>
        </div>
      )}
    </Sheet>
  )
}
