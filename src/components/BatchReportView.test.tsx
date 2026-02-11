import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BatchReportView } from './BatchReportView'

const labels = {
  summary: 'Synthèse batch',
  status: 'Statut',
  moved: 'Déplacés',
  failed: 'Échecs',
  errors: 'Erreurs',
  noErrors: 'Aucune erreur',
}

describe('BatchReportView usability', () => {
  it('shows status and metrics as Bootstrap badges', () => {
    const { container } = render(
      <BatchReportView report={{ status: 'DONE', moved: 2, failed: 0, errors: [] }} labels={labels} />,
    )

    expect(screen.getAllByText('DONE')[0]).toBeInTheDocument()
    expect(screen.getByText('Déplacés: 2')).toBeInTheDocument()
    expect(screen.getByText('Échecs: 0')).toBeInTheDocument()
    expect(container.querySelector('.text-bg-success')).toBeTruthy()
  })

  it('displays errors count and sorts rows by asset id', () => {
    render(
      <BatchReportView
        report={{
          status: 'FAILED',
          moved: 0,
          failed: 2,
          errors: [
            { asset_id: 'A-010', reason: 'later' },
            { asset_id: 'A-002', reason: 'earlier' },
          ],
        }}
        labels={labels}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Erreurs (2)' })).toBeInTheDocument()
    const rows = screen.getAllByTestId('batch-report-error-asset')
    expect(rows[0]).toHaveTextContent('A-002')
    expect(rows[1]).toHaveTextContent('A-010')

    const reasons = screen.getAllByTestId('batch-report-error-reason')
    expect(reasons[0]).toHaveTextContent('earlier')
    expect(reasons[1]).toHaveTextContent('later')
  })

  it('falls back to preformatted payload for non-object reports', () => {
    render(<BatchReportView report="raw-value" labels={labels} />)
    expect(screen.getByText('"raw-value"')).toBeInTheDocument()
  })
})
