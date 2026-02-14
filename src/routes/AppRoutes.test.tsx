import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { setupApp } from '../test-utils/appTestUtils'

describe('AppRoutes', () => {
  it('renders auth page on /auth', () => {
    setupApp('/auth?source=api')

    expect(screen.getByRole('heading', { name: 'Retaia UI' })).toBeInTheDocument()
    expect(screen.getByLabelText('Authentification utilisateur')).toBeInTheDocument()
  })

  it('redirects unknown paths to /review', async () => {
    setupApp('/unknown-route')

    expect(await screen.findByRole('heading', { name: 'Retaia UI' })).toBeInTheDocument()
  })
})
