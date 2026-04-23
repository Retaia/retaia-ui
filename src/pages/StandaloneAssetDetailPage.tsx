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
    <AuthenticatedShell currentView={context}>
      <WorkspaceScaffold
        eyebrow={t('page.detail.eyebrow')}
        title={t('page.detail.title', { assetId: assetId ?? 'UNKNOWN' })}
        description={t('page.detail.body')}
        routePath={`${routePrefix}/asset/:assetId`}
        constraintsTitle={t('page.scaffold.constraints')}
        constraints={[
          t('page.detail.constraint1'),
          t('page.detail.constraint2'),
          t('page.detail.constraint3'),
        ]}
        nextTitle={t('page.scaffold.next')}
        nextSteps={[
          t('page.detail.next1'),
          t('page.detail.next2'),
          from ? t('page.detail.next3WithContext', { from }) : t('page.detail.next3'),
        ]}
      />
    </AuthenticatedShell>
  )
}
