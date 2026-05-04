type Props = {
  value: number
  size?: 'sm' | 'md' | 'lg'
  onChange?: (v: number) => void
  showValue?: boolean
}

const sizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-2xl',
}

export function Rating({ value, size = 'sm', onChange, showValue }: Props) {
  const stars = [1, 2, 3, 4, 5]
  return (
    <div className={`inline-flex items-center gap-1 ${sizes[size]}`}>
      <div className="flex items-center">
        {stars.map((s) => {
          const filled = value >= s - 0.25
          const half = !filled && value >= s - 0.75
          return (
            <button
              key={s}
              type="button"
              disabled={!onChange}
              onClick={() => onChange?.(s)}
              className={`leading-none transition ${onChange ? 'cursor-pointer' : 'cursor-default'} ${
                filled ? 'text-amber-400' : half ? 'text-amber-300' : 'text-slate-200'
              }`}
              aria-label={`${s} звёзд`}
            >
              ★
            </button>
          )
        })}
      </div>
      {showValue && <span className="text-xs text-slate-500">{value.toFixed(1)}</span>}
    </div>
  )
}
