import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { setupApp } from '../test-utils/appTestUtils'

describe('AppRoutes', () => {
  it('renders auth page on /auth', () => {
    setupApp('/auth')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Authentification utilisateur' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Connexion API')).toBeInTheDocument()
  })

  it('redirects unknown paths to /review', async () => {
    setupApp('/unknown-route')

    expect(await screen.findByRole('heading', { name: 'Retaia UI' })).toBeInTheDocument()
  })

  it('renders settings page on /settings', async () => {
    setupApp('/settings')

    expect(await screen.findByRole('heading', { level: 1, name: 'Configuration' })).toBeInTheDocument()
    expect(screen.getByLabelText('Connexion API (runtime)')).toBeInTheDocument()
  })

  it('renders batch page on /batch', async () => {
    setupApp('/batch')

    expect(await screen.findByRole('heading', { name: 'Ops batch' })).toBeInTheDocument()
  })

  it('renders batch reports page on /batch/reports', async () => {
    setupApp('/batch/reports')

    expect(await screen.findByRole('heading', { name: 'Rapports' })).toBeInTheDocument()
  })

  it('renders activity page on /activity', async () => {
    setupApp('/activity')

    expect(await screen.findByRole('heading', { name: 'Activité' })).toBeInTheDocument()
  })

  it('renders library page on /library', async () => {
    setupApp('/library')

    expect(await screen.findByRole('heading', { name: 'Library ARCHIVED (1)' })).toBeInTheDocument()
    expect(screen.getByLabelText('Library des assets archivés')).toBeInTheDocument()
  })

  it('redirects legacy review asset route to /review', async () => {
    setupApp('/review/A-001')

    expect(await screen.findByRole('heading', { name: 'Retaia UI' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/review')
  })

  it('redirects legacy library asset route to /review via fallback', async () => {
    setupApp('/library/A-002')

    expect(await screen.findByRole('heading', { name: 'Retaia UI' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/review')
  })

  it('renders standalone review detail page on /review/detail/:assetId', async () => {
    setupApp('/review/detail/A-001')

    expect(await screen.findByRole('button', { name: 'Retour review' })).toBeInTheDocument()
    expect(screen.getByText('interview-camera-a.mov')).toBeInTheDocument()
  })

  it('renders standalone library detail page on /library/detail/:assetId', async () => {
    setupApp('/library/detail/A-002')

    expect(await screen.findByRole('button', { name: 'Retour library' })).toBeInTheDocument()
    expect(screen.getByText('ambiance-plateau.wav')).toBeInTheDocument()
  })
})
