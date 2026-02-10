import { beforeEach, describe, expect, it, vi } from 'vitest'

const render = vi.fn()
const createRoot = vi.fn(() => ({ render }))

vi.mock('react-dom/client', () => ({
  createRoot,
}))

vi.mock('./App.tsx', () => ({
  default: () => null,
}))

describe('main bootstrap', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>'
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('mounts the app in the root element', async () => {
    await import('./main.tsx')

    const rootElement = document.getElementById('root')

    expect(createRoot).toHaveBeenCalledTimes(1)
    expect(createRoot).toHaveBeenCalledWith(rootElement)
    expect(render).toHaveBeenCalledTimes(1)
  })
})
