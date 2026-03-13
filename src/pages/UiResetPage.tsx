import { Link } from 'react-router-dom'

type UiResetPageProps = {
  title: string
  route: string
}

export function UiResetPage({ title, route }: UiResetPageProps) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          UI reset in progress
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm text-gray-600">
          Cette page a ete retiree pour reprise complete. Route active: <code>{route}</code>.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-sm">
          <Link className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50" to="/review">
            Review
          </Link>
          <Link className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50" to="/activity">
            Activity
          </Link>
          <Link className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50" to="/library">
            Library
          </Link>
          <Link className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50" to="/auth">
            Auth
          </Link>
          <Link className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50" to="/settings">
            Settings
          </Link>
        </div>
      </div>
    </main>
  )
}
