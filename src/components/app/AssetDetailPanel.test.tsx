import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AssetDetailPanel } from './AssetDetailPanel'
import { getActionAvailability } from '../../domain/actionAvailability'
import type { Asset } from '../../domain/assets'

const reactPlayerMock = vi.fn((props?: unknown) => {
  void props
  return <div data-testid="react-player" />
})

vi.mock('react-player/file', () => ({
  default: (props: unknown) => reactPlayerMock(props),
}))

const t = (key: string, values?: Record<string, string>) =>
  values ? `${key}:${JSON.stringify(values)}` : key

const availability = getActionAvailability({
  visibleCount: 1,
  batchCount: 0,
  previewingBatch: false,
  executingBatch: false,
  schedulingBatchExecution: false,
  reportBatchId: null,
  reportLoading: false,
  undoCount: 0,
  selectedAssetState: 'DECISION_PENDING',
  previewingPurge: false,
  executingPurge: false,
  purgePreviewMatchesSelected: false,
})

function renderPanel(selectedAsset: Asset) {
  const onSaveMetadata = vi.fn(async () => {})
  return render(
    <AssetDetailPanel
      selectedAsset={selectedAsset}
      availability={availability}
      previewingPurge={false}
      executingPurge={false}
      purgeStatus={null}
      decisionStatus={null}
      savingMetadata={false}
      metadataStatus={null}
      t={t}
      onDecision={() => {}}
      onSaveMetadata={onSaveMetadata}
      onPreviewPurge={async () => {}}
      onExecutePurge={async () => {}}
    />,
  )
}

describe('AssetDetailPanel media preview', () => {
  it('renders react-player for video assets', () => {
    reactPlayerMock.mockClear()
    renderPanel({
      id: 'A-001',
      name: 'video.mov',
      state: 'DECISION_PENDING',
      mediaType: 'VIDEO',
      proxyVideoUrl: '/mock-media/video.mp4',
    })

    expect(screen.getByTestId('react-player')).toBeInTheDocument()
    expect(reactPlayerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/mock-media/video.mp4',
      }),
    )
  })

  it('renders react-player for audio assets', () => {
    reactPlayerMock.mockClear()
    renderPanel({
      id: 'A-002',
      name: 'audio.wav',
      state: 'DECIDED_KEEP',
      mediaType: 'AUDIO',
      proxyAudioUrl: '/mock-media/audio.mp3',
    })

    expect(screen.getByTestId('react-player')).toBeInTheDocument()
    expect(reactPlayerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/mock-media/audio.mp3',
      }),
    )
  })

  it('renders image preview for photo assets', () => {
    renderPanel({
      id: 'A-003',
      name: 'image.jpg',
      state: 'DECIDED_REJECT',
      mediaType: 'IMAGE',
      proxyPhotoUrl: '/mock-media/image.jpg',
    })

    const image = screen.getByRole('img', { name: 'image.jpg' })
    expect(image).toHaveAttribute('src', '/mock-media/image.jpg')
  })

  it('renders fallback message when preview url is missing', () => {
    renderPanel({
      id: 'A-004',
      name: 'missing.mov',
      state: 'DECISION_PENDING',
      mediaType: 'VIDEO',
    })

    expect(screen.getByText('detail.previewUnavailable')).toBeInTheDocument()
  })

  it('adds a tag and submits metadata payload', async () => {
    const user = userEvent.setup()
    const onSaveMetadata = vi.fn(async () => {})
    render(
      <AssetDetailPanel
        selectedAsset={{
          id: 'A-010',
          name: 'asset.mov',
          state: 'DECISION_PENDING',
          mediaType: 'VIDEO',
          tags: ['existing'],
          notes: '',
        }}
        availability={availability}
        previewingPurge={false}
        executingPurge={false}
        purgeStatus={null}
        decisionStatus={null}
        savingMetadata={false}
        metadataStatus={null}
        t={t}
        onDecision={() => {}}
        onSaveMetadata={onSaveMetadata}
        onPreviewPurge={async () => {}}
        onExecutePurge={async () => {}}
      />,
    )

    await user.type(screen.getByTestId('asset-tag-input'), 'urgent')
    await user.click(screen.getByTestId('asset-tag-add'))
    await user.type(screen.getByTestId('asset-notes-input'), 'Needs review')
    await user.click(screen.getByTestId('asset-tag-save'))

    expect(onSaveMetadata).toHaveBeenCalledWith('A-010', {
      tags: ['existing', 'urgent'],
      notes: 'Needs review',
    })
  })
})
