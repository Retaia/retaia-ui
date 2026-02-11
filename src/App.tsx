import { useMemo, useState } from 'react'
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
  const [batchIds, setBatchIds] = useState<string[]>([])

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

  const handleDecision = (id: string, action: DecisionAction) => {
    setAssets((current) =>
      current.map((asset) => {
        if (asset.id !== id) {
          return asset
        }
        return {
          ...asset,
          state: getStateFromDecision(action, asset.state),
        }
      }),
    )
  }

  const applyDecisionToVisible = (action: 'KEEP' | 'REJECT') => {
    const targetIds = visibleAssets.map((asset) => asset.id)
    if (targetIds.length === 0) {
      return
    }

    const nextState = action === 'KEEP' ? 'DECIDED_KEEP' : 'DECIDED_REJECT'
    setAssets((current) => updateAssetsState(current, targetIds, nextState))
  }

  const applyDecisionToBatch = (action: 'KEEP' | 'REJECT') => {
    if (batchIds.length === 0) {
      return
    }
    const nextState = action === 'KEEP' ? 'DECIDED_KEEP' : 'DECIDED_REJECT'
    setAssets((current) => updateAssetsState(current, batchIds, nextState))
    setBatchIds([])
  }

  const toggleBatchAsset = (id: string) => {
    setBatchIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    )
  }

  const handleAssetClick = (id: string, shiftKey: boolean) => {
    if (shiftKey) {
      toggleBatchAsset(id)
      return
    }
    setSelectedAssetId(id)
  }

  const focusPending = () => {
    setFilter('DECISION_PENDING')
    setSearch('')
  }

  const clearFilters = () => {
    setFilter('ALL')
    setSearch('')
  }

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
