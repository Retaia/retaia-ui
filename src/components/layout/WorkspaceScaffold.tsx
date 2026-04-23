import type { ReactNode } from 'react'

type Props = {
  eyebrow: string
  title: string
  description: string
  routePath: string
  constraintsTitle: string
  constraints: string[]
  nextTitle: string
  nextSteps: string[]
  children?: ReactNode
}

export function WorkspaceScaffold({
  eyebrow,
  title,
  description,
  routePath,
  constraintsTitle,
  constraints,
  nextTitle,
  nextSteps,
  children,
}: Props) {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="border-b border-gray-200 bg-[linear-gradient(135deg,_rgba(59,130,246,0.10),_transparent_55%)] px-6 py-6 dark:border-gray-800 dark:bg-[linear-gradient(135deg,_rgba(96,165,250,0.12),_transparent_55%)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-300">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 dark:text-white">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600 dark:text-gray-300">
            {description}
          </p>
          <div className="mt-4 inline-flex rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300">
            {routePath}
          </div>
        </div>

        <div className="grid gap-6 px-6 py-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/70 dark:bg-amber-950/20">
            <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200">{constraintsTitle}</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-950 dark:text-amber-100">
              {constraints.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-gray-200 bg-gray-50/80 p-5 dark:border-gray-800 dark:bg-gray-950/70">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{nextTitle}</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
              {nextSteps.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>

      {children}
    </div>
  )
}
