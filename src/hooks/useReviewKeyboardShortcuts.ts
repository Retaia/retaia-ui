import { useEffect } from 'react'
import type { Asset } from '../domain/assets'
import { isTypingContext } from '../ui/keyboard'

type UseReviewKeyboardShortcutsParams = {
  selectedAssetId: string | null
  visibleAssets: Asset[]
  hasPendingBatchExecution: boolean
  onSetSearch: (value: string) => void
  onSelectAllVisibleInBatch: () => void
  onUndoLastAction: () => void
  onExecuteBatchMoveNow: () => void
  onToggleBatchForSelectedAsset: () => void
  onClearSelection: () => void
  onFocusPending: () => void
  onToggleBatchOnly: () => void
  onOpenNextPending: () => void
  onToggleDensityMode: () => void
  onSelectFirstVisible: () => void
  onSelectLastVisible: () => void
  onRefreshBatchReport: () => void
  onClearActivityLog: () => void
  onApplyPresetPendingRecent: () => void
  onApplyPresetImagesRejected: () => void
  onApplyPresetMediaReview: () => void
  onApplyDecisionKeep: () => void
  onApplyDecisionReject: () => void
  onApplyDecisionClear: () => void
  onToggleShortcutsHelp: () => void
  onSelectVisibleByOffset: (offset: -1 | 1, extendRange?: boolean) => void
}

export function useReviewKeyboardShortcuts({
  selectedAssetId,
  visibleAssets,
  hasPendingBatchExecution,
  onSetSearch,
  onSelectAllVisibleInBatch,
  onUndoLastAction,
  onExecuteBatchMoveNow,
  onToggleBatchForSelectedAsset,
  onClearSelection,
  onFocusPending,
  onToggleBatchOnly,
  onOpenNextPending,
  onToggleDensityMode,
  onSelectFirstVisible,
  onSelectLastVisible,
  onRefreshBatchReport,
  onClearActivityLog,
  onApplyPresetPendingRecent,
  onApplyPresetImagesRejected,
  onApplyPresetMediaReview,
  onApplyDecisionKeep,
  onApplyDecisionReject,
  onApplyDecisionClear,
  onToggleShortcutsHelp,
  onSelectVisibleByOffset,
}: UseReviewKeyboardShortcutsParams) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingContext(event.target)) {
        const target = event.target
        if (
          event.key === 'Escape' &&
          target instanceof HTMLInputElement &&
          target.id === 'asset-search' &&
          target.value !== ''
        ) {
          event.preventDefault()
          onSetSearch('')
          return
        }
        return
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
        event.preventDefault()
        onSelectAllVisibleInBatch()
        return
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        onUndoLastAction()
        return
      }

      if (event.shiftKey && event.key === 'Enter' && hasPendingBatchExecution) {
        event.preventDefault()
        onExecuteBatchMoveNow()
        return
      }

      if (
        event.shiftKey &&
        (event.key === ' ' || event.key === 'Spacebar' || event.key === 'Space' || event.code === 'Space')
      ) {
        event.preventDefault()
        onToggleBatchForSelectedAsset()
        return
      }

      if (!event.metaKey && !event.ctrlKey && !event.shiftKey) {
        const key = event.key.toLowerCase()
        if (key === 'escape') {
          event.preventDefault()
          onClearSelection()
          return
        }
        if (key === 'p') {
          event.preventDefault()
          onFocusPending()
          return
        }
        if (key === 'b') {
          event.preventDefault()
          onToggleBatchOnly()
          return
        }
        if (key === 'n') {
          event.preventDefault()
          onOpenNextPending()
          return
        }
        if (key === 'd') {
          event.preventDefault()
          onToggleDensityMode()
          return
        }
        if (event.key === 'Home' && visibleAssets.length > 0) {
          event.preventDefault()
          onSelectFirstVisible()
          return
        }
        if (event.key === 'End' && visibleAssets.length > 0) {
          event.preventDefault()
          onSelectLastVisible()
          return
        }
        if (key === 'r') {
          event.preventDefault()
          onRefreshBatchReport()
          return
        }
        if (key === 'l') {
          event.preventDefault()
          onClearActivityLog()
          return
        }
        if (key === '1') {
          event.preventDefault()
          onApplyPresetPendingRecent()
          return
        }
        if (key === '2') {
          event.preventDefault()
          onApplyPresetImagesRejected()
          return
        }
        if (key === '3') {
          event.preventDefault()
          onApplyPresetMediaReview()
          return
        }
        if (event.key === '/') {
          event.preventDefault()
          const searchInput = document.getElementById('asset-search')
          if (searchInput instanceof HTMLInputElement) {
            searchInput.focus()
            searchInput.select()
          }
          return
        }
        if (key === 'g') {
          event.preventDefault()
          onApplyDecisionKeep()
          return
        }
        if (key === 'v') {
          event.preventDefault()
          onApplyDecisionReject()
          return
        }
        if (key === 'x') {
          event.preventDefault()
          onApplyDecisionClear()
          return
        }
      }

      if (event.key === '?') {
        event.preventDefault()
        onToggleShortcutsHelp()
        return
      }

      if (event.key === 'j') {
        event.preventDefault()
        onSelectVisibleByOffset(1)
        return
      }

      if (event.key === 'k') {
        event.preventDefault()
        onSelectVisibleByOffset(-1)
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        onSelectVisibleByOffset(1, event.shiftKey)
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        onSelectVisibleByOffset(-1, event.shiftKey)
        return
      }

      if (event.key === 'Enter' && !selectedAssetId && visibleAssets.length > 0) {
        event.preventDefault()
        onSelectFirstVisible()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    selectedAssetId,
    visibleAssets,
    hasPendingBatchExecution,
    onSetSearch,
    onSelectAllVisibleInBatch,
    onUndoLastAction,
    onExecuteBatchMoveNow,
    onToggleBatchForSelectedAsset,
    onClearSelection,
    onFocusPending,
    onToggleBatchOnly,
    onOpenNextPending,
    onToggleDensityMode,
    onSelectFirstVisible,
    onSelectLastVisible,
    onRefreshBatchReport,
    onClearActivityLog,
    onApplyPresetPendingRecent,
    onApplyPresetImagesRejected,
    onApplyPresetMediaReview,
    onApplyDecisionKeep,
    onApplyDecisionReject,
    onApplyDecisionClear,
    onToggleShortcutsHelp,
    onSelectVisibleByOffset,
  ])
}
