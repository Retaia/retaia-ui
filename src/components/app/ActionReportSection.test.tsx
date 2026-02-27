import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ActionReportSection } from './ActionReportSection'

const t = (key: string) => key

describe('ActionReportSection', () => {
  it('renders report controls and fallback label', () => {
    render(
      <ActionReportSection
        t={t}
        refreshReportDisabled={false}
        reportBatchId={null}
        reportStatus={null}
        reportData={null}
        lastSuccessfulReportBatchId={null}
        lastSuccessfulReportData={null}
        reportExportStatus={null}
        onRefreshBatchReport={vi.fn(async () => {})}
        onExportBatchReport={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'actions.reportFetch' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'actions.reportExportJson' })).toBeDisabled()
    expect(screen.getByTestId('batch-report-empty-state')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'actions.reportFetchCta' })).toBeEnabled()
  })

  it('forwards refresh and export actions', async () => {
    const user = userEvent.setup()
    const onRefreshBatchReport = vi.fn(async () => {})
    const onExportBatchReport = vi.fn()

    render(
      <ActionReportSection
        t={t}
        refreshReportDisabled={false}
        reportBatchId="batch-1"
        reportStatus="ready"
        reportData={{ status: 'done' }}
        lastSuccessfulReportBatchId="batch-1"
        lastSuccessfulReportData={{ status: 'done' }}
        reportExportStatus={null}
        onRefreshBatchReport={onRefreshBatchReport}
        onExportBatchReport={onExportBatchReport}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'actions.reportFetch' }))
    expect(onRefreshBatchReport).toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'actions.reportExportJson' }))
    expect(onExportBatchReport).toHaveBeenCalledWith('json')
  })

  it('shows recent report fallback when current report is unavailable', () => {
    render(
      <ActionReportSection
        t={t}
        refreshReportDisabled={false}
        reportBatchId="batch-2"
        reportStatus="actions.reportError"
        reportData={null}
        lastSuccessfulReportBatchId="batch-1"
        lastSuccessfulReportData={{ status: 'DONE', moved: 2, failed: 0, errors: [] }}
        reportExportStatus={null}
        onRefreshBatchReport={vi.fn(async () => {})}
        onExportBatchReport={vi.fn()}
      />,
    )

    expect(screen.getByTestId('batch-report-recent-note')).toBeInTheDocument()
    expect(screen.getByTestId('batch-report-summary')).toBeInTheDocument()
  })
})
