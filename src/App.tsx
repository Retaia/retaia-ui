import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
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

function App() {
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

    recordAction(`${action} ${id}`)
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

    recordAction(`${action} visibles (${targetIds.length})`)
    const nextState = action === 'KEEP' ? 'DECIDED_KEEP' : 'DECIDED_REJECT'
    setAssets((current) => updateAssetsState(current, targetIds, nextState))
  }

  const applyDecisionToBatch = (action: 'KEEP' | 'REJECT') => {
    if (batchIds.length === 0) {
      return
    }
    recordAction(`${action} batch (${batchIds.length})`)
    const nextState = action === 'KEEP' ? 'DECIDED_KEEP' : 'DECIDED_REJECT'
    setAssets((current) => updateAssetsState(current, batchIds, nextState))
    setBatchIds([])
  }

  const toggleBatchAsset = useCallback(
    (id: string) => {
      setBatchIds((current) => {
        const willAdd = !current.includes(id)
        recordAction(willAdd ? `Ajout batch ${id}` : `Retrait batch ${id}`)
        return willAdd ? [...current, id] : current.filter((value) => value !== id)
      })
    },
    [recordAction],
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
    recordAction('Filtre: à traiter')
    setFilter('DECISION_PENDING')
    setSearch('')
  }

  const clearFilters = () => {
    if (filter === 'ALL' && search === '') {
      return
    }
    recordAction('Réinitialiser filtres')
    setFilter('ALL')
    setSearch('')
  }

  const selectAllVisibleInBatch = useCallback(() => {
    const missingCount = visibleAssets.filter((asset) => !batchIds.includes(asset.id)).length
    if (missingCount === 0) {
      return
    }
    recordAction(`Sélection batch visible (+${missingCount})`)
    setBatchIds((current) => {
      const merged = new Set([...current, ...visibleAssets.map((asset) => asset.id)])
      return [...merged]
    })
  }, [batchIds, recordAction, visibleAssets])

  const undoLastAction = useCallback(() => {
    setUndoStack((current) => {
      if (current.length === 0) {
        return current
      }
      const [last, ...rest] = current
      setAssets(last.assets)
      setSelectedAssetId(last.selectedAssetId)
      setBatchIds(last.batchIds)
      logActivity('Annulation')
      return rest
    })
  }, [logActivity])

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
          recordAction(`Sélection plage (${addedCount})`)
        }
        return [...merged]
      })
    },
    [recordAction, selectedAssetId, selectionAnchorId, visibleAssets],
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

  return (
    <main className="app">
      <header className="app__header">
        <h1>Retaia UI</h1>
        <p>Review simple pour décider KEEP ou REJECT</p>
      </header>

      <ReviewSummary total={assets.length} counts={counts} />
      <ReviewToolbar
        filter={filter}
        search={search}
        onFilterChange={setFilter}
        onSearchChange={setSearch}
      />

      <section className="panel productivity-panel">
        <h2>Actions rapides</h2>
        <div className="quick-actions">
          <button type="button" onClick={focusPending}>
            Voir à traiter
          </button>
          <button
            type="button"
            onClick={() => applyDecisionToVisible('KEEP')}
            disabled={visibleAssets.length === 0}
          >
            KEEP visibles
          </button>
          <button
            type="button"
            onClick={() => applyDecisionToVisible('REJECT')}
            disabled={visibleAssets.length === 0}
          >
            REJECT visibles
          </button>
          <button type="button" onClick={clearFilters}>
            Réinitialiser filtres
          </button>
        </div>
        <div className="batch-actions">
          <p>Batch sélectionné: {batchIds.length}</p>
          <button
            type="button"
            onClick={() => applyDecisionToBatch('KEEP')}
            disabled={batchIds.length === 0}
          >
            KEEP batch
          </button>
          <button
            type="button"
            onClick={() => applyDecisionToBatch('REJECT')}
            disabled={batchIds.length === 0}
          >
            REJECT batch
          </button>
          <button
            type="button"
            onClick={() => setBatchIds([])}
            disabled={batchIds.length === 0}
          >
            Vider batch
          </button>
        </div>
        <div className="history-actions">
          <button type="button" onClick={undoLastAction} disabled={undoStack.length === 0}>
            Annuler dernière action
          </button>
          <p>Historique disponible: {undoStack.length}</p>
        </div>
        <section className="activity-log" aria-label="Journal d'actions">
          <h3>Journal d&apos;actions</h3>
          {activityLog.length === 0 ? (
            <p className="empty-state">Aucune action pour le moment.</p>
          ) : (
            <ul>
              {activityLog.map((entry) => (
                <li key={entry.id}>{entry.label}</li>
              ))}
            </ul>
          )}
        </section>
        <p className="keyboard-hint">
          Raccourcis desktop: j/k (navigation), Flèches (navigation), Shift+Flèches
          (sélection plage), Entrée (ouvrir), Shift+Espace (batch), Ctrl/Cmd+A (batch
          visible), Ctrl/Cmd+Z (annuler)
        </p>
      </section>

      <section className="panel" aria-label="Prochain asset">
        <h2>Prochain asset à traiter</h2>
        {nextPendingAsset ? (
          <div className="next-asset">
            <div>
              <strong>{nextPendingAsset.name}</strong>
              <p>{nextPendingAsset.id}</p>
            </div>
            <div className="decision-actions">
              <button type="button" onClick={() => handleDecision(nextPendingAsset.id, 'KEEP')}>
                KEEP
              </button>
              <button type="button" onClick={() => handleDecision(nextPendingAsset.id, 'REJECT')}>
                REJECT
              </button>
            </div>
          </div>
        ) : (
          <p className="empty-state">Plus aucun asset en attente.</p>
        )}
      </section>

      <section className="workspace">
        <section className="panel" aria-label="Liste des assets">
          <h2>Assets ({visibleAssets.length})</h2>
          <p className="desktop-hint">Clic: détail | Shift+clic: ajouter au batch</p>
          <AssetList
            assets={visibleAssets}
            selectedAssetId={selectedAssetId}
            batchIds={batchIds}
            onDecision={handleDecision}
            onAssetClick={handleAssetClick}
          />
        </section>

        <section className="panel" aria-label="Détail de l'asset">
          <h2>Détail</h2>
          {selectedAsset ? (
            <div className="asset-detail">
              <strong>{selectedAsset.name}</strong>
              <p>ID: {selectedAsset.id}</p>
              <p>État: {selectedAsset.state}</p>
              <div className="decision-actions">
                <button type="button" onClick={() => handleDecision(selectedAsset.id, 'KEEP')}>
                  KEEP
                </button>
                <button type="button" onClick={() => handleDecision(selectedAsset.id, 'REJECT')}>
                  REJECT
                </button>
                <button type="button" onClick={() => handleDecision(selectedAsset.id, 'CLEAR')}>
                  CLEAR
                </button>
              </div>
            </div>
          ) : (
            <p className="empty-state">Clique un asset pour ouvrir le détail.</p>
          )}
        </section>
      </section>
    </main>
  )
}

export default App
