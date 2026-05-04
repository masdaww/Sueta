import { Link } from 'react-router-dom'
import { categories } from '@/data/seed'

export function CategoryStrip({ activeId }: { activeId?: string }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
      <Link
        to="/c"
        className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${
          !activeId ? 'bg-sueta-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
        }`}
      >
        Все
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          to={`/c/${c.id}`}
          className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${
            activeId === c.id
              ? 'bg-sueta-600 text-white'
              : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="mr-1">{c.emoji}</span>
          {c.name}
        </Link>
      ))}
    </div>
  )
}
