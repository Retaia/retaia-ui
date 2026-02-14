import ReactPlayer from 'react-player/file'
import type { Asset } from '../../domain/assets'

type Props = {
  selectedAsset: Asset
  t: (key: string, values?: Record<string, string>) => string
}

function buildWaveformBars(seed: string, count = 48): number[] {
  let value = 0
  for (let index = 0; index < seed.length; index += 1) {
    value = (value * 31 + seed.charCodeAt(index)) >>> 0
  }

  const bars: number[] = []
  for (let index = 0; index < count; index += 1) {
    value = (value * 1664525 + 1013904223) >>> 0
    const normalized = value / 0xffffffff
    bars.push(Math.round(20 + normalized * 80))
  }
  return bars
}

export function AssetMediaPreview({ selectedAsset, t }: Props) {
  const mediaUrl =
    selectedAsset.mediaType === 'VIDEO'
      ? selectedAsset.proxyVideoUrl
      : selectedAsset.mediaType === 'AUDIO'
        ? selectedAsset.proxyAudioUrl
        : selectedAsset.mediaType === 'IMAGE'
          ? selectedAsset.proxyPhotoUrl
          : null

  if (selectedAsset.mediaType === 'IMAGE' && mediaUrl) {
    return <img src={mediaUrl} alt={selectedAsset.name} className="img-fluid rounded border" />
  }

  if (selectedAsset.mediaType === 'VIDEO' && mediaUrl) {
    return (
      <div className="rounded border overflow-hidden">
        <ReactPlayer
          url={mediaUrl}
          controls
          width="100%"
          height="220px"
          config={{
            attributes: {
              controlsList: 'nodownload',
            },
          }}
        />
      </div>
    )
  }

  if (selectedAsset.mediaType === 'AUDIO' && mediaUrl) {
    return (
      <div>
        <ReactPlayer
          url={mediaUrl}
          controls
          width="100%"
          height="56px"
          config={{
            forceAudio: true,
            attributes: {
              controlsList: 'nodownload',
            },
          }}
        />
        {selectedAsset.waveformUrl ? (
          <img
            src={selectedAsset.waveformUrl}
            alt={t('detail.waveformImageAlt', { id: selectedAsset.id })}
            className="img-fluid rounded border mt-2"
            data-testid="asset-waveform-image"
          />
        ) : (
          <div
            className="audio-waveform-fallback mt-2"
            role="img"
            aria-label={t('detail.waveformFallbackLabel')}
            data-testid="asset-waveform-fallback"
          >
            {buildWaveformBars(selectedAsset.id).map((height, index) => (
              <span
                // Deterministic local fallback: enough for simple timeline orientation without server waveform.
                key={`${selectedAsset.id}-wave-${index}`}
                className="audio-waveform-fallback__bar"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return <p className="small text-secondary mb-0">{t('detail.previewUnavailable')}</p>
}
