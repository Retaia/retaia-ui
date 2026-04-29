import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AssetDetailPanel } from '../components/app/AssetDetailPanel'
import { AuthenticatedShell } from '../components/layout/AuthenticatedShell'
import { WorkspaceScaffold } from '../components/layout/WorkspaceScaffold'
import { useStandaloneAssetDetailController } from '../hooks/useStandaloneAssetDetailController'

type Props = {
  context: 'review' | 'library' | 'rejects'
}

export function StandaloneAssetDetailPage({ context }: Props) {
  const controller = useStandaloneAssetDetailController(context)
  const location = useLocation()
  const navigate = useNavigate()
  const from = new URLSearchParams(location.search).get('from')
  const backHref = useMemo(() => {
    if (from && from.startsWith('/')) {
      return from
    }
    return controller.routePrefix
  }, [controller.routePrefix, from])

  return (
    <AuthenticatedShell
      currentView={context}
      contextEyebrow={controller.t('page.detail.eyebrow')}
      contextTitle={controller.t('page.detail.title', { assetId: controller.assetId ?? 'UNKNOWN' })}
      contextDescription={controller.t('page.detail.body')}
      contextMeta={[
        controller.workspaceLabel,
        from
          ? controller.t('page.detail.next3WithContext', { from })
          : controller.t('page.detail.next3'),
      ]}
      contextActions={
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          onClick={() => navigate(backHref)}
        >
          {controller.t('app.backToContext', { context: controller.workspaceLabel })}
        </button>
      }
    >
      <WorkspaceScaffold
        main={
          controller.loadingState === 'loading' ? (
            <section className="rounded-xl border border-gray-200 bg-gray-50/80 p-5 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-950/70 dark:text-gray-300">
              {controller.t('detail.loading')}
            </section>
          ) : controller.showNotFound ? (
            <section className="rounded-xl border border-error-200 bg-error-50/70 p-5 text-sm text-error-800 dark:border-error-900/60 dark:bg-error-950/20 dark:text-error-200">
              {controller.t('detail.notFound')}
            </section>
          ) : (
            <AssetDetailPanel
              selectedAsset={controller.selectedAsset}
              availability={controller.availability}
              previewingPurge={controller.previewingPurge}
              executingPurge={controller.executingPurge}
              purgeStatus={controller.purgeStatus}
              decisionStatus={controller.decisionStatus}
              processingProfileStatus={controller.processingProfileStatus}
              savingMetadata={controller.savingMetadata}
              savingProcessingProfile={controller.savingProcessingProfile}
              metadataStatus={controller.metadataStatus}
              t={controller.t}
              onDecision={controller.showDecisionActions ? controller.handleDecision : undefined}
              onChooseProcessingProfile={controller.showDecisionActions ? controller.chooseProcessingProfile : undefined}
              onSaveMetadata={controller.saveMetadata}
              onPreviewPurge={controller.showPurgeActions ? controller.previewSelectedAssetPurge : undefined}
              onExecutePurge={controller.showPurgeActions ? controller.executeSelectedAssetPurge : undefined}
              onRefreshAsset={controller.showRefreshAction ? controller.refreshSelectedAsset : undefined}
              showRefreshAction={controller.showRefreshAction}
              refreshingAsset={controller.refreshingAsset}
              showDecisionActions={controller.showDecisionActions}
              showPurgeActions={controller.showPurgeActions}
              showLibraryActions={controller.showLibraryActions}
              onReopenAsset={controller.showLibraryActions ? controller.reopenAsset : undefined}
              onReprocessAsset={controller.showLibraryActions ? controller.reprocessAsset : undefined}
              reopeningAsset={controller.reopeningAsset}
              reprocessingAsset={controller.reprocessingAsset}
              transitionStatus={controller.transitionStatus}
              layoutMode="standalone"
            />
          )
        }
        inspector={
          <div className="space-y-4">
            <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/70 dark:bg-amber-950/20">
              <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                {controller.t('page.scaffold.constraints')}
              </h2>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-950 dark:text-amber-100">
                {[
                  controller.t('page.detail.constraint1'),
                  controller.t('page.detail.constraint2'),
                  controller.t('page.detail.constraint3'),
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-gray-200 bg-gray-50/80 p-5 dark:border-gray-800 dark:bg-gray-950/70">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {controller.t('page.scaffold.next')}
              </h2>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
                {[
                  controller.t('page.detail.next1'),
                  controller.t('page.detail.next2'),
                  from
                    ? controller.t('page.detail.next3WithContext', { from })
                    : controller.t('page.detail.next3'),
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {controller.retryStatus ? (
              <section className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
                {controller.retryStatus}
              </section>
            ) : null}
          </div>
        }
      />
    </AuthenticatedShell>
  )
}
