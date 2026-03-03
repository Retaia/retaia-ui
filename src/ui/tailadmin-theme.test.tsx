import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TailadminThemeProvider, useTailadminTheme } from './tailadmin-theme'

function ThemeProbe() {
  const { mode, resolvedTheme, setMode, toggleMode } = useTailadminTheme()
  return (
    <div>
      <p data-testid="theme-mode">{mode}</p>
      <p data-testid="theme-resolved">{resolvedTheme}</p>
      <button type="button" onClick={() => setMode('light')}>
        light
      </button>
      <button type="button" onClick={() => setMode('dark')}>
        dark
      </button>
      <button type="button" onClick={() => setMode('system')}>
        system
      </button>
      <button type="button" onClick={toggleMode}>
        toggle
      </button>
    </div>
  )
}

describe('tailadmin theme system', () => {
  const defaultMatchMedia = vi.fn().mockImplementation(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))

  if (typeof window.matchMedia !== 'function') {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: defaultMatchMedia,
    })
  }

  afterEach(() => {
    window.localStorage.clear()
    document.documentElement.classList.remove('dark')
    vi.restoreAllMocks()
  })

  it('falls back safely without provider', () => {
    render(<ThemeProbe />)
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('system')
    expect(screen.getByTestId('theme-resolved')).toHaveTextContent('light')
  })

  it('loads stored mode and syncs dark class', () => {
    window.localStorage.setItem('retaia_ui_theme_mode', 'dark')
    render(
      <TailadminThemeProvider>
        <ThemeProbe />
      </TailadminThemeProvider>,
    )
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark')
    expect(screen.getByTestId('theme-resolved')).toHaveTextContent('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('supports explicit mode changes and toggle', () => {
    render(
      <TailadminThemeProvider>
        <ThemeProbe />
      </TailadminThemeProvider>,
    )

    act(() => {
      screen.getByRole('button', { name: 'dark' }).click()
    })
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark')
    expect(screen.getByTestId('theme-resolved')).toHaveTextContent('dark')

    act(() => {
      screen.getByRole('button', { name: 'toggle' }).click()
    })
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light')
    expect(screen.getByTestId('theme-resolved')).toHaveTextContent('light')
  })

  it('follows system preference in system mode', () => {
    const media = {
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }
    vi.spyOn(window, 'matchMedia').mockReturnValue(media as unknown as MediaQueryList)

    render(
      <TailadminThemeProvider>
        <ThemeProbe />
      </TailadminThemeProvider>,
    )

    act(() => {
      screen.getByRole('button', { name: 'system' }).click()
    })

    expect(screen.getByTestId('theme-mode')).toHaveTextContent('system')
    expect(screen.getByTestId('theme-resolved')).toHaveTextContent('dark')
  })
})
