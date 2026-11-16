import { Button } from '../../components/ui/Button'
import { ordinal } from '../../lib/dates'
import { useStore } from '../../store'
import { useToast } from '../../store/toast'
import type { Child } from '../../store/types'

/** Edge state: pocket money has not landed on its usual day. */
export function LateBanner({ child, kid }: { child: Child; kid: boolean }) {
  const late = useStore((s) => s.pocketMoneyLate)
  const parent = useStore((s) => s.guardian.name.split(' ')[0])
  const toast = useToast((s) => s.show)
  if (!late || child.pocketMoney?.mandate !== 'active') return null
  const due = ordinal(child.pocketMoney.dayOfMonth)
  return (
    <section role="status" className="sticker flex flex-col gap-2 !bg-saffron/25 p-3">
      <p className="t-body">
        <span aria-hidden>⏳ </span>
        {kid
          ? `Your pocket money is running late. Don't worry, it's coming!`
          : `Your pocket money was due on the ${due} and hasn't arrived yet.`}
      </p>
      <p className="t-caption text-ink-soft">Usually it lands within a day. {parent} can also retry it from the parent app.</p>
      <Button variant="secondary" onClick={() => toast(`${parent} has been reminded`)}>
        Remind {parent}
      </Button>
    </section>
  )
}
