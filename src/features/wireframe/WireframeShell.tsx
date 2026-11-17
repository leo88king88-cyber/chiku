import { MotionConfig } from 'framer-motion'
import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { ScreenSkeleton } from '../../components/ui/ScreenSkeleton'

/** Wide, scrollable page chrome for the design-flow route. Deliberately not inside the phone frame. */
export function WireframeShell() {
  return (
    <div data-band="pro" className="min-h-dvh bg-paper-deep">
      <MotionConfig reducedMotion="user">
        <Suspense fallback={<ScreenSkeleton />}>
          <Outlet />
        </Suspense>
      </MotionConfig>
    </div>
  )
}
