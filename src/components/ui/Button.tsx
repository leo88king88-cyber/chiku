import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

const styles: Record<Variant, string> = {
  primary: 'bg-saffron text-ink border-[length:var(--bw)] border-[color:var(--border-color)]',
  secondary: 'bg-white text-ink border-[length:var(--bw)] border-[color:var(--border-color)]',
  ghost: 'bg-transparent text-ink underline',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`min-h-11 px-5 text-[length:var(--fs-body)] font-bold rounded-[var(--radius-btn)] active:translate-y-px disabled:opacity-50 ${styles[variant]} ${className}`}
    />
  )
}
