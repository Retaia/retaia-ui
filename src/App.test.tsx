import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import App from './App'

describe('App', () => {
  it('renders title and increments the counter when clicked', async () => {
    const user = userEvent.setup()

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Vite + React' })).toBeInTheDocument()

    const counterButton = screen.getByRole('button', { name: 'count is 0' })
    await user.click(counterButton)

    expect(screen.getByRole('button', { name: 'count is 1' })).toBeInTheDocument()
  })
})
