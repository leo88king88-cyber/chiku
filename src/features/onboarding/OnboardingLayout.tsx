import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

export function OnboardingLayout({
  step,
  total,
  children,
  footer,
  backTo,
}: {
  step?: number
  total?: number
  children: ReactNode
  footer: ReactNode
  backTo?: string
}) {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center gap-3 px-3 pt-3">
        <button
          aria-label="Back"
          onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          className="grid size-11 place-items-center rounded-full text-2xl"
        >
          ←
        </button>
        {step && total ? (
          <div className="flex-1" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step} aria-label={`Step ${step} of ${total}`}>
            <div className="flex gap-1.5">
              {Array.from({ length: total }, (_, i) => (
                <span key={i} className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-ink' : 'bg-ink/15'}`} />
              ))}
            </div>
          </div>
        ) : (
          <span className="flex-1" />
        )}
        <span className="w-11" />
      </header>
      <motion.main
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-1 flex-col gap-[var(--gap)] px-5 pb-4 pt-4"
      >
        {children}
      </motion.main>
      <footer className="sticky bottom-0 flex flex-col gap-2 bg-paper px-5 pb-5 pt-3">{footer}</footer>
    </div>
  )
}
