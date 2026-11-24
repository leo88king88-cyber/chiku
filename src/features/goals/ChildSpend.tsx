import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { ChoiceChips } from '../../components/ui/ChoiceChips'
import { formatINR } from '../../lib/money'
import { useActiveChild, useActivePersona, useStore } from '../../store'
import { moneySummary } from '../../store/money'
import { useToast } from '../../store/toast'
import { ChildHeader } from './ChildHeader'

const categories = [
  { id: 'Snacks', emoji: '🍿' },
  { id: 'Games', emoji: '🎮' },
  { id: 'Friends', emoji: '🎁' },
  { id: 'Stationery', emoji: '✏️' },
  { id: 'Sports', emoji: '⚽' },
  { id: 'Other', emoji: '✨' },
]

/** Record something you bought. Takes it out of "Can spend", within the limit your parent set. */
export function ChildSpend() {
  const navigate = useNavigate()
  const child = useActiveChild()
  const { band } = useActivePersona()
  const transactions = useStore((s) => s.transactions)
  const day = useStore((s) => s.demoDayOffset)
  const spendMoney = useStore((s) => s.spendMoney)
  const parent = useStore((s) => s.guardian.name.split(' ')[0])
  const toast = useToast((s) => s.show)
  const [category, setCategory] = useState('Snacks')
  const [amount, setAmount] = useState(50)
  const [error, setError] = useState<string | null>(null)
  if (!child) return null
  const kid = band === 'kid'
  const { spent } = moneySummary(child, transactions, day)
  const limitLeft = Math.max(0, child.controls.spendLimit - spent)
  const canSpend = Math.min(child.money.spend, limitLeft)

  const confirm = () => {
    const res = spendMoney(child.id, amount, category, category)
    if (res === 'ok') {
      toast(`Spent ${formatINR(amount)} on ${category.toLowerCase()}`)
      navigate('/c/home', { replace: true })
    } else if (res === 'insufficient') setError(`You only have ${formatINR(child.money.spend)} to spend.`)
    else setError(`${parent}'s limit is ${formatINR(child.controls.spendLimit)} a month. You can spend ${formatINR(limitLeft)} more.`)
  }

  return (
    <div className="flex min-h-full flex-col">
      <ChildHeader title="Spend money" />
      <main className="flex flex-1 flex-col gap-[var(--gap)] px-5 pb-4 pt-3">
        <p className="t-body">You can spend <b className="t-money">{formatINR(canSpend)}</b> right now.</p>
        <section className="flex flex-col gap-2">
          <h2 className="t-title">What did you buy?</h2>
          <div role="radiogroup" aria-label="What you bought" className="grid grid-cols-3 gap-3">
            {categories.map((c) => (
              <button key={c.id} role="radio" aria-checked={category === c.id} onClick={() => { setCategory(c.id); setError(null) }} className={`sticker flex min-h-20 flex-col items-center justify-center gap-1 p-2 ${category === c.id ? '!bg-saffron/40 ring-4 ring-saffron' : ''}`}>
                <span aria-hidden className={kid ? 'text-4xl' : 'text-3xl'}>{c.emoji}</span>
                <span className="t-caption font-bold">{c.id}</span>
              </button>
            ))}
          </div>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="t-title">How much?</h2>
          <ChoiceChips label="Amount" value={amount} options={[20, 50, 100, 200].map((v) => ({ value: v, label: formatINR(v) }))} onChange={(v) => { setAmount(v); setError(null) }} />
        </section>
        {error && <p role="alert" className="t-body rounded-xl bg-tomato/15 p-3">{error}</p>}
      </main>
      <footer className="px-5 pb-5 pt-3">
        <Button className="w-full !min-h-14" disabled={canSpend < 20} onClick={confirm}>Spend {formatINR(amount)}</Button>
      </footer>
    </div>
  )
}
