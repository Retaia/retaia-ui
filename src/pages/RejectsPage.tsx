import { useTranslation } from 'react-i18next'
import { AuthenticatedShell } from '../components/layout/AuthenticatedShell'
import { WorkspaceScaffold } from '../components/layout/WorkspaceScaffold'

export function RejectsPage() {
  const { t } = useTranslation()

  return (
    <AuthenticatedShell currentView="rejects">
      <WorkspaceScaffold
        eyebrow={t('page.rejects.eyebrow')}
        title={t('page.rejects.title')}
        description={t('page.rejects.body')}
        routePath="/rejects"
        constraintsTitle={t('page.scaffold.constraints')}
        constraints={[
          t('page.rejects.constraint1'),
          t('page.rejects.constraint2'),
          t('page.rejects.constraint3'),
        ]}
        nextTitle={t('page.scaffold.next')}
        nextSteps={[
          t('page.rejects.next1'),
          t('page.rejects.next2'),
          t('page.rejects.next3'),
        ]}
      />
    </AuthenticatedShell>
  )
}
