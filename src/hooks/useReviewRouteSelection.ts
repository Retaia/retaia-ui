import type { Asset } from '../domain/assets'
import { useAssetRouteSelection } from './useAssetRouteSelection'

export function useReviewRouteSelection(initialAssets: Asset[], assets: Asset[]) {
  return useAssetRouteSelection(initialAssets, assets, { basePath: '/review' })
}
