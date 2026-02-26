import { Breadcrumb, Button, Container, Row } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/app/AppHeader'
import { AssetDetailPanel } from '../components/app/AssetDetailPanel'
import { useStandaloneAssetDetailController } from '../hooks/useStandaloneAssetDetailController'

type Props = {
  context: 'review' | 'library'
}

export function StandaloneAssetDetailPage({ context }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const controller = useStandaloneAssetDetailController(context)
  const params = new URLSearchParams(location.search)
  const fromParam = params.get('from')
  const isValidContextFrom =
    typeof fromParam === 'string' &&
    (context === 'review'
      ? /^\/(review|activity)(\/|$|\?)/.test(fromParam)
      : /^\/library(\/|$|\?)/.test(fromParam))
  const backPath = isValidContextFrom ? fromParam : context === 'review' ? '/review' : '/library'
  const currentView = context === 'review' ? 'workspace' : 'library'
  const reviewRootPath = isValidContextFrom && typeof fromParam === 'string' && fromParam.startsWith('/activity')
    ? '/activity'
    : '/review'
  const reviewRootLabel = reviewRootPath === '/activity' ? controller.t('app.nav.activity') : controller.t('app.nav.review')
  const backButtonLabel =
    context === 'review'
      ? reviewRootPath === '/activity'
        ? controller.t('detail.backToActivity')
        : controller.t('detail.backToReview')
      : controller.t('detail.backToLibrary')

  return (
    <Container as="main" className="py-4">
      <AppHeader
        locale={controller.locale}
        t={controller.t}
        currentView={currentView}
        onOpenSettings={() => navigate('/settings')}
        onOpenAuth={() => navigate('/auth')}
        onOpenReview={() => navigate('/review')}
        onOpenActivity={() => navigate('/activity')}
        onOpenLibrary={() => navigate('/library')}
        onChangeLanguage={controller.onChangeLanguage}
      />

      <Button type="button" variant="outline-secondary" size="sm" onClick={() => navigate(backPath)}>
        {backButtonLabel}
      </Button>

      <Breadcrumb className="mt-3 mb-0" data-testid="standalone-detail-breadcrumb">
        {context === 'review' ? (
          <Breadcrumb.Item onClick={() => navigate(reviewRootPath)}>{reviewRootLabel}</Breadcrumb.Item>
        ) : (
          <>
            <Breadcrumb.Item onClick={() => navigate('/library')}>{controller.t('app.nav.library')}</Breadcrumb.Item>
            <Breadcrumb.Item onClick={() => navigate('/library')}>{controller.t('detail.breadcrumbArchived')}</Breadcrumb.Item>
          </>
        )}
        <Breadcrumb.Item active>
          {controller.selectedAsset?.id ?? controller.t('detail.title')}
        </Breadcrumb.Item>
      </Breadcrumb>

      {controller.loadingState === 'loading' ? (
        <p className="small text-secondary mt-3">{controller.t('detail.loading')}</p>
      ) : null}
      {controller.showNotFound ? (
        <p className="small text-danger mt-3">{controller.t('detail.notFound')}</p>
      ) : null}

      <Row className="g-3 mt-1 justify-content-center">
        <AssetDetailPanel
          selectedAsset={controller.selectedAsset}
          decisionStatus={null}
          savingMetadata={controller.savingMetadata}
          metadataStatus={controller.metadataStatus}
          t={controller.t}
          onSaveMetadata={controller.saveMetadata}
          showDecisionActions={false}
          showPurgeActions={false}
        />
      </Row>
    </Container>
  )
}
