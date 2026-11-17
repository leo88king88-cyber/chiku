import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Keypad } from '../../components/ui/Keypad'
import { formatMobile } from '../../lib/brand'

/** Mobile number entry. Digits only, 10 long. */
export function MobileStep({
  value,
  onChange,
  onSubmit,
  cta = 'Send OTP',
  children,
}: {
  value: string
  onChange: (digits: string) => void
  onSubmit: () => void
  cta?: string
  children?: React.ReactNode
}) {
  const valid = value.length === 10
  return (
    <>
      <label className="flex flex-col gap-2">
        <span className="font-bold">Mobile number</span>
        <span className="sticker flex min-h-14 items-center gap-2 px-4">
          <span className="font-bold text-ink-soft">+91</span>
          <input
            value={formatMobile(value)}
            onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
            inputMode="numeric"
            autoComplete="tel-national"
            aria-label="Mobile number"
            placeholder="98765 43210"
            className="min-h-12 flex-1 bg-transparent text-[18px] outline-none"
          />
        </span>
      </label>
      {children}
      <Button disabled={!valid} onClick={onSubmit} className="w-full">{cta}</Button>
      <p className="t-caption text-center text-ink-soft">By continuing you agree to the Terms and Privacy Policy.</p>
    </>
  )
}

/** Six-digit OTP with an on-screen keypad. Any code works in the demo. */
export function OtpStep({ mobile, onVerified, onChangeNumber }: { mobile: string; onVerified: () => void; onChangeNumber: () => void }) {
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [wait, setWait] = useState(30)

  useEffect(() => {
    const t = setInterval(() => setWait((w) => (w > 0 ? w - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    if (code.length !== 6) return
    const t = setTimeout(() => setVerifying(true), 150)
    const done = setTimeout(onVerified, 900)
    return () => {
      clearTimeout(t)
      clearTimeout(done)
    }
  }, [code]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-4">
      <p className="t-body">We sent a 6-digit code to <b className="t-money">+91 {formatMobile(mobile)}</b>.</p>
      <div className="flex justify-center gap-2" role="status" aria-label={`${code.length} of 6 digits entered`}>
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="sticker grid size-12 place-items-center text-xl font-bold">{code[i] ?? ''}</span>
        ))}
      </div>
      {verifying ? (
        <p role="status" className="t-body text-center font-bold">Verifying…</p>
      ) : (
        <p className="t-caption text-center text-ink-soft">Demo: any 6 digits work. {wait > 0 ? `Resend in ${wait}s.` : ''}</p>
      )}
      <Keypad onDigit={(d) => setCode((c) => (c.length < 6 ? c + d : c))} onBackspace={() => setCode((c) => c.slice(0, -1))} />
      <div className="flex justify-center gap-4">
        <Button variant="ghost" onClick={onChangeNumber}>Change number</Button>
        {wait === 0 && <Button variant="ghost" onClick={() => setWait(30)}>Resend OTP</Button>}
      </div>
    </div>
  )
}
