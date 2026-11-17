import { useContext, type ReactNode } from 'react'
import { FidelityContext } from './shared'

/** An illustration slot: the real art when styled, a labelled box in wireframe mode. */
export function Illus({ label, children, className = 'size-24' }: { label: string; children: ReactNode; className?: string }) {
  const f = useContext(FidelityContext)
  if (f === 'styled') return <>{children}</>
  return (
    <div role="img" aria-label={label} className={`relative grid shrink-0 place-items-center overflow-hidden border-[length:var(--bw)] border-dashed border-[color:var(--border-color)] bg-paper-deep ${className}`}>
      <svg className="absolute inset-0 size-full" preserveAspectRatio="none" aria-hidden>
        <line x1="0" y1="0" x2="100%" y2="100%" stroke="#999" />
        <line x1="100%" y1="0" x2="0" y2="100%" stroke="#999" />
      </svg>
      <span className="t-caption relative bg-paper-deep px-1 text-ink-soft">{label}</span>
    </div>
  )
}
