import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { getAssetsPanel, setupApp } from './test-utils/appTestUtils'

describe('App batch flows', () => {
  it('adds assets to batch with shift+click and applies batch action', async () => {
    const { user } = setupApp()

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
    const { user } = setupApp()

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
    const { user } = setupApp()

    await user.keyboard('{Shift>}')
    await user.click(within(getAssetsPanel()).getByText('interview-camera-a.mov'))
    await user.click(within(getAssetsPanel()).getByText('behind-the-scenes.jpg'))
    await user.keyboard('{/Shift}')

    expect(screen.getByText('À exécuter: 2')).toBeInTheDocument()
    expect(screen.getByText('En attente: 1 · KEEP: 0 · REJECT: 1')).toBeInTheDocument()
  })

  it('confirms queued batch execution with Shift+Enter', async () => {
    const { user } = setupApp()
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
          new Response(JSON.stringify({ status: 'DONE', moved: 1 }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
        )
      }
      return Promise.resolve(new Response(null, { status: 200 }))
    })

    await user.keyboard('{Shift>}')
    await user.click(within(getAssetsPanel()).getByText('interview-camera-a.mov'))
    await user.keyboard('{/Shift}')
    await user.click(screen.getByRole('button', { name: 'Exécuter batch' }))
    expect(screen.getByTestId('batch-execute-undo-status')).toBeInTheDocument()

    await user.keyboard('{Shift>}{Enter}{/Shift}')
    expect(screen.getByTestId('batch-execute-status')).toHaveTextContent('acceptée')

    fetchSpy.mockRestore()
  })

  it('cancels queued batch execution before API call', async () => {
    const { user } = setupApp()
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }))

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
})
