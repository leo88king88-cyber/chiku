import { motion } from 'framer-motion'
import { useState, type ReactNode } from 'react'

/** A phone lock screen with one notification. Tapping the notification is the only way in. */
export function LockScreen({
  app,
  icon,
  title,
  body,
  onOpen,
  hint = 'Tap the notification',
}: {
  app: string
  icon: ReactNode
  title: string
  body: string
  onOpen: () => void
  hint?: string
}) {
  const [date] = useState(() => new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }))
  return (
    <div className="relative flex min-h-full flex-col items-center overflow-hidden bg-[linear-gradient(165deg,#1f1b3a_0%,#3a2f78_58%,#c2370f_130%)] px-4 pb-6 pt-10 text-white">
      <p className="t-caption flex w-full justify-between font-bold" aria-hidden>
        <span>5G</span>
        <span>🔋 82%</span>
      </p>
      <p className="mt-6 text-[20px] font-bold opacity-90" aria-hidden>🔒</p>
      <p className="mt-1 text-center text-[16px] opacity-90">{date}</p>
      <p className="mt-1 text-[84px] font-bold leading-none tracking-tight">9:41</p>

      <motion.button
        onClick={onOpen}
        initial={{ opacity: 0, y: -28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, type: 'spring', stiffness: 220, damping: 20 }}
        aria-label={`${app} notification: ${title}. ${body}`}
        className="mt-14 flex min-h-20 w-full items-start gap-3 rounded-3xl bg-white/90 p-3 text-left text-ink shadow-xl backdrop-blur"
      >
        <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink text-xl font-bold text-saffron">{icon}</span>
        <span className="flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="t-caption font-bold uppercase tracking-wide text-ink-soft">{app}</span>
            <span className="t-caption text-ink-soft">now</span>
          </span>
          <span className="block font-bold">{title}</span>
          <span className="t-caption block text-ink">{body}</span>
        </span>
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, -6, 0] }}
        transition={{ opacity: { delay: 1.4 }, y: { delay: 1.4, repeat: Infinity, duration: 1.6 } }}
        className="t-caption mt-5 rounded-full bg-white/20 px-4 py-2 font-bold"
      >
        👆 {hint}
      </motion.p>

      <div className="mt-auto flex flex-col items-center gap-3 pt-10" aria-hidden>
        <span className="t-caption opacity-80">Swipe up to unlock</span>
        <span className="h-1.5 w-32 rounded-full bg-white/70" />
      </div>
    </div>
  )
}
