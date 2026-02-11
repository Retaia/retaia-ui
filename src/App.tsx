import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Card, Col, Container, Row, Stack } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { AssetList } from './components/AssetList'
import { ReviewSummary } from './components/ReviewSummary'
import { ReviewToolbar } from './components/ReviewToolbar'
import { INITIAL_ASSETS } from './data/mockAssets'
import {
  type Asset,
  type AssetFilter,
  countAssetsByState,
  filterAssets,
  getStateFromDecision,
  type DecisionAction,
  updateAssetsState,
} from './domain/assets'
import { type Locale } from './i18n/resources'

function App() {
  const assetListRegionRef = useRef<HTMLElement | null>(null)
  const { t, i18n } = useTranslation()
  const [filter, setFilter] = useState<AssetFilter>('ALL')
  const [search, setSearch] = useState('')
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS)
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  const [selectionAnchorId, setSelectionAnchorId] = useState<string | null>(null)
  const [batchIds, setBatchIds] = useState<string[]>([])
  const [undoStack, setUndoStack] = useState<
    Array<{ assets: Asset[]; selectedAssetId: string | null; batchIds: string[] }>
  >([])
  const [activityLog, setActivityLog] = useState<Array<{ id: number; label: string }>>([])
  const activityId = useRef(1)

  const visibleAssets = useMemo(() => {
    return filterAssets(assets, filter, search)
  }, [assets, filter, search])

  const counts = useMemo(() => countAssetsByState(assets), [assets])
  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.id === selectedAssetId) ?? null,
    [assets, selectedAssetId],
  )
  const nextPendingAsset = useMemo(
    () => assets.find((asset) => asset.state === 'DECISION_PENDING') ?? null,
    [assets],
  )
  const locale = (i18n.resolvedLanguage ?? 'fr') as Locale

  const logActivity = useCallback((label: string) => {
    setActivityLog((current) =>
      [{ id: activityId.current++, label }, ...current].slice(0, 8),
    )
  }, [])

  const pushUndoSnapshot = useCallback(() => {
    setUndoStack((current) =>
      [{ assets, selectedAssetId, batchIds }, ...current].slice(0, 30),
    )
  }, [assets, selectedAssetId, batchIds])

  const recordAction = useCallback(
    (label: string) => {
      pushUndoSnapshot()
      logActivity(label)
    },
    [logActivity, pushUndoSnapshot],
  )

  const handleDecision = (id: string, action: DecisionAction) => {
    const target = assets.find((asset) => asset.id === id)
    if (!target) {
      return
    }
    const nextState = getStateFromDecision(action, target.state)
    if (nextState === target.state) {
      return
    }

    recordAction(t('activity.actionDecision', { action, id }))
    setAssets((current) =>
      current.map((asset) => {
        if (asset.id !== id) {
          return asset
        }
        return {
          ...asset,
          state: nextState,
        }
      }),
    )
  }

  const applyDecisionToVisible = (action: 'KEEP' | 'REJECT') => {
    const targetIds = visibleAssets.map((asset) => asset.id)
    if (targetIds.length === 0) {
      return
    }

    recordAction(t('activity.actionVisible', { action, count: targetIds.length }))
    const nextState = action === 'KEEP' ? 'DECIDED_KEEP' : 'DECIDED_REJECT'
    setAssets((current) => updateAssetsState(current, targetIds, nextState))
  }

  const applyDecisionToBatch = (action: 'KEEP' | 'REJECT') => {
    if (batchIds.length === 0) {
      return
    }
    recordAction(t('activity.actionBatch', { action, count: batchIds.length }))
    const nextState = action === 'KEEP' ? 'DECIDED_KEEP' : 'DECIDED_REJECT'
    setAssets((current) => updateAssetsState(current, batchIds, nextState))
    setBatchIds([])
  }

  const toggleBatchAsset = useCallback(
    (id: string) => {
      setBatchIds((current) => {
        const willAdd = !current.includes(id)
        recordAction(
          willAdd
            ? t('activity.batchAdd', { id })
            : t('activity.batchRemove', { id }),
        )
        return willAdd ? [...current, id] : current.filter((value) => value !== id)
      })
    },
    [recordAction, t],
  )

  const handleAssetClick = (id: string, shiftKey: boolean) => {
    if (shiftKey) {
      toggleBatchAsset(id)
      return
    }
    setSelectedAssetId(id)
    setSelectionAnchorId(id)
  }

  const focusPending = () => {
    if (filter === 'DECISION_PENDING' && search === '') {
      return
    }
    recordAction(t('activity.filterPending'))
    setFilter('DECISION_PENDING')
    setSearch('')
  }

  const clearFilters = () => {
    if (filter === 'ALL' && search === '') {
      return
    }
    recordAction(t('activity.filterReset'))
    setFilter('ALL')
    setSearch('')
  }

  const selectAllVisibleInBatch = useCallback(() => {
    const missingCount = visibleAssets.filter((asset) => !batchIds.includes(asset.id)).length
    if (missingCount === 0) {
      return
    }
    recordAction(t('activity.batchVisible', { count: missingCount }))
    setBatchIds((current) => {
      const merged = new Set([...current, ...visibleAssets.map((asset) => asset.id)])
      return [...merged]
    })
  }, [batchIds, recordAction, t, visibleAssets])

  const undoLastAction = useCallback(() => {
    setUndoStack((current) => {
      if (current.length === 0) {
        return current
      }
      const [last, ...rest] = current
      setAssets(last.assets)
      setSelectedAssetId(last.selectedAssetId)
      setBatchIds(last.batchIds)
      logActivity(t('activity.undo'))
      return rest
    })
  }, [logActivity, t])

  const selectVisibleByOffset = useCallback(
    (offset: -1 | 1, extendBatchRange = false) => {
      if (visibleAssets.length === 0) {
        return
      }

      if (!selectedAssetId) {
        setSelectedAssetId(visibleAssets[0].id)
        setSelectionAnchorId(visibleAssets[0].id)
        return
      }

      const currentIndex = visibleAssets.findIndex((asset) => asset.id === selectedAssetId)
      if (currentIndex < 0) {
        setSelectedAssetId(visibleAssets[0].id)
        setSelectionAnchorId(visibleAssets[0].id)
        return
      }

      const nextIndex = Math.min(
        visibleAssets.length - 1,
        Math.max(0, currentIndex + offset),
      )
      const nextId = visibleAssets[nextIndex].id

      if (!extendBatchRange) {
        setSelectedAssetId(nextId)
        setSelectionAnchorId(nextId)
        return
      }

      const anchorId = selectionAnchorId ?? selectedAssetId
      const anchorIndex = visibleAssets.findIndex((asset) => asset.id === anchorId)
      if (anchorIndex < 0) {
        setSelectedAssetId(nextId)
        setSelectionAnchorId(nextId)
        return
      }

      const startIndex = Math.min(anchorIndex, nextIndex)
      const endIndex = Math.max(anchorIndex, nextIndex)
      const rangeIds = visibleAssets
        .slice(startIndex, endIndex + 1)
        .map((asset) => asset.id)

      setSelectedAssetId(nextId)
      setSelectionAnchorId(anchorId)
      setBatchIds((current) => {
        const merged = new Set([...current, ...rangeIds])
        const addedCount = merged.size - current.length
        if (addedCount > 0) {
          recordAction(t('activity.range', { count: addedCount }))
        }
        return [...merged]
      })
    },
    [recordAction, selectedAssetId, selectionAnchorId, t, visibleAssets],
  )

  const toggleBatchForSelectedAsset = useCallback(() => {
    if (!selectedAssetId) {
      return
    }
    toggleBatchAsset(selectedAssetId)
  }, [selectedAssetId, toggleBatchAsset])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTypingContext =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)

      if (isTypingContext) {
        return
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
        event.preventDefault()
        selectAllVisibleInBatch()
        return
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        undoLastAction()
        return
      }

      if (
        event.shiftKey &&
        (event.key === ' ' || event.key === 'Spacebar' || event.key === 'Space' || event.code === 'Space')
      ) {
        event.preventDefault()
        toggleBatchForSelectedAsset()
        return
      }

      if (event.key === 'j') {
        event.preventDefault()
        selectVisibleByOffset(1)
        return
      }

      if (event.key === 'k') {
        event.preventDefault()
        selectVisibleByOffset(-1)
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        selectVisibleByOffset(1, event.shiftKey)
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        selectVisibleByOffset(-1, event.shiftKey)
        return
      }

      if (event.key === 'Enter' && !selectedAssetId && visibleAssets.length > 0) {
        event.preventDefault()
        setSelectedAssetId(visibleAssets[0].id)
        setSelectionAnchorId(visibleAssets[0].id)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    selectedAssetId,
    visibleAssets,
    selectAllVisibleInBatch,
    selectVisibleByOffset,
    toggleBatchForSelectedAsset,
    undoLastAction,
  ])

  useEffect(() => {
    if (!selectedAssetId || !assetListRegionRef.current) {
      return
    }
    const target = assetListRegionRef.current.querySelector<HTMLElement>(
      `[data-asset-id="${selectedAssetId}"]`,
    )
    if (!target) {
      return
    }
    const activeElement = document.activeElement as HTMLElement | null
    const isTypingContext =
      !!activeElement &&
      (activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.isContentEditable)

    if (!isTypingContext && activeElement !== target) {
      target.focus()
    }
  }, [selectedAssetId, visibleAssets])

  return (
    <Container as="main" className="py-4">
      <header className="mb-3">
        <Stack direction="horizontal" className="justify-content-between align-items-start gap-2">
          <div>
            <h1 className="display-6 fw-bold mb-1">{t('app.title')}</h1>
            <p className="text-secondary mb-0">{t('app.subtitle')}</p>
          </div>
          <Stack direction="horizontal" gap={2} aria-label={t('app.language')}>
            <Button
              type="button"
              size="sm"
              variant={locale === 'fr' ? 'primary' : 'outline-primary'}
              onClick={() => void i18n.changeLanguage('fr')}
              aria-label={t('app.language.fr')}
            >
              FR
            </Button>
            <Button
              type="button"
              size="sm"
              variant={locale === 'en' ? 'primary' : 'outline-primary'}
              onClick={() => void i18n.changeLanguage('en')}
              aria-label={t('app.language.en')}
            >
              EN
            </Button>
          </Stack>
        </Stack>
      </header>

      <ReviewSummary
        total={assets.length}
        counts={counts}
        labels={{
          region: t('summary.region'),
          total: t('summary.total'),
          pending: t('summary.pending'),
          keep: t('summary.keep'),
          reject: t('summary.reject'),
        }}
      />
      <ReviewToolbar
        filter={filter}
        search={search}
        labels={{
          filter: t('toolbar.filter'),
          search: t('toolbar.search'),
          searchPlaceholder: t('toolbar.placeholder'),
          all: t('toolbar.all'),
        }}
        onFilterChange={setFilter}
        onSearchChange={setSearch}
      />

      <Card as="section" className="shadow-sm border-0 mt-3">
        <Card.Body>
          <h2 className="h5 mb-3">{t('actions.title')}</h2>
          <Stack direction="horizontal" className="flex-wrap gap-2">
            <Button type="button" variant="outline-primary" onClick={focusPending}>
              {t('actions.focusPending')}
            </Button>
            <Button
            type="button"
            variant="outline-success"
            onClick={() => applyDecisionToVisible('KEEP')}
            disabled={visibleAssets.length === 0}
          >
            {t('actions.keepVisible')}
            </Button>
            <Button
            type="button"
            variant="outline-danger"
            onClick={() => applyDecisionToVisible('REJECT')}
            disabled={visibleAssets.length === 0}
          >
            {t('actions.rejectVisible')}
            </Button>
            <Button type="button" variant="outline-secondary" onClick={clearFilters}>
              {t('actions.clearFilters')}
            </Button>
          </Stack>
          <Stack direction="horizontal" className="flex-wrap align-items-center gap-2 mt-3">
            <p className="mb-0 fw-semibold text-secondary">
              {t('actions.batchSelected', { count: batchIds.length })}
            </p>
            <Button
            type="button"
            variant="outline-success"
            onClick={() => applyDecisionToBatch('KEEP')}
            disabled={batchIds.length === 0}
          >
            {t('actions.keepBatch')}
            </Button>
            <Button
            type="button"
            variant="outline-danger"
            onClick={() => applyDecisionToBatch('REJECT')}
            disabled={batchIds.length === 0}
          >
            {t('actions.rejectBatch')}
            </Button>
            <Button
            type="button"
            variant="outline-secondary"
            onClick={() => setBatchIds([])}
            disabled={batchIds.length === 0}
          >
            {t('actions.clearBatch')}
            </Button>
          </Stack>
          <Stack direction="horizontal" className="flex-wrap align-items-center gap-2 mt-3">
            <Button
              type="button"
              variant="warning"
              onClick={undoLastAction}
              disabled={undoStack.length === 0}
            >
              {t('actions.undo')}
            </Button>
            <p className="mb-0 fw-semibold text-secondary">
              {t('actions.history', { count: undoStack.length })}
            </p>
          </Stack>
          <section className="border border-2 border-secondary-subtle rounded p-3 mt-3" aria-label={t('actions.journal')}>
            <h3 className="h6 mb-2">{t('actions.journal')}</h3>
            {activityLog.length === 0 ? (
              <p className="text-secondary mb-0">{t('actions.journalEmpty')}</p>
            ) : (
              <ul className="mb-0">
                {activityLog.map((entry) => (
                  <li key={entry.id}>{entry.label}</li>
                ))}
              </ul>
            )}
          </section>
          <p className="small text-secondary mb-0 mt-3">
            {t('actions.shortcuts')}
          </p>
        </Card.Body>
      </Card>

      <Card as="section" className="shadow-sm border-0 mt-3" aria-label={t('next.region')}>
        <Card.Body>
          <h2 className="h5 mb-3">{t('next.title')}</h2>
          {nextPendingAsset ? (
            <Stack direction="horizontal" className="flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <strong className="d-block">{nextPendingAsset.name}</strong>
                <p className="text-secondary mb-0">{nextPendingAsset.id}</p>
              </div>
              <Stack direction="horizontal" gap={2}>
                <Button
                  type="button"
                  variant="outline-success"
                  onClick={() => handleDecision(nextPendingAsset.id, 'KEEP')}
                >
                  KEEP
                </Button>
                <Button
                  type="button"
                  variant="outline-danger"
                  onClick={() => handleDecision(nextPendingAsset.id, 'REJECT')}
                >
                  REJECT
                </Button>
              </Stack>
            </Stack>
          ) : (
            <p className="text-secondary mb-0">{t('next.empty')}</p>
          )}
        </Card.Body>
      </Card>

      <Row as="section" className="g-3 mt-1">
        <Col
          as="section"
          xs={12}
          xl={8}
          aria-label={t('assets.region')}
          ref={assetListRegionRef}
        >
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h2 className="h5">{t('assets.title', { count: visibleAssets.length })}</h2>
              <p className="small text-secondary">{t('assets.help')}</p>
              <AssetList
                assets={visibleAssets}
                selectedAssetId={selectedAssetId}
                batchIds={batchIds}
                labels={{
                  empty: t('assets.empty'),
                  batch: t('assets.batchBadge'),
                  keep: 'KEEP',
                  reject: 'REJECT',
                  clear: 'CLEAR',
                }}
                onDecision={handleDecision}
                onAssetClick={handleAssetClick}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col as="section" xs={12} xl={4} aria-label={t('detail.region')}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h2 className="h5">{t('detail.title')}</h2>
              {selectedAsset ? (
                <div>
                  <strong className="d-block">{selectedAsset.name}</strong>
                  <p className="text-secondary mb-1">
                    {t('detail.id', { id: selectedAsset.id })}
                  </p>
                  <p className="text-secondary mb-3">
                    {t('detail.state', { state: selectedAsset.state })}
                  </p>
                  <Stack direction="horizontal" className="flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline-success"
                      onClick={() => handleDecision(selectedAsset.id, 'KEEP')}
                    >
                      KEEP
                    </Button>
                    <Button
                      type="button"
                      variant="outline-danger"
                      onClick={() => handleDecision(selectedAsset.id, 'REJECT')}
                    >
                      REJECT
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => handleDecision(selectedAsset.id, 'CLEAR')}
                    >
                      CLEAR
                    </Button>
                  </Stack>
                </div>
              ) : (
                <p className="text-secondary mb-0">{t('detail.empty')}</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default App
