type ReviewMetadataInput = {
  tags: string[]
  notes: string
}

type ReviewMetadataPayload = {
  tags: string[]
  notes: string
}

export function normalizeReviewMetadataInput(payload: ReviewMetadataInput): ReviewMetadataPayload {
  const tags = payload.tags
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
  const uniqueTags = [...new Set(tags)]
  return {
    tags: uniqueTags,
    notes: payload.notes.trim(),
  }
}

