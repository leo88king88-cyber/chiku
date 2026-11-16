import { motion } from 'framer-motion'
import { useState } from 'react'

const colors = ['#ffb020', '#f2572b', '#2fa36b', '#4c8dff', '#7b4fd6']

export function Confetti({ count = 28 }: { count?: number }) {
  const [pieces] = useState(() =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        dur: 1.8 + Math.random() * 1.2,
        rot: Math.random() * 540 - 270,
        color: colors[i % colors.length],
      })),
  )
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute top-0 block h-3 w-2 rounded-[2px]"
          style={{ left: `${p.left}%`, background: p.color }}
          initial={{ y: -20, opacity: 1 }}
          animate={{ y: 760, rotate: p.rot, opacity: [1, 1, 0] }}
          transition={{ duration: p.dur, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}
