import { motion } from 'framer-motion'
import { useId } from 'react'
import { formatINR } from '../../lib/money'

const colors = { spend: 'var(--color-tomato)', save: 'var(--color-leaf)', share: 'var(--color-sky)' } as const
export type JarKind = keyof typeof colors

/** Glass jar whose liquid rises with `fill` (0..1). Only a translateY animates. */
export function Jar({ kind, label, amount, fill, size = 88 }: { kind: JarKind; label: string; amount: number; fill: number; size?: number }) {
  const clip = 'jar' + useId().replace(/[^a-zA-Z0-9]/g, '')
  const level = Math.min(1, Math.max(0.04, fill))
  return (
    <div className="flex flex-col items-center gap-1" aria-label={`${label} jar, ${formatINR(amount)}`} role="img">
      <svg viewBox="0 0 100 120" width={size} height={size * 1.2} aria-hidden>
        <defs>
          <clipPath id={clip}>
            <rect x="12" y="30" width="76" height="84" rx="20" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clip})`}>
          <rect x="12" y="30" width="76" height="84" fill="white" />
          <motion.rect
            x="8" y="30" width="84" height="90" fill={colors[kind]} opacity="0.9"
            initial={{ y: 84 }}
            animate={{ y: 84 * (1 - level) }}
            transition={{ type: 'spring', stiffness: 60, damping: 14 }}
          />
        </g>
        <rect x="12" y="30" width="76" height="84" rx="20" fill="none" stroke="var(--color-ink)" strokeWidth="4" />
        <rect x="24" y="14" width="52" height="16" rx="6" fill="var(--color-saffron)" stroke="var(--color-ink)" strokeWidth="4" />
        <ellipse cx="30" cy="62" rx="4" ry="12" fill="white" opacity="0.5" />
      </svg>
      <span className="t-caption font-bold">{label}</span>
      <span className="t-money font-bold">{formatINR(amount)}</span>
    </div>
  )
}
