import { useLocation } from 'react-router-dom'
import { useActivePersona } from '../../store'
import { formatINR } from '../../lib/money'

/** Milestone-0 stand-in for every route. Also a live specimen of the band tokens. */
export function Placeholder() {
  const { pathname } = useLocation()
  const p = useActivePersona()
  return (
    <main className="flex flex-col gap-[var(--gap)] p-5">
      <p className="t-caption font-bold uppercase tracking-wide text-ink-soft">Chiku · {p.name} · {p.band} band</p>
      <h1 className="t-display">Hi {p.name}! {p.emoji}</h1>
      <div className="sticker p-4">
        <p className="t-title">Coming soon</p>
        <p className="t-body mt-1 text-ink-soft">
          <code>{pathname}</code> is not built yet. The shell, phone frame and demo toolbar are ready.
        </p>
        <p className="t-money t-title mt-3 text-leaf">{formatINR(100000)}</p>
      </div>
      <button className="min-h-11 rounded-[var(--radius-btn)] border-[length:var(--bw)] border-[color:var(--border-color)] bg-saffron px-5 text-[length:var(--fs-body)] font-bold">
        Sample button
      </button>
    </main>
  )
}
