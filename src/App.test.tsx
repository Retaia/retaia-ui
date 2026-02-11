import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import App from './App'

describe('App', () => {
  const getAssetsPanel = () => screen.getByLabelText('Liste des assets')
  const getDetailPanel = () => screen.getByLabelText("Détail de l'asset")

  it('renders a simple user review UI with assets', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Retaia UI' })).toBeInTheDocument()
    expect(screen.getByText('Review simple pour décider KEEP ou REJECT')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Assets (3)' })).toBeInTheDocument()
    expect(within(getAssetsPanel()).getByText('interview-camera-a.mov')).toBeInTheDocument()
    expect(screen.getByLabelText('Résumé des assets')).toBeInTheDocument()
    expect(within(getDetailPanel()).getByText('Clique un asset pour ouvrir le détail.')).toBeInTheDocument()
  })

  it('switches UI language to english', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Anglais' }))

    expect(screen.getByText('Simple review UI for KEEP or REJECT decisions')).toBeInTheDocument()
    expect(screen.getByLabelText('Search')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Show pending' })).toBeInTheDocument()
    expect(screen.getByLabelText('Asset detail')).toBeInTheDocument()
  })

  it('filters assets by state', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.selectOptions(screen.getByLabelText('Filtrer par état'), 'DECISION_PENDING')

    expect(screen.getByRole('heading', { name: 'Assets (1)' })).toBeInTheDocument()
    expect(within(getAssetsPanel()).getByText('interview-camera-a.mov')).toBeInTheDocument()
    expect(within(getAssetsPanel()).queryByText('ambiance-plateau.wav')).not.toBeInTheDocument()
  })

  it('supports keep reject clear actions', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getAllByRole('button', { name: 'REJECT' })[0])
    expect(screen.getByText('A-001 - DECIDED_REJECT')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'CLEAR' })[0])
    expect(screen.getByText('A-001 - DECISION_PENDING')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'KEEP' })[0])
    expect(screen.getByText('A-001 - DECIDED_KEEP')).toBeInTheDocument()
  })

  it('opens detail panel on click', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(within(getAssetsPanel()).getByText('behind-the-scenes.jpg'))

    expect(within(getDetailPanel()).getByText('behind-the-scenes.jpg')).toBeInTheDocument()
    expect(within(getDetailPanel()).getByText('ID: A-003')).toBeInTheDocument()
  })

  it('filters assets with free-text search', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.type(screen.getByLabelText('Recherche'), 'behind')

    expect(screen.getByRole('heading', { name: 'Assets (1)' })).toBeInTheDocument()
    expect(within(getAssetsPanel()).getByText('behind-the-scenes.jpg')).toBeInTheDocument()
    expect(within(getAssetsPanel()).queryByText('interview-camera-a.mov')).not.toBeInTheDocument()
  })

  it('shows an empty state when filters match no asset', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.type(screen.getByLabelText('Recherche'), 'no-match')

    expect(screen.getByRole('heading', { name: 'Assets (0)' })).toBeInTheDocument()
    expect(screen.getByText('Aucun résultat pour la recherche ou le filtre actif.')).toBeInTheDocument()
  })

  it('shows guidance when batch-only mode is active with empty batch', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.keyboard('b')

    expect(screen.getByRole('heading', { name: 'Assets (0)' })).toBeInTheDocument()
    expect(
      screen.getByText('Mode batch seul actif. Ajoute des assets au batch via Shift+clic.'),
    ).toBeInTheDocument()
  })

  it('focuses pending assets using quick action', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Voir à traiter' }))

    expect(screen.getByRole('heading', { name: 'Assets (1)' })).toBeInTheDocument()
    expect(screen.getByText('A-001 - DECISION_PENDING')).toBeInTheDocument()
  })

  it('applies saved pending view', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'À traiter' }))

    expect(screen.getByRole('heading', { name: 'Assets (1)' })).toBeInTheDocument()
    expect(screen.getByText('A-001 - DECISION_PENDING')).toBeInTheDocument()
  })

  it('applies saved batch view', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.keyboard('{Shift>}')
    await user.click(within(getAssetsPanel()).getByText('interview-camera-a.mov'))
    await user.keyboard('{/Shift}')
    await user.click(screen.getByRole('button', { name: 'Batch' }))

    expect(screen.getByRole('heading', { name: 'Assets (1)' })).toBeInTheDocument()
    expect(within(getAssetsPanel()).getByText('interview-camera-a.mov')).toBeInTheDocument()
  })

  it('applies quick filter preset with status type and date', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'À traiter (7j)' }))

    expect(screen.getByLabelText('Filtrer par état')).toHaveValue('DECISION_PENDING')
    expect(screen.getByLabelText('Type')).toHaveValue('ALL')
    expect(screen.getByLabelText('Date de capture')).toHaveValue('LAST_7_DAYS')
    expect(screen.getByRole('heading', { name: 'Assets (1)' })).toBeInTheDocument()
    expect(screen.getByText('A-001 - DECISION_PENDING')).toBeInTheDocument()
  })

  it('loads persisted quick filter preset from local storage', async () => {
    const user = userEvent.setup()
    const firstRender = render(<App />)

    await user.click(screen.getByRole('button', { name: 'Images rejetées' }))
    firstRender.unmount()

    render(<App />)

    expect(screen.getByLabelText('Filtrer par état')).toHaveValue('DECIDED_REJECT')
    expect(screen.getByLabelText('Type')).toHaveValue('IMAGE')
    expect(screen.getByLabelText('Date de capture')).toHaveValue('ALL')
    expect(screen.getByRole('heading', { name: 'Assets (1)' })).toBeInTheDocument()
    expect(within(getAssetsPanel()).getByText('behind-the-scenes.jpg')).toBeInTheDocument()
    window.localStorage.removeItem('retaia_ui_quick_filter_preset')
  })

  it('applies quick presets with keyboard shortcuts 1 2 3', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.keyboard('1')
    expect(screen.getByLabelText('Filtrer par état')).toHaveValue('DECISION_PENDING')
    expect(screen.getByLabelText('Date de capture')).toHaveValue('LAST_7_DAYS')

    await user.keyboard('2')
    expect(screen.getByLabelText('Filtrer par état')).toHaveValue('DECIDED_REJECT')
    expect(screen.getByLabelText('Type')).toHaveValue('IMAGE')

    await user.keyboard('3')
    expect(screen.getByLabelText('Type')).toHaveValue('VIDEO')
    expect(screen.getByLabelText('Date de capture')).toHaveValue('LAST_30_DAYS')
  })

  it('renders separate panels for general and batch actions', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Actions générales' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Actions batch' })).toBeInTheDocument()
  })

  it('adds assets to batch with shift+click and applies batch action', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.keyboard('{Shift>}')
    await user.click(within(getAssetsPanel()).getByText('interview-camera-a.mov'))
    await user.click(within(getAssetsPanel()).getByText('behind-the-scenes.jpg'))
    await user.keyboard('{/Shift}')

    expect(screen.getByText('Batch sélectionné: 2')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'KEEP batch' }))

    expect(screen.getByText('Batch sélectionné: 0')).toBeInTheDocument()
    expect(within(getAssetsPanel()).getByText('A-001 - DECIDED_KEEP')).toBeInTheDocument()
    expect(within(getAssetsPanel()).getByText('A-003 - DECIDED_KEEP')).toBeInTheDocument()
  })

  it('filters visible assets to current batch with batch-only toggle', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.keyboard('{Shift>}')
    await user.click(within(getAssetsPanel()).getByText('interview-camera-a.mov'))
    await user.click(within(getAssetsPanel()).getByText('behind-the-scenes.jpg'))
    await user.keyboard('{/Shift}')
    await user.click(screen.getByRole('button', { name: 'Batch seul: OFF' }))

    expect(screen.getByRole('heading', { name: 'Assets (2)' })).toBeInTheDocument()
    expect(within(getAssetsPanel()).getByText('interview-camera-a.mov')).toBeInTheDocument()
    expect(within(getAssetsPanel()).getByText('behind-the-scenes.jpg')).toBeInTheDocument()
    expect(within(getAssetsPanel()).queryByText('ambiance-plateau.wav')).not.toBeInTheDocument()
  })

  it('shows batch execution scope summary before execute', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.keyboard('{Shift>}')
    await user.click(within(getAssetsPanel()).getByText('interview-camera-a.mov'))
    await user.click(within(getAssetsPanel()).getByText('behind-the-scenes.jpg'))
    await user.keyboard('{/Shift}')

    expect(screen.getByText('À exécuter: 2')).toBeInTheDocument()
    expect(screen.getByText('En attente: 1 · KEEP: 0 · REJECT: 1')).toBeInTheDocument()
  })

  it('previews selected batch with API call', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 200 }))

    render(<App />)

    await user.keyboard('{Shift>}')
    await user.click(within(getAssetsPanel()).getByText('interview-camera-a.mov'))
    await user.click(within(getAssetsPanel()).getByText('behind-the-scenes.jpg'))
    await user.keyboard('{/Shift}')
    await user.click(screen.getByRole('button', { name: 'Prévisualiser batch' }))

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/v1/batches/moves/preview',
      expect.objectContaining({
        method: 'POST',
      }),
    )
    expect(
      screen.getByText('Prévisualisation prête pour BOTH (2 assets)'),
    ).toBeInTheDocument()
    fetchSpy.mockRestore()
  })

  it('shows preview error when API fails', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          code: 'FORBIDDEN_SCOPE',
          message: 'forbidden',
          retryable: false,
          correlation_id: 'c-1',
        }),
        { status: 403, headers: { 'content-type': 'application/json' } },
      ),
    )

    render(<App />)

    await user.keyboard('{Shift>}')
    await user.click(within(getAssetsPanel()).getByText('interview-camera-a.mov'))
    await user.keyboard('{/Shift}')
    await user.click(screen.getByRole('button', { name: 'Prévisualiser batch' }))

    expect(screen.getByTestId('batch-preview-status')).toHaveTextContent(
      'scope manquant',
    )
    expect(screen.getByRole('status')).toHaveTextContent('scope manquant')
    fetchSpy.mockRestore()
  })

  it('shows retry status while API client retries a temporary error', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input)
      if (url.endsWith('/batches/moves/preview')) {
        if (fetchSpy.mock.calls.filter((call) => String(call[0]).endsWith('/batches/moves/preview')).length === 1) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                code: 'TEMPORARY_UNAVAILABLE',
                message: 'temporary unavailable',
                retryable: true,
                correlation_id: 'c-r-1',
              }),
              { status: 503, headers: { 'content-type': 'application/json' } },
            ),
          )
        }
        return new Promise<Response>(() => {})
      }
      return Promise.resolve(new Response(null, { status: 200 }))
    })

    render(<App />)

    await user.keyboard('{Shift>}')
    await user.click(within(getAssetsPanel()).getByText('interview-camera-a.mov'))
    await user.keyboard('{/Shift}')
    await user.click(screen.getByRole('button', { name: 'Prévisualiser batch' }))

    expect(await screen.findByTestId('api-retry-status')).toHaveTextContent('Nouvelle tentative')
    fetchSpy.mockRestore()
  })

  it('locks batch decision actions while preview is running', async () => {
    const user = userEvent.setup()
    const resolvePreviewRef: { current: (() => void) | null } = { current: null }
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input)
      if (url.endsWith('/batches/moves/preview')) {
        return new Promise<Response>((resolve) => {
          resolvePreviewRef.current = () => resolve(new Response(null, { status: 200 }))
        })
      }
      return Promise.resolve(new Response(null, { status: 200 }))
    })

    render(<App />)

    await user.keyboard('{Shift>}')
    await user.click(within(getAssetsPanel()).getByText('interview-camera-a.mov'))
    await user.keyboard('{/Shift}')
    await user.click(screen.getByRole('button', { name: 'Prévisualiser batch' }))

    expect(screen.getByRole('button', { name: 'KEEP batch' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'REJECT batch' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Vider batch' })).toBeDisabled()
    expect(screen.getByTestId('batch-busy-status')).toBeInTheDocument()

    resolvePreviewRef.current?.()
    fetchSpy.mockRestore()
  })

  it('executes batch and loads report', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input)
      if (url.endsWith('/batches/moves')) {
        return Promise.resolve(
          new Response(JSON.stringify({ batch_id: 'batch-123' }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
        )
      }
      if (url.endsWith('/batches/moves/batch-123')) {
        return Promise.resolve(
          new Response(JSON.stringify({ status: 'DONE', moved: 2 }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
        )
      }
      return Promise.resolve(new Response(null, { status: 200 }))
    })

    render(<App />)

    await user.keyboard('{Shift>}')
    await user.click(within(getAssetsPanel()).getByText('interview-camera-a.mov'))
    await user.click(within(getAssetsPanel()).getByText('behind-the-scenes.jpg'))
    await user.keyboard('{/Shift}')

    await user.click(screen.getByRole('button', { name: 'Exécuter batch' }))
    expect(screen.getByTestId('batch-execute-undo-status')).toBeInTheDocument()
    expect(screen.getByTestId('batch-timeline')).toHaveTextContent('File d’attente')
    await user.click(screen.getByRole('button', { name: 'Exécuter maintenant' }))
    expect(screen.getByTestId('batch-execute-status')).toHaveTextContent('acceptée')
    expect(screen.getByTestId('batch-timeline')).toHaveTextContent('Terminé')

    await user.click(screen.getByRole('button', { name: 'Rafraîchir rapport' }))
    expect(screen.getByTestId('batch-report-status')).toHaveTextContent(
      'Rapport chargé pour batch-123',
    )
    const reportSummary = screen.getByLabelText('Synthèse batch')
    expect(reportSummary).toBeInTheDocument()
    expect(within(reportSummary).getAllByText('DONE').length).toBeGreaterThan(0)
    expect(within(reportSummary).getByText('2')).toBeInTheDocument()
    expect(screen.getByTestId('batch-report-status-value')).toHaveTextContent('DONE')
    expect(screen.getByTestId('batch-report-moved-value')).toHaveTextContent('2')
    const liveRegions = screen.getAllByRole('status')
    expect(liveRegions.some((node) => node.textContent?.includes('Exécution du batch acceptée'))).toBe(
      true,
    )
    expect(liveRegions.some((node) => node.textContent?.includes('Rapport chargé pour batch-123'))).toBe(
      true,
    )
    fetchSpy.mockRestore()
  })

  it('shows error state in batch timeline when execution fails', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input)
      if (url.endsWith('/batches/moves')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              code: 'STATE_CONFLICT',
              message: 'state conflict',
              retryable: false,
              correlation_id: 'c-1',
            }),
            { status: 409, headers: { 'content-type': 'application/json' } },
          ),
        )
      }
      return Promise.resolve(new Response(null, { status: 200 }))
    })

    render(<App />)

    await user.keyboard('{Shift>}')
    await user.click(within(getAssetsPanel()).getByText('interview-camera-a.mov'))
    await user.keyboard('{/Shift}')
    await user.click(screen.getByRole('button', { name: 'Exécuter batch' }))
    await user.click(screen.getByRole('button', { name: 'Exécuter maintenant' }))

    expect(screen.getByTestId('batch-execute-status')).toHaveTextContent('échec')
    expect(screen.getByTestId('batch-timeline')).toHaveTextContent('Erreur')
    fetchSpy.mockRestore()
  })

  it('loads batch report automatically after execution', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input)
      if (url.endsWith('/batches/moves')) {
        return Promise.resolve(
          new Response(JSON.stringify({ batch_id: 'batch-123' }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
        )
      }
      if (url.endsWith('/batches/moves/batch-123')) {
        return Promise.resolve(
          new Response(JSON.stringify({ status: 'DONE', moved: 2 }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
        )
      }
      return Promise.resolve(new Response(null, { status: 200 }))
    })

    render(<App />)

    await user.keyboard('{Shift>}')
    await user.click(within(getAssetsPanel()).getByText('interview-camera-a.mov'))
    await user.click(within(getAssetsPanel()).getByText('behind-the-scenes.jpg'))
    await user.keyboard('{/Shift}')
    await user.click(screen.getByRole('button', { name: 'Exécuter batch' }))
    await user.click(screen.getByRole('button', { name: 'Exécuter maintenant' }))

    expect(screen.getByTestId('batch-report-status')).toHaveTextContent(
      'Rapport chargé pour batch-123',
    )
    expect(screen.getByTestId('batch-report-status-value')).toHaveTextContent('DONE')
    expect(screen.getByTestId('batch-report-moved-value')).toHaveTextContent('2')
    fetchSpy.mockRestore()
  })

  it('exports batch report as JSON and CSV', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input)
      if (url.endsWith('/batches/moves')) {
        return Promise.resolve(
          new Response(JSON.stringify({ batch_id: 'batch-123' }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
        )
      }
      if (url.endsWith('/batches/moves/batch-123')) {
        return Promise.resolve(
          new Response(JSON.stringify({ status: 'DONE', moved: 2, failed: 0 }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
        )
      }
      return Promise.resolve(new Response(null, { status: 200 }))
    })

    const createObjectURL = vi.fn(() => 'blob:test')
    const revokeObjectURL = vi.fn()
    Object.defineProperty(URL, 'createObjectURL', {
      value: createObjectURL,
      configurable: true,
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: revokeObjectURL,
      configurable: true,
    })
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})

    render(<App />)

    await user.keyboard('{Shift>}')
    await user.click(within(getAssetsPanel()).getByText('interview-camera-a.mov'))
    await user.click(within(getAssetsPanel()).getByText('behind-the-scenes.jpg'))
    await user.keyboard('{/Shift}')
    await user.click(screen.getByRole('button', { name: 'Exécuter batch' }))
    await user.click(screen.getByRole('button', { name: 'Exécuter maintenant' }))

    await user.click(screen.getByRole('button', { name: 'Exporter JSON' }))
    await user.click(screen.getByRole('button', { name: 'Exporter CSV' }))

    expect(createObjectURL).toHaveBeenCalledTimes(2)
    expect(revokeObjectURL).toHaveBeenCalledTimes(2)
    expect(clickSpy).toHaveBeenCalledTimes(2)
    expect(screen.getByTestId('batch-report-export-status')).toHaveTextContent('CSV')

    clickSpy.mockRestore()
    fetchSpy.mockRestore()
  })

  it('cancels queued batch execution before API call', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }))

    render(<App />)

    await user.keyboard('{Shift>}')
    await user.click(within(getAssetsPanel()).getByText('interview-camera-a.mov'))
    await user.keyboard('{/Shift}')
    await user.click(screen.getByRole('button', { name: 'Exécuter batch' }))
    await user.click(screen.getByRole('button', { name: 'Annuler exécution' }))

    const calledMoveExecute = fetchSpy.mock.calls.some((call) =>
      String(call[0]).endsWith('/batches/moves'),
    )
    expect(calledMoveExecute).toBe(false)
    expect(screen.getByTestId('batch-execute-status')).toHaveTextContent('annulée')
    fetchSpy.mockRestore()
  })

  it('applies KEEP to all visible assets', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'KEEP visibles' }))

    expect(screen.getByText('A-001 - DECIDED_KEEP')).toBeInTheDocument()
    expect(screen.getByText('A-002 - DECIDED_KEEP')).toBeInTheDocument()
    expect(screen.getByText('A-003 - DECIDED_KEEP')).toBeInTheDocument()
  })

  it('handles next pending asset actions', async () => {
    const user = userEvent.setup()

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Prochain asset à traiter' })).toBeInTheDocument()
    expect(screen.getAllByText('interview-camera-a.mov')[0]).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'REJECT' })[0])

    expect(screen.getByText('Plus aucun asset en attente.')).toBeInTheDocument()
  })

  it('opens next pending asset with n shortcut', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.keyboard('n')

    expect(within(getDetailPanel()).getByText('ID: A-001')).toBeInTheDocument()
  })

  it('resets batch-only mode when opening next pending with n', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.keyboard('{Shift>}')
    await user.click(within(getAssetsPanel()).getByText('behind-the-scenes.jpg'))
    await user.keyboard('{/Shift}')
    await user.keyboard('b')
    expect(screen.getByRole('heading', { name: 'Assets (1)' })).toBeInTheDocument()

    await user.keyboard('n')

    expect(screen.getByRole('heading', { name: 'Assets (3)' })).toBeInTheDocument()
    expect(within(getDetailPanel()).getByText('ID: A-001')).toBeInTheDocument()
  })

  it('opens first visible asset with Enter shortcut', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.keyboard('{Enter}')

    expect(within(getDetailPanel()).getByText('ID: A-001')).toBeInTheDocument()
  })

  it('navigates visible assets with j and k shortcuts', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.keyboard('j')
    await user.keyboard('j')
    expect(within(getDetailPanel()).getByText('ID: A-002')).toBeInTheDocument()

    await user.keyboard('k')
    expect(within(getDetailPanel()).getByText('ID: A-001')).toBeInTheDocument()
  })

  it('toggles selected asset in batch with Shift+Space', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.keyboard('{Enter}')
    await user.keyboard('{Shift>}{Space}{/Shift}')

    expect(
      screen.getByText((_, element) => element?.textContent === 'Batch sélectionné: 1'),
    ).toBeInTheDocument()
  })

  it('adds all visible assets to batch with Ctrl+A', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.keyboard('{Control>}a{/Control}')

    expect(screen.getByText('Batch sélectionné: 3')).toBeInTheDocument()
  })

  it('logs actions and allows undo with the dedicated button', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'KEEP visibles' }))

    const activityPanel = screen.getByLabelText("Journal d'actions")
    expect(within(activityPanel).getByText('KEEP visibles (3)')).toBeInTheDocument()
    expect(screen.getByText('A-001 - DECIDED_KEEP')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Annuler dernière action' }))

    expect(within(activityPanel).getByText('Annulation')).toBeInTheDocument()
    expect(screen.getByText('A-001 - DECISION_PENDING')).toBeInTheDocument()
  })

  it('clears activity log with dedicated action', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'KEEP visibles' }))
    const activityPanel = screen.getByLabelText("Journal d'actions")
    expect(within(activityPanel).getByText('KEEP visibles (3)')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Vider journal' }))

    expect(within(activityPanel).getByText('Aucune action pour le moment.')).toBeInTheDocument()
  })

  it('supports undo with Ctrl+Z shortcut', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getAllByRole('button', { name: 'REJECT' })[0])
    expect(screen.getByText('A-001 - DECIDED_REJECT')).toBeInTheDocument()

    await user.keyboard('{Control>}z{/Control}')
    expect(screen.getByText('A-001 - DECISION_PENDING')).toBeInTheDocument()
  })

  it('uses roving tabindex and selected option semantics for asset rows', async () => {
    const user = userEvent.setup()
    render(<App />)

    const listbox = within(getAssetsPanel()).getByRole('listbox')
    expect(listbox).toHaveAttribute('aria-activedescendant', 'asset-option-A-001')

    const listItems = within(getAssetsPanel()).getAllByRole('option')
    expect(listItems[0]).toHaveAttribute('tabIndex', '0')
    expect(listItems[1]).toHaveAttribute('tabIndex', '-1')
    expect(listItems[0]).toHaveAttribute('aria-selected', 'false')

    await user.keyboard('{Enter}')

    const updatedItems = within(getAssetsPanel()).getAllByRole('option')
    expect(updatedItems[0]).toHaveAttribute('aria-selected', 'true')
    expect(updatedItems[0]).toHaveFocus()

    await user.keyboard('j')

    const movedItems = within(getAssetsPanel()).getAllByRole('option')
    expect(movedItems[1]).toHaveAttribute('aria-selected', 'true')
    expect(movedItems[1]).toHaveAttribute('tabIndex', '0')
    expect(movedItems[1]).toHaveFocus()
    expect(listbox).toHaveAttribute('aria-activedescendant', 'asset-option-A-002')
  })

  it('scrolls selected asset row into view when keyboard navigation changes focus', async () => {
    const user = userEvent.setup()
    const scrollIntoViewMock = vi.fn()
    const originalScrollIntoView = HTMLElement.prototype.scrollIntoView
    HTMLElement.prototype.scrollIntoView = scrollIntoViewMock

    try {
      render(<App />)
      await user.keyboard('{Enter}')
      await user.keyboard('j')

      expect(scrollIntoViewMock).toHaveBeenCalled()
    } finally {
      HTMLElement.prototype.scrollIntoView = originalScrollIntoView
    }
  })

  it('keeps undo disabled when no action has been recorded', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: 'Annuler dernière action' })).toBeDisabled()
    expect(screen.getByText('Historique disponible: 0')).toBeInTheDocument()
  })

  it('does not log when reset filters is a no-op', async () => {
    const user = userEvent.setup()

    render(<App />)
    const activityPanel = screen.getByLabelText("Journal d'actions")

    await user.click(screen.getByRole('button', { name: 'Réinitialiser filtres' }))

    expect(within(activityPanel).getByText('Aucune action pour le moment.')).toBeInTheDocument()
    expect(screen.getByText('Historique disponible: 0')).toBeInTheDocument()
  })

  it('ignores global shortcuts when focus is inside search input', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.keyboard('{Enter}')
    await user.keyboard('{Shift>}{Space}{/Shift}')
    expect(screen.getByText('Batch sélectionné: 1')).toBeInTheDocument()

    await user.click(screen.getByLabelText('Recherche'))
    await user.keyboard('{Control>}a{/Control}')

    expect(screen.getByText('Batch sélectionné: 1')).toBeInTheDocument()
  })

  it('selects a range in batch with Shift+ArrowDown', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.keyboard('{Enter}')
    await user.keyboard('{Shift>}{ArrowDown}{ArrowDown}{/Shift}')

    expect(screen.getByText('Batch sélectionné: 3')).toBeInTheDocument()
    const activityPanel = screen.getByLabelText("Journal d'actions")
    expect(within(activityPanel).getByText('Sélection plage (1)')).toBeInTheDocument()
  })

  it('applies KEEP REJECT and CLEAR to selected asset with g v x shortcuts', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.keyboard('{Enter}')
    await user.keyboard('v')
    expect(screen.getByText('A-001 - DECIDED_REJECT')).toBeInTheDocument()

    await user.keyboard('g')
    expect(screen.getByText('A-001 - DECIDED_KEEP')).toBeInTheDocument()

    await user.keyboard('x')
    expect(screen.getByText('A-001 - DECISION_PENDING')).toBeInTheDocument()
  })

  it('ignores g v x shortcuts when typing in search input', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByLabelText('Recherche'))
    await user.keyboard('v')

    expect(screen.getByText('A-001 - DECISION_PENDING')).toBeInTheDocument()
  })

  it('clears current selection with Escape shortcut', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.keyboard('{Enter}')
    expect(within(getDetailPanel()).getByText('ID: A-001')).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(within(getDetailPanel()).getByText('Clique un asset pour ouvrir le détail.')).toBeInTheDocument()
  })

  it('applies pending filter with p shortcut', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.keyboard('p')

    expect(screen.getByRole('heading', { name: 'Assets (1)' })).toBeInTheDocument()
    expect(screen.getByText('A-001 - DECISION_PENDING')).toBeInTheDocument()
  })

  it('focuses search input with slash shortcut', async () => {
    const user = userEvent.setup()

    render(<App />)
    const searchInput = screen.getByLabelText('Recherche')

    await user.keyboard('/')

    expect(searchInput).toHaveFocus()
  })

  it('toggles batch-only mode with b shortcut', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.keyboard('{Shift>}')
    await user.click(within(getAssetsPanel()).getByText('interview-camera-a.mov'))
    await user.keyboard('{/Shift}')
    await user.keyboard('b')

    expect(screen.getByRole('heading', { name: 'Assets (1)' })).toBeInTheDocument()
    expect(within(getAssetsPanel()).getByText('interview-camera-a.mov')).toBeInTheDocument()
    expect(within(getAssetsPanel()).queryByText('ambiance-plateau.wav')).not.toBeInTheDocument()
  })

  it('toggles compact density with d shortcut', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByRole('option', { name: /interview-camera-a\.mov/i })).toHaveClass('py-3')
    expect(screen.getByRole('button', { name: 'Densité: confortable' })).toBeInTheDocument()

    await user.keyboard('d')

    expect(screen.getByRole('option', { name: /interview-camera-a\.mov/i })).toHaveClass('py-2')
    expect(screen.getByRole('button', { name: 'Densité: compacte' })).toBeInTheDocument()
  })

  it('loads persisted density mode on startup', () => {
    window.localStorage.setItem('retaia_ui_density_mode', 'COMPACT')
    render(<App />)

    expect(screen.getByRole('option', { name: /interview-camera-a\.mov/i })).toHaveClass('py-2')
    expect(screen.getByRole('button', { name: 'Densité: compacte' })).toBeInTheDocument()
  })

  it('toggles shortcuts help panel with dedicated button', async () => {
    const user = userEvent.setup()

    window.localStorage.setItem('retaia_ui_shortcuts_help_seen', '1')
    render(<App />)

    expect(screen.queryByText(/Raccourcis desktop:/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Voir raccourcis' }))
    expect(screen.getByText(/Raccourcis desktop:/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Masquer raccourcis' }))
    expect(screen.queryByText(/Raccourcis desktop:/)).not.toBeInTheDocument()
  })

  it('toggles shortcuts help panel with question mark shortcut', async () => {
    const user = userEvent.setup()

    window.localStorage.setItem('retaia_ui_shortcuts_help_seen', '1')
    render(<App />)

    await user.keyboard('?')
    expect(screen.getByText(/Raccourcis desktop:/)).toBeInTheDocument()
    await user.keyboard('?')
    expect(screen.queryByText(/Raccourcis desktop:/)).not.toBeInTheDocument()
  })

  it('opens shortcuts help automatically on first launch', () => {
    window.localStorage.removeItem('retaia_ui_shortcuts_help_seen')
    render(<App />)

    expect(screen.getByText(/Raccourcis desktop:/)).toBeInTheDocument()
  })

  it('keeps shortcuts help closed by default once seen', () => {
    window.localStorage.setItem('retaia_ui_shortcuts_help_seen', '1')
    render(<App />)

    expect(screen.queryByText(/Raccourcis desktop:/)).not.toBeInTheDocument()
  })

  it('previews then confirms purge on rejected asset', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input)
      if (url.endsWith('/assets/A-003/purge/preview')) {
        return Promise.resolve(new Response(null, { status: 200 }))
      }
      if (url.endsWith('/assets/A-003/purge')) {
        return Promise.resolve(new Response(null, { status: 200 }))
      }
      return Promise.resolve(new Response(null, { status: 200 }))
    })

    render(<App />)

    await user.click(within(getAssetsPanel()).getByText('behind-the-scenes.jpg'))
    await user.click(screen.getByRole('button', { name: 'Prévisualiser purge' }))
    expect(screen.getByTestId('asset-purge-status')).toHaveTextContent('Prévisualisation purge prête')

    await user.click(screen.getByRole('button', { name: 'Confirmer purge' }))

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/v1/assets/A-003/purge',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(within(getAssetsPanel()).queryByText('behind-the-scenes.jpg')).not.toBeInTheDocument()
    expect(screen.getByTestId('asset-purge-status')).toHaveTextContent('Purge exécutée')
    fetchSpy.mockRestore()
  })

  it('shows purge error when preview fails', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input)
      if (url.endsWith('/assets/A-003/purge/preview')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              code: 'FORBIDDEN_SCOPE',
              message: 'forbidden',
              retryable: false,
              correlation_id: 'c-3',
            }),
            { status: 403, headers: { 'content-type': 'application/json' } },
          ),
        )
      }
      return Promise.resolve(new Response(null, { status: 200 }))
    })

    render(<App />)

    await user.click(within(getAssetsPanel()).getByText('behind-the-scenes.jpg'))
    await user.click(screen.getByRole('button', { name: 'Prévisualiser purge' }))

    expect(screen.getByTestId('asset-purge-status')).toHaveTextContent('scope manquant')
    fetchSpy.mockRestore()
  })

  it('shows purge error when confirmation fails with state conflict', async () => {
    const user = userEvent.setup()
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = String(input)
      if (url.endsWith('/assets/A-003/purge/preview')) {
        return Promise.resolve(new Response(null, { status: 200 }))
      }
      if (url.endsWith('/assets/A-003/purge')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              code: 'STATE_CONFLICT',
              message: 'state conflict',
              retryable: false,
              correlation_id: 'c-4',
            }),
            { status: 409, headers: { 'content-type': 'application/json' } },
          ),
        )
      }
      return Promise.resolve(new Response(null, { status: 200 }))
    })

    render(<App />)

    await user.click(within(getAssetsPanel()).getByText('behind-the-scenes.jpg'))
    await user.click(screen.getByRole('button', { name: 'Prévisualiser purge' }))
    await user.click(screen.getByRole('button', { name: 'Confirmer purge' }))

    expect(screen.getByTestId('asset-purge-status')).toHaveTextContent("Conflit d'état")
    expect(within(getAssetsPanel()).getByText('behind-the-scenes.jpg')).toBeInTheDocument()
    fetchSpy.mockRestore()
  })

  it('keeps purge confirmation disabled until preview is successful', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(within(getAssetsPanel()).getByText('behind-the-scenes.jpg'))
    expect(screen.getByRole('button', { name: 'Confirmer purge' })).toBeDisabled()

    await user.click(within(getDetailPanel()).getByRole('button', { name: 'KEEP' }))
    expect(screen.getByRole('button', { name: 'Prévisualiser purge' })).toBeDisabled()
  })
})
