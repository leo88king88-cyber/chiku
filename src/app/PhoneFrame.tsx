import type { ReactNode } from 'react'
import { Toast } from '../components/ui/Toast'
import { useActivePersona } from '../store'

/**
 * Full-bleed on phones; centred 390x844 device frame on desktop.
 * `transform` makes the frame the containing block for fixed-position
 * children (sheets, toasts) so they stay inside the phone.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  const { band } = useActivePersona()
  return (
    <div
      data-band={band}
      className="relative flex h-dvh w-full flex-col overflow-hidden bg-paper transform-gpu sm:h-[min(844px,calc(100dvh-32px))] sm:w-[390px] sm:rounded-[44px] sm:border-[10px] sm:border-ink sm:shadow-2xl"
    >
      <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
      <Toast />
    </div>
  )
}
