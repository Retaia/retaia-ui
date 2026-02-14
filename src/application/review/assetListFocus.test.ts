import { describe, expect, it } from 'vitest'
import { resolveAssetListFocusTarget } from './assetListFocus'

function createAssetRow(assetId: string, withOpenButton = true) {
  const row = document.createElement('div')
  row.setAttribute('data-asset-id', assetId)
  if (withOpenButton) {
    const button = document.createElement('button')
    button.setAttribute('data-asset-open', 'true')
    row.append(button)
  }
  return row
}

describe('resolveAssetListFocusTarget', () => {
  it('returns selected open target when selected row exists', () => {
    const region = document.createElement('section')
    const row = createAssetRow('asset-1')
    const other = createAssetRow('asset-2')
    region.append(row, other)

    const target = resolveAssetListFocusTarget({
      region,
      selectedAssetId: 'asset-1',
      isActiveElementTypingContext: false,
    })

    expect(target).toBe(row.querySelector('[data-asset-open="true"]'))
  })

  it('falls back to first row open target when selected row is not visible', () => {
    const region = document.createElement('section')
    const firstRow = createAssetRow('asset-1')
    region.append(firstRow)

    const target = resolveAssetListFocusTarget({
      region,
      selectedAssetId: 'asset-missing',
      isActiveElementTypingContext: false,
    })

    expect(target).toBe(firstRow.querySelector('[data-asset-open="true"]'))
  })

  it('returns null when active element is in typing context and selected exists', () => {
    const region = document.createElement('section')
    const row = createAssetRow('asset-1')
    region.append(row)

    const target = resolveAssetListFocusTarget({
      region,
      selectedAssetId: 'asset-1',
      isActiveElementTypingContext: true,
    })

    expect(target).toBeNull()
  })
})
