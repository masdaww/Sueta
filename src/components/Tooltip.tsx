import { useState, useRef } from 'react'

type Props = {
  content: React.ReactNode
  children: React.ReactNode
  side?: 'top' | 'bottom'
}

export function Tooltip({ content, children, side = 'top' }: Props) {
  const [open, setOpen] = useState(false)
  const timer = useRef<number | null>(null)
  const show = () => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setOpen(true), 250)
  }
  const hide = () => {
    if (timer.current) window.clearTimeout(timer.current)
    setOpen(false)
  }
  return (
    <span className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {open && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute left-1/2 z-40 w-max max-w-[220px] -translate-x-1/2 whitespace-normal rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow ${
            side === 'top' ? '-top-1 -translate-y-full' : 'top-full mt-1'
          }`}
        >
          {content}
        </span>
      )}
    </span>
  )
}
