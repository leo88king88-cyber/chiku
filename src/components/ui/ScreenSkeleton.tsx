/** Shown while a screen's code loads. Shapes echo a typical screen so the swap feels calm. */
export function ScreenSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="flex animate-pulse flex-col gap-4 p-5">
      <span className="h-8 w-2/3 rounded-xl bg-ink/10" />
      <span className="h-4 w-1/2 rounded-lg bg-ink/10" />
      <span className="h-40 rounded-[var(--radius-card)] bg-ink/10" />
      <span className="h-24 rounded-[var(--radius-card)] bg-ink/10" />
      <span className="h-12 rounded-[var(--radius-btn)] bg-ink/10" />
    </div>
  )
}
