import { useTranslation } from 'react-i18next'
import { useLocation, useParams } from 'react-router-dom'
import { AuthenticatedShell } from '../components/layout/AuthenticatedShell'
import { WorkspaceScaffold } from '../components/layout/WorkspaceScaffold'

type Props = {
  context: 'review' | 'library' | 'rejects'
}

export function StandaloneAssetDetailPage({ context }: Props) {
  const { t } = useTranslation()
  const { assetId } = useParams<{ assetId: string }>()
  const location = useLocation()
  const from = new URLSearchParams(location.search).get('from')
  const routePrefix = context === 'review' ? '/review' : context === 'library' ? '/library' : '/rejects'

  return (
    <AuthenticatedShell
      currentView={context}
      contextEyebrow={t('page.detail.eyebrow')}
      contextTitle={t('page.detail.title', { assetId: assetId ?? 'UNKNOWN' })}
      contextDescription={t('page.detail.body')}
      contextMeta={[routePrefix, from ? t('page.detail.next3WithContext', { from }) : t('page.detail.next3')]}
    >
      <WorkspaceScaffold
        main={
          <div className="space-y-4">
            <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/70 dark:bg-amber-950/20">
              <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                {t('page.scaffold.constraints')}
              </h2>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-950 dark:text-amber-100">
                {[t('page.detail.constraint1'), t('page.detail.constraint2'), t('page.detail.constraint3')].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        }
        inspector={
          <section className="rounded-xl border border-gray-200 bg-gray-50/80 p-5 dark:border-gray-800 dark:bg-gray-950/70">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('page.scaffold.next')}</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
              {[t('page.detail.next1'), t('page.detail.next2'), from ? t('page.detail.next3WithContext', { from }) : t('page.detail.next3')].map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        }
      />
    </AuthenticatedShell>
  )
}
