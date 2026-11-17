import { motion } from 'framer-motion'
import { useStaticMode } from './staticMode'

export interface Series {
  name: string
  color: string
  points: number[]
  dashed?: boolean
}

const W = 300

/** Minimal SVG line chart. The draw-on animation is a single pathLength tween per line. */
export function LineChart({ series, height = 140, label }: { series: Series[]; height?: number; label: string }) {
  const still = useStaticMode()
  const all = series.flatMap((s) => s.points)
  const min = Math.min(...all)
  const max = Math.max(...all)
  const pad = (max - min || 1) * 0.12
  const lo = min - pad
  const hi = max + pad
  const n = Math.max(...series.map((s) => s.points.length))
  const x = (i: number) => 6 + (i / Math.max(1, n - 1)) * (W - 18)
  const y = (v: number) => height - 8 - ((v - lo) / (hi - lo)) * (height - 16)
  const summary = series.map((s) => `${s.name} ${Math.round(s.points[0]).toLocaleString('en-IN')} to ${Math.round(s.points.at(-1)!).toLocaleString('en-IN')}`).join('; ')
  return (
    <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label={`${label}. ${summary}`} className="w-full">
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={W} y1={height * f} y2={height * f} stroke="rgb(31 27 58 / 0.08)" />
      ))}
      {series.map((s) => {
        const d = s.points.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
        const last = s.points.length - 1
        return (
          <g key={s.name}>
            <motion.path
              d={d}
              fill="none"
              stroke={s.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={s.dashed ? '1 6' : undefined}
              initial={still ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
            <circle cx={x(last)} cy={y(s.points[last])} r="4" fill={s.color} />
          </g>
        )
      })}
    </svg>
  )
}

export function ChartLegend({ series }: { series: Pick<Series, 'name' | 'color' | 'dashed'>[] }) {
  return (
    <ul className="t-caption flex flex-wrap gap-x-4 gap-y-1">
      {series.map((s) => (
        <li key={s.name} className="flex items-center gap-1.5">
          <span className="inline-block h-1 w-5 rounded-full" style={{ background: s.color, opacity: s.dashed ? 0.6 : 1 }} />
          {s.name}
        </li>
      ))}
    </ul>
  )
}
