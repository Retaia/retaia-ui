import { useCallback, useEffect } from 'react'

export function useUnsavedChangesGuard(hasUnsavedChanges: boolean, message: string) {
  const confirmLeaveIfDirty = useCallback(() => {
    if (!hasUnsavedChanges) {
      return true
    }
    return window.confirm(message)
  }, [hasUnsavedChanges, message])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) {
        return
      }
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  return confirmLeaveIfDirty
}
