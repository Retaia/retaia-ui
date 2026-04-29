import ReactPlayer from 'react-player'
import type { Asset } from '../../domain/assets'

type Props = {
  selectedAsset: Asset
  t: (key: string, values?: Record<string, string>) => string
}

export function AssetMediaPreview({ selectedAsset, t }: Props) {
  const mediaUrl =
    selectedAsset.mediaType === 'VIDEO'
      ? selectedAsset.previewVideoUrl
      : selectedAsset.mediaType === 'AUDIO'
        ? selectedAsset.previewAudioUrl
        : selectedAsset.mediaType === 'IMAGE'
          ? selectedAsset.previewPhotoUrl
          : null

  if (selectedAsset.mediaType === 'IMAGE' && mediaUrl) {
    return <img src={mediaUrl} alt={selectedAsset.name} className="img-fluid rounded border" />
  }

  if (selectedAsset.mediaType === 'VIDEO' && mediaUrl) {
    return (
      <div className="rounded border overflow-hidden">
        <ReactPlayer src={mediaUrl} controls width="100%" height="220px" />
      </div>
    )
  }

  if (selectedAsset.mediaType === 'AUDIO' && mediaUrl) {
    return (
      <div>
        <ReactPlayer src={mediaUrl} controls width="100%" height="56px" />
        {selectedAsset.waveformUrl ? (
          <img
            src={selectedAsset.waveformUrl}
            alt={t('detail.waveformImageAlt', { id: selectedAsset.id })}
            className="img-fluid rounded border mt-2"
            data-testid="asset-waveform-image"
          />
        ) : (
          <div
            className="mt-2 rounded border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-300"
            data-testid="asset-waveform-unavailable"
          >
            {t('detail.waveformUnavailable')}
          </div>
        )}
      </div>
    )
  }

  return <p className="small text-gray-500 mb-0">{t('detail.previewUnavailable')}</p>
}
