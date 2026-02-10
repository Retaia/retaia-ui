import { useMemo, useState } from 'react'
import './App.css'
import { INITIAL_ASSETS } from './data/mockAssets'
import {
  type Asset,
  type AssetFilter,
  filterAssets,
  updateAssetState,
} from './domain/assets'

function App() {
  const [filter, setFilter] = useState<AssetFilter>('ALL')
  const [search, setSearch] = useState('')
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS)

  const visibleAssets = useMemo(() => {
    return filterAssets(assets, filter, search)
  }, [assets, filter, search])

  const decideKeep = (id: string) => {
    setAssets((current) => updateAssetState(current, id, 'DECIDED_KEEP'))
  }

  return (
    <main className="app">
      <header className="app__header">
        <h1>Retaia UI</h1>
        <p>Interface simple de revue utilisateur</p>
      </header>

      <section className="panel">
        <label htmlFor="state-filter">Filtrer par état</label>
        <select
          id="state-filter"
          value={filter}
          onChange={(event) => setFilter(event.target.value as AssetFilter)}
        >
          <option value="ALL">Tous</option>
          <option value="DECISION_PENDING">DECISION_PENDING</option>
          <option value="DECIDED_KEEP">DECIDED_KEEP</option>
          <option value="DECIDED_REJECT">DECIDED_REJECT</option>
        </select>
        <label htmlFor="asset-search">Recherche</label>
        <input
          id="asset-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nom ou identifiant"
        />
      </section>

      <section className="panel">
        <h2>Assets ({visibleAssets.length})</h2>
        <ul className="asset-list">
          {visibleAssets.map((asset) => (
            <li key={asset.id} className="asset-row">
              <div>
                <strong>{asset.name}</strong>
                <p>
                  {asset.id} - {asset.state}
                </p>
              </div>
              <button
                type="button"
                onClick={() => decideKeep(asset.id)}
                disabled={asset.state === 'DECIDED_KEEP'}
              >
                Décider KEEP
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default App
