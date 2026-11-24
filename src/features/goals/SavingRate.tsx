import { ChoiceChips } from '../../components/ui/ChoiceChips'
import { formatINR } from '../../lib/money'
import { splitAmount, useStore } from '../../store'
import type { Child } from '../../store/types'

/** How each pocket money is shared between "Can spend" and "Saved". Teens choose; younger children are told. */
export function SavingRate({ child, kid }: { child: Child; kid: boolean }) {
  const setRate = useStore((s) => s.setSavingRate)
  const parent = useStore((s) => s.guardian.name.split(' ')[0])
  const amount = child.pocketMoney?.amount ?? 500
  const parts = splitAmount(amount, child.split)
  return (
    <section aria-label="How pocket money is shared" className="sticker w-full p-4 text-left">
      <h2 className="t-title">When pocket money comes</h2>
      <p className="t-body mt-1">
        Out of <b className="t-money">{formatINR(amount)}</b>: <b className="t-money">{formatINR(parts.spend)}</b> goes to <b>Can spend</b> and <b className="t-money">{formatINR(parts.save)}</b> goes to <b>Saved</b>.
      </p>
      {kid ? (
        <p className="t-caption mt-2 text-ink-soft">{parent} chose this split for you.</p>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          <p className="t-caption text-ink-soft">How much do you want to save each time?</p>
          <ChoiceChips label="Share to save" value={child.split.save} options={[20, 30, 40, 50, 60].map((v) => ({ value: v, label: `${v}%` }))} onChange={(v) => setRate(child.id, v)} />
        </div>
      )}
    </section>
  )
}
