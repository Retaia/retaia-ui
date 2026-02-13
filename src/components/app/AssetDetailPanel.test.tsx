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
      onRefreshAsset={async () => {}}
      showRefreshAction={false}
      refreshingAsset={false}
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

  it('renders transcript preview when available', () => {
    renderPanel({
      id: 'A-005',
      name: 'with-transcript.mov',
      state: 'DECISION_PENDING',
      mediaType: 'VIDEO',
      transcriptStatus: 'DONE',
      transcriptPreview: 'hello transcript',
    })

    expect(screen.getByTestId('asset-transcript-preview')).toHaveTextContent('hello transcript')
    expect(screen.getByText('detail.transcriptTitle')).toBeInTheDocument()
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
        onRefreshAsset={async () => {}}
        showRefreshAction={false}
        refreshingAsset={false}
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

  it('shows refresh action and calls handler', async () => {
    const user = userEvent.setup()
    const onRefreshAsset = vi.fn(async () => {})
    render(
      <AssetDetailPanel
        selectedAsset={{
          id: 'A-020',
          name: 'asset.mov',
          state: 'DECISION_PENDING',
          mediaType: 'VIDEO',
        }}
        availability={availability}
        previewingPurge={false}
        executingPurge={false}
        purgeStatus={null}
        decisionStatus={{ kind: 'error', message: 'state conflict' }}
        savingMetadata={false}
        metadataStatus={null}
        t={t}
        onDecision={() => {}}
        onSaveMetadata={async () => {}}
        onPreviewPurge={async () => {}}
        onExecutePurge={async () => {}}
        onRefreshAsset={onRefreshAsset}
        showRefreshAction
        refreshingAsset={false}
      />,
    )

    await user.click(screen.getByTestId('asset-refresh-action'))
    expect(onRefreshAsset).toHaveBeenCalled()
  })
})
