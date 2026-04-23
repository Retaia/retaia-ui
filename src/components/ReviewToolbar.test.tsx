import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ReviewToolbar } from './ReviewToolbar'

describe('ReviewToolbar', () => {
  it('renders every normative asset state in the state filter', () => {
    render(
      <ReviewToolbar
        filter="ALL"
        mediaTypeFilter="ALL"
        dateFilter="ALL"
        sort="-created_at"
        search=""
        labels={{
          filter: 'State',
          mediaType: 'Media type',
          date: 'Captured date',
          sortBy: 'Sort by',
          sortCreatedAtDesc: 'Newest',
          sortCreatedAtAsc: 'Oldest',
          sortUpdatedAtDesc: 'Updated newest',
          sortUpdatedAtAsc: 'Updated oldest',
          sortNameAsc: 'A-Z',
          sortNameDesc: 'Z-A',
          search: 'Search',
          searchPlaceholder: 'Name or identifier',
          all: 'All',
          date7d: 'Last 7 days',
          date30d: 'Last 30 days',
          stateLabel: (value) => value,
          mediaTypeVideo: 'Video',
          mediaTypeAudio: 'Audio',
          mediaTypeImage: 'Image',
          mediaTypeOther: 'Other',
        }}
        onFilterChange={vi.fn()}
        onMediaTypeFilterChange={vi.fn()}
        onDateFilterChange={vi.fn()}
        onSortChange={vi.fn()}
        onSearchChange={vi.fn()}
      />,
    )

    const stateFilter = screen.getByLabelText('State')
    const optionValues = Array.from(stateFilter.querySelectorAll('option')).map((option) => option.getAttribute('value'))

    expect(optionValues).toEqual([
      'ALL',
      'DISCOVERED',
      'READY',
      'PROCESSING_REVIEW',
      'REVIEW_PENDING_PROFILE',
      'PROCESSED',
      'DECISION_PENDING',
      'DECIDED_KEEP',
      'DECIDED_REJECT',
      'ARCHIVED',
      'REJECTED',
      'PURGED',
    ])
  })
})
