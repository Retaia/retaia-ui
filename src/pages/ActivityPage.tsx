import { useTranslation } from 'react-i18next'
import { AuthenticatedShell } from '../components/layout/AuthenticatedShell'
import { WorkspaceScaffold } from '../components/layout/WorkspaceScaffold'

export default function ActivityPage() {
  const { t } = useTranslation()

  return (
    <AuthenticatedShell currentView="activity">
      <WorkspaceScaffold
        eyebrow={t('page.activity.eyebrow')}
        title={t('page.activity.title')}
        description={t('page.activity.body')}
        routePath="/activity"
        constraintsTitle={t('page.scaffold.constraints')}
        constraints={[
          t('page.activity.constraint1'),
          t('page.activity.constraint2'),
          t('page.activity.constraint3'),
        ]}
        nextTitle={t('page.scaffold.next')}
        nextSteps={[
          t('page.activity.next1'),
          t('page.activity.next2'),
          t('page.activity.next3'),
        ]}
      />
    </AuthenticatedShell>
  )
}
