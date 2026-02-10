import { useMemo, useState } from 'react'
import './App.css'

type AssetState = 'DECISION_PENDING' | 'DECIDED_KEEP' | 'DECIDED_REJECT'

type Asset = {
  id: string
  name: string
  state: AssetState
}

const INITIAL_ASSETS: Asset[] = [
  { id: 'A-001', name: 'interview-camera-a.mov', state: 'DECISION_PENDING' },
  { id: 'A-002', name: 'ambiance-plateau.wav', state: 'DECIDED_KEEP' },
  { id: 'A-003', name: 'behind-the-scenes.jpg', state: 'DECIDED_REJECT' },
]

function App() {
  const [filter, setFilter] = useState<AssetState | 'ALL'>('ALL')
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS)

  const visibleAssets = useMemo(() => {
    if (filter === 'ALL') {
      return assets
    }
    return assets.filter((asset) => asset.state === filter)
  }, [assets, filter])

  const decideKeep = (id: string) => {
    setAssets((current) =>
      current.map((asset) =>
        asset.id === id ? { ...asset, state: 'DECIDED_KEEP' } : asset,
      ),
    )
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
          onChange={(event) => setFilter(event.target.value as AssetState | 'ALL')}
        >
          <option value="ALL">Tous</option>
          <option value="DECISION_PENDING">DECISION_PENDING</option>
          <option value="DECIDED_KEEP">DECIDED_KEEP</option>
          <option value="DECIDED_REJECT">DECIDED_REJECT</option>
        </select>
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
