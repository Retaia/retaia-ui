import { describe, expect, it } from 'vitest'
import { normalizeReviewMetadataInput } from './metadata'

describe('normalizeReviewMetadataInput', () => {
  it('trims and deduplicates tags and trims notes', () => {
    const result = normalizeReviewMetadataInput({
      tags: ['  urgent  ', 'urgent', 'alpha', ' ', 'beta '],
      notes: '  keep this  ',
    })

    expect(result).toEqual({
      tags: ['urgent', 'alpha', 'beta'],
      notes: 'keep this',
    })
  })
})

