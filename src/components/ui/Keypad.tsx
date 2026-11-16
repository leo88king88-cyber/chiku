export function Keypad({ onDigit, onBackspace }: { onDigit: (d: string) => void; onBackspace: () => void }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']
  return (
    <div className="grid grid-cols-3 gap-2">
      {keys.map((k, i) =>
        k === '' ? (
          <span key={`gap${i}`} />
        ) : (
          <button
            key={`key${k}`}
            aria-label={k === '⌫' ? 'Delete' : k}
            onClick={() => (k === '⌫' ? onBackspace() : onDigit(k))}
            className="h-14 rounded-xl bg-paper text-2xl font-bold active:bg-paper-deep"
          >
            {k}
          </button>
        ),
      )}
    </div>
  )
}
