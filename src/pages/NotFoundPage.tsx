import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="text-7xl mb-4">🦝</div>
      <h1 className="text-3xl font-extrabold text-ink-900">Страница исчезла</h1>
      <p className="text-ink-500 mt-2">Енот точно её не съел. Но проверьте URL ещё раз.</p>
      <Link to="/" className="ozor-btn-primary inline-flex mt-6 px-4 py-2.5">
        Вернуться домой
      </Link>
    </div>
  );
}
