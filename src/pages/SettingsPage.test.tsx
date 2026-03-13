import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { setupApp } from '../test-utils/appTestUtils'

describe('SettingsPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('saves asset source preference in localStorage', async () => {
    const { user } = setupApp('/settings')

    await user.click(screen.getByLabelText('API réelle'))
    await user.click(screen.getByRole('button', { name: 'Enregistrer source' }))

    expect(window.localStorage.getItem('retaia_asset_source')).toBe('api')
    expect(await screen.findByTestId('settings-asset-source-status')).toHaveTextContent(
      'Source des assets enregistrée.',
    )
  })
})
