import { motion } from 'framer-motion'

/** Chiku the sparrow. Brand mascot; shown in kid band and on welcome/success moments. */
export function Chiku({ size = 120, cheer = false }: { size?: number; cheer?: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label="Chiku the sparrow"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: cheer ? 0.7 : 2.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <ellipse cx="60" cy="110" rx="26" ry="5" fill="#1f1b3a" opacity="0.15" />
      <path d="M52 26 q4-16 10-3 q6-13 11 4" stroke="#1f1b3a" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M44 100 v8 M76 100 v8" stroke="#1f1b3a" strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="66" r="40" fill="#ffb020" stroke="#1f1b3a" strokeWidth="4" />
      <path d="M22 70 q-14 6-10 24 q18 2 28-12z" fill="#f2572b" stroke="#1f1b3a" strokeWidth="4" strokeLinejoin="round"
        transform={cheer ? 'rotate(-35 26 72)' : undefined} />
      <circle cx="46" cy="58" r="6" fill="#1f1b3a" />
      <circle cx="74" cy="58" r="6" fill="#1f1b3a" />
      <circle cx="48" cy="56" r="2" fill="#fff" />
      <circle cx="76" cy="56" r="2" fill="#fff" />
      <circle cx="36" cy="72" r="6" fill="#f2572b" opacity="0.35" />
      <circle cx="84" cy="72" r="6" fill="#f2572b" opacity="0.35" />
      <path d="M53 68 h14 l-7 11z" fill="#f2572b" stroke="#1f1b3a" strokeWidth="3" strokeLinejoin="round" />
    </motion.svg>
  )
}
