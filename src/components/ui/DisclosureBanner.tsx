/** Mandatory market-risk copy. `invest` adds the simulator and past-performance notes. */
export function DisclosureBanner({ invest = false }: { invest?: boolean }) {
  return (
    <aside className="t-caption rounded-xl bg-paper-deep px-3 py-2 text-ink-soft" aria-label="Risk disclosure">
      <p className="font-bold text-ink">Mutual fund investments are subject to market risks.</p>
      {invest && (
        <p className="mt-1">
          Read all scheme-related documents carefully. Past performance does not guarantee future returns. Practice results use virtual money and a mock market.
        </p>
      )}
    </aside>
  )
}
