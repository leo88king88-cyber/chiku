import { motion } from 'framer-motion'
import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ScreenSkeleton } from '../components/ui/ScreenSkeleton'
import { DemoToolbar } from '../demo/DemoToolbar'
import { personas } from '../demo/personas'
import { useStore } from '../store'
import { PhoneFrame } from './PhoneFrame'

export function AppShell() {
  const { pathname } = useLocation()
  const owner = personas[useStore((s) => s.activePersona)].device
  return (
    <div className="flex min-h-dvh items-center justify-center gap-6 pt-14 sm:p-4">
      <div className="flex w-full min-w-0 flex-col items-center gap-2 sm:w-auto">
        <p className="t-caption hidden rounded-full bg-ink/10 px-3 py-1 font-bold sm:block">📱 {owner === 'rohan' ? "Rohan's" : "Priya's"} phone</p>
      <PhoneFrame>
        {/* Keyed on path so each screen fades in; opacity only, so it never reflows. */}
        <motion.div key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.16 }} className="flex flex-1 flex-col [&>*]:flex-1">
          <Suspense fallback={<ScreenSkeleton />}>
            <Outlet />
          </Suspense>
        </motion.div>
      </PhoneFrame>
      </div>
      <DemoToolbar />
    </div>
  )
}
