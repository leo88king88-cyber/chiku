import { AnimatePresence, motion } from 'framer-motion'
import { useToast } from '../../store/toast'

export function Toast() {
  const message = useToast((s) => s.message)
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4" role="status" aria-live="polite">
      <AnimatePresence>
        {message && (
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-full bg-ink px-4 py-3 text-center text-sm font-bold text-paper shadow-lg"
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
