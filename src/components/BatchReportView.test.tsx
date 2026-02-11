import { render, screen, within } from '@testing-library/react'
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

describe('BatchReportView', () => {
  it('renders summary values from canonical keys', () => {
    render(
      <BatchReportView
        report={{ status: 'DONE', moved: 7, failed: 1, errors: [] }}
        labels={labels}
      />,
    )

    const summary = screen.getByRole('region', { name: labels.summary })
    const table = within(summary).getByRole('table')
    expect(within(table).getAllByText('DONE').length).toBeGreaterThan(0)
    expect(within(table).getByText('7')).toBeVisible()
    expect(within(table).getByText('1')).toBeVisible()
    expect(screen.getByText(labels.noErrors)).toBeVisible()
  })

  it('supports moved_count/failed_count fallback keys', () => {
    render(
      <BatchReportView
        report={{ status: 'PARTIAL', moved_count: 3, failed_count: 2, errors: [] }}
        labels={labels}
      />,
    )

    expect(screen.getAllByText('PARTIAL').length).toBeGreaterThan(0)
    expect(screen.getByText('3')).toBeVisible()
    expect(screen.getByText('2')).toBeVisible()
  })

  it('renders normalized error rows with fallbacks', () => {
    render(
      <BatchReportView
        report={{
          status: 'FAILED',
          moved: 0,
          failed: 2,
          errors: [{ asset_id: 'A-001', reason: 'checksum mismatch' }, { bad: true }],
        }}
        labels={labels}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Erreurs (2)' })).toBeVisible()
    const rows = screen.getAllByTestId('batch-report-error-asset')
    expect(rows[0]).toHaveTextContent('A-001')
    expect(rows[1]).toHaveTextContent('n/a')

    const reasons = screen.getAllByTestId('batch-report-error-reason')
    expect(reasons[0]).toHaveTextContent('checksum mismatch')
    expect(reasons[1]).toHaveTextContent('unknown')
  })

  it('sorts errors by asset id', () => {
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

    const rows = screen.getAllByTestId('batch-report-error-asset')
    expect(rows[0]).toHaveTextContent('A-002')
    expect(rows[1]).toHaveTextContent('A-010')
  })

  it('renders badges for status and metrics', () => {
    const { container } = render(
      <BatchReportView report={{ status: 'DONE', moved: 2, failed: 0, errors: [] }} labels={labels} />,
    )

    expect(screen.getByText('Déplacés: 2')).toBeInTheDocument()
    expect(screen.getByText('Échecs: 0')).toBeInTheDocument()
    expect(container.querySelector('.text-bg-success')).toBeTruthy()
  })

  it('falls back to raw JSON when report is not an object', () => {
    render(<BatchReportView report="offline" labels={labels} />)
    expect(screen.getByText('"offline"')).toBeVisible()
  })
})
