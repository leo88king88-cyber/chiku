/** Two-to-four option segmented control (radio semantics). */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { value: T; label: string; hint?: string }[]
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-[var(--radius-btn)] border-[length:var(--bw)] border-[color:var(--border-color)] bg-white p-1">
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`flex min-h-11 flex-1 flex-col items-center justify-center rounded-[calc(var(--radius-btn)-4px)] px-2 text-center font-bold ${on ? 'bg-ink text-paper' : 'text-ink'}`}
          >
            <span>{o.label}</span>
            {o.hint && <span className={`t-caption font-normal ${on ? 'text-paper/80' : 'text-ink-soft'}`}>{o.hint}</span>}
          </button>
        )
      })}
    </div>
  )
}
