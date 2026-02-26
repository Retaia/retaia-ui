import { Button, Container, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/app/AppHeader'
import { AssetDetailPanel } from '../components/app/AssetDetailPanel'
import { useStandaloneAssetDetailController } from '../hooks/useStandaloneAssetDetailController'

type Props = {
  context: 'review' | 'library'
}

export function StandaloneAssetDetailPage({ context }: Props) {
  const navigate = useNavigate()
  const controller = useStandaloneAssetDetailController(context)
  const backPath = context === 'review' ? '/review' : '/library'
  const currentView = context === 'review' ? 'workspace' : 'library'

  return (
    <Container as="main" className="py-4">
      <AppHeader
        locale={controller.locale}
        t={controller.t}
        currentView={currentView}
        onOpenSettings={() => navigate('/settings')}
        onOpenAuth={() => navigate('/auth')}
        onOpenReview={() => navigate('/review')}
        onOpenBatch={() => navigate('/batch')}
        onOpenBatchReports={() => navigate('/batch/reports')}
        onOpenActivity={() => navigate('/activity')}
        onOpenLibrary={() => navigate('/library')}
        onChangeLanguage={controller.onChangeLanguage}
      />

      <Button type="button" variant="outline-secondary" size="sm" onClick={() => navigate(backPath)}>
        {context === 'review' ? controller.t('detail.backToReview') : controller.t('detail.backToLibrary')}
      </Button>

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
