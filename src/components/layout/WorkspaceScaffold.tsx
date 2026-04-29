import type { ReactNode } from 'react'

type Props = {
  toolbar?: ReactNode
  main: ReactNode
  inspector?: ReactNode
}

export function WorkspaceScaffold({ toolbar, main, inspector }: Props) {
  return (
    <div className="space-y-4">
      {toolbar ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          {toolbar}
        </section>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.9fr)]">
        <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900 lg:p-5">
          {main}
        </section>

        <aside className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900 lg:p-5">
          {inspector}
        </aside>
      </div>
    </div>
  )
}
