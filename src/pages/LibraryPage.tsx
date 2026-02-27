import { useEffect } from 'react'
import { Container, Row } from 'react-bootstrap'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppHeader } from '../components/app/AppHeader'
import { AssetDetailPanel } from '../components/app/AssetDetailPanel'
import { LibraryListSection } from '../components/library/LibraryListSection'
import { useLibraryPageController } from '../hooks/useLibraryPageController'
import { persistLastRoute, persistScrollY, readScrollY } from '../services/workspaceContextPersistence'

export function LibraryPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const controller = useLibraryPageController()

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
    <Container as="main" className="py-4">
      <AppHeader
        locale={controller.locale}
        t={controller.t}
        currentView="library"
        onOpenSettings={() => navigate('/settings')}
        onOpenAuth={() => navigate('/auth')}
        onOpenReview={() => navigate('/review')}
        onOpenActivity={() => navigate('/activity')}
        onOpenLibrary={() => navigate('/library')}
        onChangeLanguage={controller.onChangeLanguage}
      />

      <Row className="g-3 mt-1">
        <LibraryListSection
          t={controller.t}
          visibleAssets={controller.visibleAssets}
          selectedAssetId={controller.selectedAssetId}
          densityMode={controller.densityMode}
          search={controller.search}
          sort={controller.sort}
          hasMoreAssets={controller.hasMoreAssets}
          loadingMoreAssets={controller.loadingMoreAssets}
          onSearchChange={controller.setSearch}
          onSortChange={controller.setSort}
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
            const from =
              typeof window === 'undefined'
                ? '/library'
                : `${window.location.pathname}${window.location.search}`
            navigate(`/library/detail/${assetId}?from=${encodeURIComponent(from)}`)
          }}
        />
      </Row>
    </Container>
  )
}
