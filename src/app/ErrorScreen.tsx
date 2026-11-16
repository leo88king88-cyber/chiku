import { useRouteError } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { STORAGE_KEY } from '../store'

/** Last-resort screen for render errors or a failed chunk load. Offers a retry and a clean reset. */
export function ErrorScreen() {
  const error = useRouteError()
  const chunk = error instanceof Error && /dynamically imported module|Loading chunk/i.test(error.message)
  return (
    <div className="flex min-h-dvh items-center justify-center bg-paper-deep p-4">
      <main role="alert" className="flex w-full max-w-[390px] flex-col items-center gap-4 rounded-[28px] bg-paper p-8 text-center">
        <span className="text-6xl" aria-hidden>🛠️</span>
        <h1 className="t-display">Something went wrong</h1>
        <p className="t-body text-ink-soft">
          {chunk ? "We couldn't load this screen. Check your connection and try again." : 'This screen hit a snag. Your demo data is safe.'}
        </p>
        <Button className="w-full" onClick={() => location.reload()}>Try again</Button>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            localStorage.removeItem(STORAGE_KEY)
            location.assign('/')
          }}
        >
          Reset demo data
        </Button>
      </main>
    </div>
  )
}
