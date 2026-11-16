import { motion } from 'framer-motion'

const marks = [25, 50, 75, 100]

export function MilestoneTrack({ hit }: { hit: number[] }) {
  return (
    <ol className="flex items-center justify-between" aria-label="Milestones">
      {marks.map((m) => {
        const on = hit.includes(m)
        return (
          <li key={m} className="flex flex-col items-center gap-1" aria-label={`${m}% ${on ? 'reached' : 'not yet'}`}>
            <motion.span
              key={String(on)}
              initial={on ? { scale: 0.4, rotate: -30 } : false}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 12 }}
              className={`grid size-11 place-items-center rounded-full border-[length:var(--bw)] border-[color:var(--border-color)] text-xl ${on ? 'bg-saffron' : 'bg-paper-deep grayscale'}`}
            >
              ⭐
            </motion.span>
            <span className="t-caption font-bold">{m}%</span>
          </li>
        )
      })}
    </ol>
  )
}
