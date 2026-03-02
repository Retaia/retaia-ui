import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { setupApp } from '../test-utils/appTestUtils'

describe('LibraryPage', () => {
  it('renders archived assets library and filters by search', async () => {
    const { user } = setupApp('/library')

    expect(await screen.findByRole('heading', { name: 'Bibliothèque ARCHIVED (1)' })).toBeInTheDocument()
    expect(screen.getByText('ambiance-plateau.wav')).toBeInTheDocument()

    await user.type(screen.getByTestId('library-search-input'), 'unknown')
    expect(screen.getByText("Aucun asset archivé pour les filtres en cours.")).toBeInTheDocument()
  })

  it('opens detail in panel after selecting an asset from list', async () => {
    const { user } = setupApp('/library')

    await user.click(await screen.findByText('ambiance-plateau.wav'))

    const detail = await screen.findByLabelText("Détail de l'asset")
    expect(within(detail).getByText('ambiance-plateau.wav')).toBeInTheDocument()
    expect(within(detail).getByText('ID: A-002')).toBeInTheDocument()
  })

  it('restores selected asset from persisted workspace context', async () => {
    window.localStorage.setItem(
      'retaia_ui_workspace_context',
      JSON.stringify({ librarySelectedAssetId: 'A-002' }),
    )
    setupApp('/library')

    const detail = await screen.findByLabelText("Détail de l'asset")
    expect(within(detail).getByText('ambiance-plateau.wav')).toBeInTheDocument()
  })

  it('navigates to standalone detail page from detail panel action', async () => {
    const { user } = setupApp('/library?q=ambiance&sort=name')

    await user.click(await screen.findByText('ambiance-plateau.wav'))
    const newTabLink = await screen.findByTestId('asset-open-standalone-new-tab')
    expect(decodeURIComponent(newTabLink.getAttribute('href') ?? '')).toContain('from=/library?q=ambiance&sort=name')

    await user.click(await screen.findByTestId('asset-open-standalone'))
    expect(window.location.pathname).toBe('/library/detail/A-002')
    expect(decodeURIComponent(window.location.search)).toContain('from=/library?q=ambiance&sort=name')
  })

  it('initializes and syncs library search from query params', async () => {
    const { user } = setupApp('/library?q=ambiance&sort=name')

    expect(screen.getByTestId('library-search-input')).toHaveValue('ambiance')
    expect(screen.getByTestId('library-sort-key')).toHaveValue('name')

    await user.clear(screen.getByTestId('library-search-input'))
    await user.type(screen.getByTestId('library-search-input'), 'archive')
    await user.selectOptions(screen.getByTestId('library-sort-key'), '-updated_at')
    expect(window.location.search).toContain('q=archive')
    expect(window.location.search).toContain('sort=-updated_at')
  })

  it('restores library search on browser back using query params history', async () => {
    setupApp('/library')
    const searchInput = screen.getByTestId('library-search-input')

    fireEvent.change(searchInput, { target: { value: 'ambiance' } })
    fireEvent.change(searchInput, { target: { value: 'archive' } })
    expect(screen.getByTestId('library-search-input')).toHaveValue('archive')

    act(() => {
      window.history.back()
    })

    await waitFor(() => {
      expect(screen.getByTestId('library-search-input')).toHaveValue('ambiance')
    })
  })

  it('loads the next api page when clicking load more', async () => {
    const previous = import.meta.env.VITE_ASSET_SOURCE
    try {
      import.meta.env.VITE_ASSET_SOURCE = 'api'
      const fetchMock = vi.fn((input: RequestInfo | URL) => {
        const url = String(input)
        if (!url.includes('/assets')) {
          return Promise.resolve(
            new Response(JSON.stringify({ server_policy: { feature_flags: {} } }), {
              status: 200,
              headers: { 'content-type': 'application/json' },
            }),
          )
        }
        if (url.includes('cursor=cursor-1')) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                items: [
                  { uuid: 'A-202', state: 'ARCHIVED', media_type: 'AUDIO', created_at: '2026-02-01T11:00:00Z' },
                ],
                next_cursor: null,
              }),
              { status: 200, headers: { 'content-type': 'application/json' } },
            ),
          )
        }
        return Promise.resolve(
          new Response(
            JSON.stringify({
              items: [
                { uuid: 'A-201', state: 'ARCHIVED', media_type: 'AUDIO', created_at: '2026-02-01T10:00:00Z' },
              ],
              next_cursor: 'cursor-1',
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          ),
        )
      })
      vi.spyOn(globalThis, 'fetch').mockImplementation(fetchMock)

      const { user } = setupApp('/library?source=api')
      expect(await screen.findByText('A-201')).toBeInTheDocument()
      await user.click(await screen.findByTestId('library-load-more'))
      expect(await screen.findByText('A-202')).toBeInTheDocument()
    } finally {
      import.meta.env.VITE_ASSET_SOURCE = previous
      vi.restoreAllMocks()
    }
  })
})
