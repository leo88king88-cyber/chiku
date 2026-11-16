import { Outlet } from 'react-router-dom'
import { DemoToolbar } from '../demo/DemoToolbar'
import { PhoneFrame } from './PhoneFrame'

export function AppShell() {
  return (
    <div className="flex min-h-dvh items-center justify-center gap-6 pt-14 sm:p-4">
      <PhoneFrame>
        <Outlet />
      </PhoneFrame>
      <DemoToolbar />
    </div>
  )
}
