import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { UiResetPage } from './pages/UiResetPage'

expect.extend(toHaveNoViolations)

describe('a11y smoke tests', () => {
  it('renders ui reset page without accessibility violations', async () => {
    const { container } = render(
      <MemoryRouter>
        <UiResetPage title="UI reset test" route="/review" />
      </MemoryRouter>,
    )

    const results = await axe(container)

    expect(results).toHaveNoViolations()
  })
})
