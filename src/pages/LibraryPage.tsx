import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/app/AppHeader'
import { AssetDetailPanel } from '../components/app/AssetDetailPanel'
import { LibraryListSection } from '../components/library/LibraryListSection'
import { useLibraryPageController } from '../hooks/useLibraryPageController'
import { persistLastRoute, persistScrollY, readScrollY } from '../services/workspaceContextPersistence'
import { useUnsavedChangesGuard } from '../hooks/useUnsavedChangesGuard'

export function LibraryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const controller = useLibraryPageController()
  const [hasUnsavedMetadata, setHasUnsavedMetadata] = useState(false)
  const confirmLeaveIfDirty = useUnsavedChangesGuard(hasUnsavedMetadata, controller.t('detail.unsavedChangesConfirm'))
  const getStandaloneLibraryDetailHref = (assetId: string) => {
    const from =
      typeof window === 'undefined'
        ? '/library'
        : `${window.location.pathname}${window.location.search}`
    return `/library/detail/${assetId}?from=${encodeURIComponent(from)}`
  }

  useEffect(() => {
    persistLastRoute(location.pathname, location.search)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const savedScrollY = readScrollY('library')
    if (savedScrollY <= 0) {
      return
    }
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: savedScrollY, left: 0, behavior: 'auto' })
    })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const handleScroll = () => {
      persistScrollY('library', window.scrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <AppHeader
      locale={controller.locale}
      t={controller.t}
      currentView="library"
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
      <div className="flex flex-wrap gap-4 mt-1">
        <LibraryListSection
          t={controller.t}
          visibleAssets={controller.visibleAssets}
          selectedAssetId={controller.selectedAssetId}
          densityMode={controller.densityMode}
          displayType={controller.displayType}
          search={controller.search}
          sort={controller.sort}
          hasMoreAssets={controller.hasMoreAssets}
          loadingMoreAssets={controller.loadingMoreAssets}
          onSearchChange={controller.setSearch}
          onSortChange={controller.setSort}
          onDisplayTypeChange={controller.setDisplayType}
          onAssetClick={controller.onAssetClick}
          onLoadMoreAssets={controller.loadMoreAssets}
        />
        <AssetDetailPanel
          selectedAsset={controller.selectedAsset}
          decisionStatus={null}
          savingMetadata={controller.savingMetadata}
          metadataStatus={controller.metadataStatus}
          t={controller.t}
          onSaveMetadata={controller.onSaveMetadata}
          showDecisionActions={false}
          showPurgeActions={false}
          onKeywordClick={controller.onKeywordClick}
          onOpenStandaloneDetail={(assetId) => {
            if (!confirmLeaveIfDirty()) {
              return
            }
            navigate(getStandaloneLibraryDetailHref(assetId))
          }}
          standaloneHref={controller.selectedAsset ? getStandaloneLibraryDetailHref(controller.selectedAsset.id) : undefined}
          onMetadataDirtyChange={setHasUnsavedMetadata}
        />
      </div>
    </AppHeader>
  )
}
