import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'
import { Alert, Button, Container } from 'react-bootstrap'
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
      <Container as="main" className="py-4">
        <Alert variant="danger" data-testid="app-fatal-error">
          <h1 className="h4 d-flex align-items-center">
            <BsExclamationOctagon className="me-2" aria-hidden="true" />
            {i18next.t('app.fatalErrorTitle')}
          </h1>
          <p className="mb-3">{i18next.t('app.fatalErrorBody')}</p>
          <Button type="button" variant="outline-danger" onClick={this.handleReload}>
            <BsArrowClockwise className="me-1" aria-hidden="true" />
            {i18next.t('app.fatalErrorRetry')}
          </Button>
        </Alert>
      </Container>
    )
  }
}
