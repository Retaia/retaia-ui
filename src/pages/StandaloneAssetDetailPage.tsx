import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/app/AppHeader'
import { AssetDetailPanel } from '../components/app/AssetDetailPanel'
import { useStandaloneAssetDetailController } from '../hooks/useStandaloneAssetDetailController'
import { useUnsavedChangesGuard } from '../hooks/useUnsavedChangesGuard'

type Props = {
  context: 'review' | 'library'
}

export function StandaloneAssetDetailPage({ context }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const controller = useStandaloneAssetDetailController(context)
  const [hasUnsavedMetadata, setHasUnsavedMetadata] = useState(false)
  const confirmLeaveIfDirty = useUnsavedChangesGuard(hasUnsavedMetadata, controller.t('detail.unsavedChangesConfirm'))
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
  const backContextLabel = context === 'review' ? reviewRootLabel : controller.t('app.nav.library')
  const backButtonLabel = controller.t('app.backToContext', { context: backContextLabel })

  return (
    <AppHeader
      locale={controller.locale}
      t={controller.t}
      currentView={currentView}
      onOpenSettings={() => {
        if (confirmLeaveIfDirty()) {
          navigate('/settings')
        }
      }}
      onOpenAuth={() => {
        if (confirmLeaveIfDirty()) {
          navigate('/auth')
        }
      }}
      onOpenReview={() => {
        if (confirmLeaveIfDirty()) {
          navigate('/review')
        }
      }}
      onOpenActivity={() => {
        if (confirmLeaveIfDirty()) {
          navigate('/activity')
        }
      }}
      onOpenLibrary={() => {
        if (confirmLeaveIfDirty()) {
          navigate('/library')
        }
      }}
      onChangeLanguage={controller.onChangeLanguage}
    >
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-100"
        onClick={() => {
          if (confirmLeaveIfDirty()) {
            navigate(backPath)
          }
        }}
      >
        {backButtonLabel}
      </button>

      <ol className="mt-3 mb-0 flex flex-wrap items-center gap-2 p-0 text-sm" data-testid="standalone-detail-breadcrumb">
        {context === 'review' ? (
          <li className="inline-flex items-center gap-2 text-gray-600">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900"
              onClick={() => {
                if (confirmLeaveIfDirty()) {
                  navigate(reviewRootPath)
                }
              }}
            >
              {reviewRootLabel}
            </button>
          </li>
        ) : (
          <>
            <li className="inline-flex items-center gap-2 text-gray-600">
              <button
                type="button"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => {
                  if (confirmLeaveIfDirty()) {
                    navigate('/library')
                  }
                }}
              >
                {controller.t('app.nav.library')}
              </button>
            </li>
            <li className="inline-flex items-center gap-2 text-gray-600 before:mr-2 before:text-gray-400 before:content-['/']">
              <button
                type="button"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => {
                  if (confirmLeaveIfDirty()) {
                    navigate('/library')
                  }
                }}
              >
                {controller.t('detail.breadcrumbArchived')}
              </button>
            </li>
          </>
        )}
        <li className="inline-flex items-center gap-2 font-semibold text-gray-900 before:mr-2 before:text-gray-400 before:content-['/']">
          {controller.selectedAsset?.id ?? controller.t('detail.title')}
        </li>
      </ol>

      {controller.loadingState === 'loading' ? (
        <p className="text-xs text-gray-500 mt-3">{controller.t('detail.loading')}</p>
      ) : null}
      {controller.showNotFound ? (
        <p className="text-xs text-error-700 mt-3">{controller.t('detail.notFound')}</p>
      ) : null}

      <section className="flex flex-wrap gap-4 mt-1 justify-center">
        <AssetDetailPanel
          selectedAsset={controller.selectedAsset}
          decisionStatus={null}
          savingMetadata={controller.savingMetadata}
          metadataStatus={controller.metadataStatus}
          t={controller.t}
          onSaveMetadata={controller.saveMetadata}
          showDecisionActions={false}
          showPurgeActions={false}
          onMetadataDirtyChange={setHasUnsavedMetadata}
        />
      </section>
    </AppHeader>
  )
}
