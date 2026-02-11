import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BatchReportView } from './BatchReportView'

const labels = {
  summary: 'Résumé batch',
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
    expect(within(table).getByText('DONE')).toBeVisible()
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

    expect(screen.getByText('PARTIAL')).toBeVisible()
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

    const errorsHeading = screen.getByRole('heading', { name: labels.errors })
    expect(errorsHeading).toBeVisible()
    const tables = screen.getAllByRole('table')
    const errorTable = tables[1]
    expect(within(errorTable).getByText('A-001')).toBeVisible()
    expect(within(errorTable).getByText('checksum mismatch')).toBeVisible()
    expect(within(errorTable).getByText('n/a')).toBeVisible()
    expect(within(errorTable).getByText('unknown')).toBeVisible()
  })

  it('falls back to raw JSON when report is not an object', () => {
    render(<BatchReportView report="offline" labels={labels} />)

    expect(screen.getByText('"offline"')).toBeVisible()
  })
})
