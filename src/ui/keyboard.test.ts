import { describe, expect, it } from 'vitest'
import { isTypingContext } from './keyboard'

describe('isTypingContext', () => {
  it('returns true for input textarea select', () => {
    expect(isTypingContext(document.createElement('input'))).toBe(true)
    expect(isTypingContext(document.createElement('textarea'))).toBe(true)
    expect(isTypingContext(document.createElement('select'))).toBe(true)
  })

  it('returns true for contenteditable nodes', () => {
    const node = document.createElement('div')
    node.setAttribute('contenteditable', 'true')
    expect(isTypingContext(node)).toBe(true)
  })

  it('returns false for non typing nodes and null', () => {
    expect(isTypingContext(document.createElement('button'))).toBe(false)
    expect(isTypingContext(null)).toBe(false)
  })
})
