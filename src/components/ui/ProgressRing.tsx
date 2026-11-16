import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

/** Circular progress. Animates `pathLength` (a transform-free SVG attribute, GPU friendly). */
export function ProgressRing({
  value,
  size = 160,
  stroke = 12,
  color = 'var(--color-leaf)',
  children,
}: {
  value: number
  size?: number
  stroke?: number
  color?: string
  children?: ReactNode
}) {
  const r = (size - stroke) / 2
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label="Goal progress"
    >
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(31 27 58 / 0.12)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: Math.min(1, Math.max(0.001, value)) }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="relative">{children}</div>
    </div>
  )
}
