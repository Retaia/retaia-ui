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
        reportExportStatus={null}
        onRefreshBatchReport={vi.fn(async () => {})}
        onExportBatchReport={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'actions.reportFetch' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'actions.reportExportJson' })).toBeDisabled()
    expect(screen.getByText('actions.reportEmpty')).toBeInTheDocument()
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
})
