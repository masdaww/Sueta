import { useNotify } from '@/store/notify'

const colors: Record<string, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  info: 'border-sky-200 bg-sky-50 text-sky-900',
  warn: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-rose-200 bg-rose-50 text-rose-900',
}

const icons: Record<string, string> = {
  success: '✅',
  info: 'ℹ️',
  warn: '⚠️',
  error: '⛔',
}

export function Toaster() {
  const toasts = useNotify((s) => s.toasts)
  const remove = useNotify((s) => s.remove)
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-3 sm:items-end sm:px-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto w-full max-w-sm rounded-xl border px-4 py-3 shadow-lg ${colors[t.type]} animate-[fadeIn_120ms_ease-out]`}
        >
          <div className="flex items-start gap-2">
            <div className="text-base leading-5">{icons[t.type]}</div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{t.title}</div>
              {t.message && <div className="mt-0.5 text-xs opacity-80">{t.message}</div>}
            </div>
            <button
              onClick={() => remove(t.id)}
              className="-mr-1 -mt-1 rounded p-1 text-current opacity-50 hover:opacity-100"
              aria-label="Закрыть"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
