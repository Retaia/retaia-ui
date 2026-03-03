import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'
import { BsExclamationOctagon, BsArrowClockwise } from 'react-icons/bs'
import { i18next } from '../../i18n'
import { reportUiIssue } from '../../ui/telemetry'

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportUiIssue('ui.error_boundary', {
      message: error.message,
      stack: errorInfo.componentStack ? 'present' : 'missing',
    })
  }

  handleReload = () => {
    if (typeof window !== 'undefined' && typeof window.location?.reload === 'function') {
      window.location.reload()
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <main className="mx-auto w-full max-w-6xl px-3 py-4">
        <section className="rounded-lg border border-error-300 bg-error-50 p-3 text-sm text-error-800" data-testid="app-fatal-error">
          <h1 className="flex items-center text-xl font-semibold">
            <BsExclamationOctagon className="mr-2" aria-hidden="true" />
            {i18next.t('app.fatalErrorTitle')}
          </h1>
          <p className="mb-3">{i18next.t('app.fatalErrorBody')}</p>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-error-300 bg-white px-3 py-2 text-sm font-semibold text-error-700 transition-colors hover:bg-error-50"
            onClick={this.handleReload}
          >
            <BsArrowClockwise className="mr-1" aria-hidden="true" />
            {i18next.t('app.fatalErrorRetry')}
          </button>
        </section>
      </main>
    )
  }
}
