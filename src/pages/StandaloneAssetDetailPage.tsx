import { UiResetPage } from './UiResetPage'

type Props = {
  context: 'review' | 'library'
}

export function StandaloneAssetDetailPage({ context }: Props) {
  const route = context === 'review' ? '/review/detail/:assetId' : '/library/detail/:assetId'
  const title = context === 'review' ? 'Review detail UI removed' : 'Library detail UI removed'
  return <UiResetPage title={title} route={route} />
}
