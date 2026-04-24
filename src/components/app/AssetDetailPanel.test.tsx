import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AssetDetailPanel } from './AssetDetailPanel'
import { getActionAvailability } from '../../domain/actionAvailability'
import type { Asset, ProcessingProfile } from '../../domain/assets'

const reactPlayerMock = vi.fn((props?: unknown) => {
  void props
  return <div data-testid="react-player" />
})

vi.mock('react-player', () => ({
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

function renderPanel(
  selectedAsset: Asset,
  options?: {
    decisionStatus?: { kind: 'success' | 'error'; message: string } | null
    processingProfileStatus?: { kind: 'success' | 'error'; message: string } | null
    onSaveMetadata?: (assetId: string, payload: { tags: string[]; notes: string }) => Promise<void>
    onRefreshAsset?: () => Promise<void>
    onChooseProcessingProfile?: (processingProfile: ProcessingProfile) => Promise<void> | void
    showRefreshAction?: boolean
    onKeywordClick?: (keyword: string) => void
    onOpenStandaloneDetail?: (assetId: string) => void
    standaloneHref?: string
    onReopenAsset?: () => Promise<void>
    onReprocessAsset?: () => Promise<void>
    showLibraryActions?: boolean
    transitionStatus?: { kind: 'success' | 'error'; message: string } | null
  },
) {
  const onSaveMetadata = options?.onSaveMetadata ?? vi.fn(async () => {})
  const onRefreshAsset = options?.onRefreshAsset ?? vi.fn(async () => {})
  return render(
    <AssetDetailPanel
      selectedAsset={selectedAsset}
      availability={availability}
      previewingPurge={false}
      executingPurge={false}
      purgeStatus={null}
      decisionStatus={options?.decisionStatus ?? null}
      processingProfileStatus={options?.processingProfileStatus ?? null}
      savingMetadata={false}
      savingProcessingProfile={false}
      metadataStatus={null}
      t={t}
      onDecision={() => {}}
      onChooseProcessingProfile={options?.onChooseProcessingProfile}
      onSaveMetadata={onSaveMetadata}
      onPreviewPurge={async () => {}}
      onExecutePurge={async () => {}}
      onRefreshAsset={onRefreshAsset}
      showRefreshAction={options?.showRefreshAction ?? false}
      refreshingAsset={false}
      showLibraryActions={options?.showLibraryActions ?? false}
      onReopenAsset={options?.onReopenAsset}
      onReprocessAsset={options?.onReprocessAsset}
      reopeningAsset={false}
      reprocessingAsset={false}
      transitionStatus={options?.transitionStatus ?? null}
      onOpenStandaloneDetail={options?.onOpenStandaloneDetail}
      standaloneHref={options?.standaloneHref}
      onKeywordClick={options?.onKeywordClick}
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
      previewVideoUrl: '/mock-media/video.mp4',
    })

    expect(screen.getByTestId('react-player')).toBeInTheDocument()
    expect(reactPlayerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        src: '/mock-media/video.mp4',
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
      previewAudioUrl: '/mock-media/audio.mp3',
    })

    expect(screen.getByTestId('react-player')).toBeInTheDocument()
    expect(reactPlayerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        src: '/mock-media/audio.mp3',
      }),
    )
    expect(screen.getByTestId('asset-waveform-fallback')).toBeInTheDocument()
  })

  it('renders server waveform when url is available for audio assets', () => {
    reactPlayerMock.mockClear()
    renderPanel({
      id: 'A-006',
      name: 'audio-with-waveform.wav',
      state: 'DECISION_PENDING',
      mediaType: 'AUDIO',
      previewAudioUrl: '/mock-media/audio.mp3',
      waveformUrl: '/mock-media/waveform.png',
    })

    const waveform = screen.getByTestId('asset-waveform-image')
    expect(waveform).toHaveAttribute('src', '/mock-media/waveform.png')
    expect(screen.queryByTestId('asset-waveform-fallback')).not.toBeInTheDocument()
  })

  it('renders image preview for photo assets', () => {
    renderPanel({
      id: 'A-003',
      name: 'image.jpg',
      state: 'DECIDED_REJECT',
      mediaType: 'IMAGE',
      previewPhotoUrl: '/mock-media/image.jpg',
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

  it('renders linked projects when available on the asset', () => {
    renderPanel({
      id: 'A-007',
      name: 'project-linked.mov',
      state: 'DECISION_PENDING',
      mediaType: 'VIDEO',
      projects: [
        { id: 'P-001', name: 'Campaign Alpha' },
        { id: 'P-002', name: 'Event Beta' },
      ],
    })

    expect(screen.getByText('detail.projectsTitle')).toBeInTheDocument()
    expect(screen.getByTestId('asset-project-list')).toHaveTextContent('Campaign Alpha')
    expect(screen.getByTestId('asset-project-list')).toHaveTextContent('Event Beta')
  })

  it('adds a tag and submits metadata payload', async () => {
    const user = userEvent.setup()
    const onSaveMetadata = vi.fn(async () => {})
    renderPanel(
      {
        id: 'A-010',
        name: 'asset.mov',
        state: 'DECISION_PENDING',
        mediaType: 'VIDEO',
        tags: ['existing'],
        notes: '',
      },
      { onSaveMetadata },
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
    renderPanel(
      {
        id: 'A-020',
        name: 'asset.mov',
        state: 'DECISION_PENDING',
        mediaType: 'VIDEO',
      },
      {
        decisionStatus: { kind: 'error', message: 'state conflict' },
        onRefreshAsset,
        showRefreshAction: true,
      },
    )

    await user.click(screen.getByTestId('asset-refresh-action'))
    expect(onRefreshAsset).toHaveBeenCalled()
  })

  it('filters list when clicking a keyword tag', async () => {
    const user = userEvent.setup()
    const onKeywordClick = vi.fn()
    renderPanel(
      {
        id: 'A-030',
        name: 'asset.mov',
        state: 'DECISION_PENDING',
        mediaType: 'VIDEO',
        tags: ['urgent'],
      },
      { onKeywordClick },
    )

    await user.click(screen.getByRole('button', { name: 'urgent' }))
    expect(onKeywordClick).toHaveBeenCalledWith('urgent')
  })

  it('renders standalone detail new-tab link with context URL', () => {
    const onOpenStandaloneDetail = vi.fn()
    renderPanel(
      {
        id: 'A-040',
        name: 'asset.mov',
        state: 'DECISION_PENDING',
        mediaType: 'VIDEO',
      },
      {
        onOpenStandaloneDetail,
        standaloneHref: '/review/asset/A-040?from=%2Freview%3Fq%3Dasset',
      },
    )

    const newTabLink = screen.getByTestId('asset-open-standalone-new-tab')
    expect(newTabLink).toHaveAttribute('href', '/review/asset/A-040?from=%2Freview%3Fq%3Dasset')
    expect(newTabLink).toHaveAttribute('target', '_blank')
    expect(newTabLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders library requalification actions and forwards callbacks', async () => {
    const user = userEvent.setup()
    const onReopenAsset = vi.fn(async () => {})
    const onReprocessAsset = vi.fn(async () => {})

    renderPanel(
      {
        id: 'A-050',
        name: 'archived.mov',
        state: 'ARCHIVED',
        mediaType: 'VIDEO',
      },
      {
        showLibraryActions: true,
        onReopenAsset,
        onReprocessAsset,
        transitionStatus: { kind: 'success', message: 'done' },
      },
    )

    await user.click(screen.getByTestId('asset-reopen-action'))
    await user.click(screen.getByTestId('asset-reprocess-action'))

    expect(onReopenAsset).toHaveBeenCalled()
    expect(onReprocessAsset).toHaveBeenCalled()
    expect(screen.getByTestId('asset-transition-status')).toHaveTextContent('done')
  })

  it('renders processing profile qualification and forwards explicit selection', async () => {
    const user = userEvent.setup()
    const onChooseProcessingProfile = vi.fn()

    renderPanel(
      {
        id: 'A-060',
        name: 'voice-note-casting.wav',
        state: 'REVIEW_PENDING_PROFILE',
        mediaType: 'AUDIO',
        processingProfile: 'audio_undefined',
      },
      {
        onChooseProcessingProfile,
        processingProfileStatus: { kind: 'success', message: 'saved' },
      },
    )

    expect(screen.getByText('detail.processingProfileTitle')).toBeInTheDocument()
    expect(screen.getByText('detail.processingProfileDecisionBlocked')).toBeInTheDocument()
    expect(screen.getByTestId('asset-processing-profile-status')).toHaveTextContent('saved')

    await user.click(screen.getByTestId('asset-processing-profile-voice'))
    expect(onChooseProcessingProfile).toHaveBeenCalledWith('audio_voice')
  })
})
