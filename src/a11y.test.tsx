import { describe, expect, it } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import App from './App'

describe('a11y smoke', () => {
  it('has no critical accessibility violations on initial review screen', async () => {
    window.history.replaceState({}, '', '/review')
    const { container } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    )

    const result = await axe(container)
    expect(result.violations).toEqual([])
  })

  it('has no critical accessibility violations when shortcuts panel is open', async () => {
    window.history.replaceState({}, '', '/review')
    const { container } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    )

    const toggle = screen.getByRole('button', { name: /(Voir|Masquer) raccourcis/i })
    await toggle.click()

    const result = await axe(container)
    expect(result.violations).toEqual([])
  })
})
