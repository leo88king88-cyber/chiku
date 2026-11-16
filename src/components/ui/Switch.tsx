export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-11 w-[68px] shrink-0 rounded-full border-2 border-ink ${checked ? 'bg-leaf' : 'bg-paper-deep'}`}
    >
      <span className={`absolute top-1/2 size-8 -translate-y-1/2 rounded-full border-2 border-ink bg-white transition-all ${checked ? 'left-[30px]' : 'left-0.5'}`} />
    </button>
  )
}
