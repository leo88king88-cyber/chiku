export function ChoiceChips<T extends string | number | boolean>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={String(o.value)}
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.value)}
            className={`min-h-11 rounded-full border-[length:var(--bw)] border-[color:var(--border-color)] px-4 text-[length:var(--fs-body)] font-bold ${on ? 'bg-ink text-paper' : 'bg-white text-ink'}`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
