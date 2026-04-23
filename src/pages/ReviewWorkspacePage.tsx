import { useTranslation } from 'react-i18next'
import { AuthenticatedShell } from '../components/layout/AuthenticatedShell'
import { WorkspaceScaffold } from '../components/layout/WorkspaceScaffold'

export default function ReviewWorkspacePage() {
  const { t } = useTranslation()

  return (
    <AuthenticatedShell currentView="review">
      <WorkspaceScaffold
        eyebrow={t('page.review.eyebrow')}
        title={t('page.review.title')}
        description={t('page.review.body')}
        routePath="/review"
        constraintsTitle={t('page.scaffold.constraints')}
        constraints={[
          t('page.review.constraint1'),
          t('page.review.constraint2'),
          t('page.review.constraint3'),
        ]}
        nextTitle={t('page.scaffold.next')}
        nextSteps={[
          t('page.review.next1'),
          t('page.review.next2'),
          t('page.review.next3'),
        ]}
      />
    </AuthenticatedShell>
  )
}
