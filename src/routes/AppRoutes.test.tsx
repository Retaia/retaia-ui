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
})
