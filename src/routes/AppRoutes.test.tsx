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

  it('redirects unknown paths to /not-found', async () => {
    setupApp('/unknown-route')

    expect(await screen.findByRole('heading', { level: 1, name: '404 - Page introuvable' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/not-found')
  })

  it('renders settings page on /settings', async () => {
    setupApp('/settings')

    expect(await screen.findByRole('heading', { level: 1, name: 'Configuration' })).toBeInTheDocument()
    expect(screen.getByLabelText('Connexion API (runtime)')).toBeInTheDocument()
  })

  it('redirects /batch to /not-found', async () => {
    setupApp('/batch')

    expect(await screen.findByRole('heading', { level: 1, name: '404 - Page introuvable' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/not-found')
  })

  it('redirects /batch/reports to /not-found', async () => {
    setupApp('/batch/reports')

    expect(await screen.findByRole('heading', { level: 1, name: '404 - Page introuvable' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/not-found')
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

  it('redirects legacy review asset route to /not-found', async () => {
    setupApp('/review/A-001')

    expect(await screen.findByRole('heading', { level: 1, name: '404 - Page introuvable' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/not-found')
  })

  it('redirects legacy library asset route to /not-found via fallback', async () => {
    setupApp('/library/A-002')

    expect(await screen.findByRole('heading', { level: 1, name: '404 - Page introuvable' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/not-found')
  })

  it('renders forbidden page on /forbidden', async () => {
    setupApp('/forbidden')

    expect(await screen.findByRole('heading', { level: 1, name: '403 - Accès interdit' })).toBeInTheDocument()
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
