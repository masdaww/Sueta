type Props = {
  emoji?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ emoji = '🤷', title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-6 py-16 text-center shadow-card">
      <div className="text-5xl">{emoji}</div>
      <h3 className="mt-3 text-lg font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
