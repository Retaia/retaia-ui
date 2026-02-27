import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { setupApp } from '../test-utils/appTestUtils'

describe('AppRoutes', () => {
  it('restores saved workspace route when opening root path', async () => {
    window.localStorage.setItem(
      'retaia_ui_workspace_context',
      JSON.stringify({ lastRoute: '/activity?q=recent' }),
    )
    setupApp('/')

    expect(await screen.findByRole('heading', { name: 'Activité' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/activity')
  })

  it('falls back to /review for invalid saved route when opening root path', async () => {
    window.localStorage.setItem(
      'retaia_ui_workspace_context',
      JSON.stringify({ lastRoute: '/auth' }),
    )
    setupApp('/')

    expect(await screen.findByRole('heading', { name: 'Assets (3)' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/review')
  })

  it('renders auth page on /auth', () => {
    setupApp('/auth')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Authentification utilisateur' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Connexion API')).toBeInTheDocument()
  })

  it('renders not-found page on unknown paths without URL rewrite', async () => {
    setupApp('/unknown-route')

    expect(await screen.findByRole('heading', { level: 1, name: '404 - Page introuvable' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/unknown-route')
  })

  it('renders settings page on /settings', async () => {
    setupApp('/settings')

    expect(await screen.findByRole('heading', { level: 1, name: 'Configuration' })).toBeInTheDocument()
    expect(screen.getByLabelText('Connexion API (runtime)')).toBeInTheDocument()
  })

  it('renders not-found page on /batch without redirect', async () => {
    setupApp('/batch')

    expect(await screen.findByRole('heading', { level: 1, name: '404 - Page introuvable' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/batch')
  })

  it('renders not-found page on /batch/reports without redirect', async () => {
    setupApp('/batch/reports')

    expect(await screen.findByRole('heading', { level: 1, name: '404 - Page introuvable' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/batch/reports')
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

  it('renders not-found page on legacy review asset route without redirect', async () => {
    setupApp('/review/A-001')

    expect(await screen.findByRole('heading', { level: 1, name: '404 - Page introuvable' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/review/A-001')
  })

  it('renders not-found page on legacy library asset route without redirect', async () => {
    setupApp('/library/A-002')

    expect(await screen.findByRole('heading', { level: 1, name: '404 - Page introuvable' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/library/A-002')
  })

  it('renders forbidden page on /forbidden', async () => {
    setupApp('/forbidden')

    expect(await screen.findByRole('heading', { level: 1, name: '403 - Accès interdit' })).toBeInTheDocument()
  })

  it('renders standalone review detail page on /review/detail/:assetId', async () => {
    setupApp('/review/detail/A-001')

    expect(await screen.findByRole('button', { name: 'Retour à Review' })).toBeInTheDocument()
    expect(screen.getByText('interview-camera-a.mov')).toBeInTheDocument()
  })

  it('renders standalone library detail page on /library/detail/:assetId', async () => {
    setupApp('/library/detail/A-002')

    expect(await screen.findByRole('button', { name: 'Retour à Library' })).toBeInTheDocument()
    expect(screen.getByText('ambiance-plateau.wav')).toBeInTheDocument()
  })
})
