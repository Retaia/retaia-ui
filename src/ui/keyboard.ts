export function isTypingContext(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const contentEditableAttr = target.getAttribute('contenteditable')
  return Boolean(
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.isContentEditable ||
    contentEditableAttr === '' ||
    contentEditableAttr === 'true'
  )
}
