import type { ReactNode } from "react";

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ emoji = "🤷", title, description, action }: EmptyStateProps) {
  return (
    <div className="ozor-card p-10 text-center max-w-lg mx-auto animate-fade-in">
      <div className="text-5xl mb-3 select-none">{emoji}</div>
      <h2 className="text-xl font-bold text-ink-900">{title}</h2>
      {description && <p className="mt-2 text-ink-500">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
