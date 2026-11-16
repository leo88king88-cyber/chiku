import { motion } from 'framer-motion'
import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ScreenSkeleton } from '../components/ui/ScreenSkeleton'
import { DemoToolbar } from '../demo/DemoToolbar'
import { PhoneFrame } from './PhoneFrame'

export function AppShell() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-dvh items-center justify-center gap-6 pt-14 sm:p-4">
      <PhoneFrame>
        {/* Keyed on path so each screen fades in; opacity only, so it never reflows. */}
        <motion.div key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.16 }} className="min-h-full">
          <Suspense fallback={<ScreenSkeleton />}>
            <Outlet />
          </Suspense>
        </motion.div>
      </PhoneFrame>
      <DemoToolbar />
    </div>
  )
}
