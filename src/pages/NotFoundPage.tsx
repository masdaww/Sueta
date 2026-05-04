import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <div className="text-6xl">🤷‍♂️</div>
      <h1 className="mt-3 text-3xl font-extrabold text-slate-900">404 — потерялись в суете</h1>
      <p className="mt-2 text-slate-500">Эта страница убежала в отпуск. Возможно, в Геленджик.</p>
      <div className="mt-5">
        <Link to="/" className="btn-primary">На главную</Link>
      </div>
    </div>
  )
}
