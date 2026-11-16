import { animate } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { formatINR } from '../../lib/money'

/** Counts up/down to a rupee value. Updates one text node, so it is cheap. */
export function AnimatedNumber({ value }: { value: number }) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    const controls = animate(from.current, value, {
      duration: 0.9,
      ease: 'easeOut',
      onUpdate: (v) => setShown(Math.round(v)),
    })
    from.current = value
    return () => controls.stop()
  }, [value])
  return <span className="t-money">{formatINR(shown)}</span>
}
