export const ASSET_STATES = ['DECISION_PENDING', 'DECIDED_KEEP', 'DECIDED_REJECT'] as const

export type AssetState = (typeof ASSET_STATES)[number]
export type AssetFilter = AssetState | 'ALL'
export type DecisionAction = 'KEEP' | 'REJECT' | 'CLEAR'

export type Asset = {
  id: string
  name: string
  state: AssetState
}

export const filterAssets = (
  assets: Asset[],
  filter: AssetFilter,
  search: string,
): Asset[] => {
  const normalizedSearch = search.trim().toLowerCase()

  return assets.filter((asset) => {
    const matchesFilter = filter === 'ALL' || asset.state === filter
    const matchesSearch =
      normalizedSearch.length === 0 ||
      asset.name.toLowerCase().includes(normalizedSearch) ||
      asset.id.toLowerCase().includes(normalizedSearch)

    return matchesFilter && matchesSearch
  })
}

export const countAssetsByState = (assets: Asset[]): Record<AssetState, number> => {
  return assets.reduce<Record<AssetState, number>>(
    (accumulator, asset) => {
      accumulator[asset.state] += 1
      return accumulator
    },
    {
      DECISION_PENDING: 0,
      DECIDED_KEEP: 0,
      DECIDED_REJECT: 0,
    },
  )
}

export const updateAssetState = (
  assets: Asset[],
  id: string,
  nextState: AssetState,
): Asset[] => {
  return assets.map((asset) =>
    asset.id === id ? { ...asset, state: nextState } : asset,
  )
}

export const getStateFromDecision = (
  action: DecisionAction,
  currentState: AssetState,
): AssetState => {
  if (action === 'CLEAR') {
    if (currentState === 'DECIDED_KEEP' || currentState === 'DECIDED_REJECT') {
      return 'DECISION_PENDING'
    }
    return currentState
  }

  return action === 'KEEP' ? 'DECIDED_KEEP' : 'DECIDED_REJECT'
}
