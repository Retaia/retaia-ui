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
} from './domain/assets'

function App() {
  const [filter, setFilter] = useState<AssetFilter>('ALL')
  const [search, setSearch] = useState('')
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS)

  const visibleAssets = useMemo(() => {
    return filterAssets(assets, filter, search)
  }, [assets, filter, search])

  const counts = useMemo(() => countAssetsByState(assets), [assets])

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

      <section className="panel">
        <h2>Assets ({visibleAssets.length})</h2>
        <AssetList assets={visibleAssets} onDecision={handleDecision} />
      </section>
    </main>
  )
}

export default App
