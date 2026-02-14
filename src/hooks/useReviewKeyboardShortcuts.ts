import { useEffect } from 'react'
import type { Asset } from '../domain/assets'
import { resolveShortcutCommand } from '../application/review/keyboardShortcutResolution'
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
      const target = event.target
      const command = resolveShortcutCommand({
        key: event.key,
        code: event.code,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
        isTypingContext: isTypingContext(target),
        isSearchInputWithValue:
          target instanceof HTMLInputElement && target.id === 'asset-search' && target.value !== '',
        hasPendingBatchExecution,
        hasVisibleAssets: visibleAssets.length > 0,
        hasSelectedAsset: selectedAssetId !== null,
      })
      if (!command) {
        return
      }

      event.preventDefault()
      switch (command.type) {
        case 'clear_search':
          onSetSearch('')
          return
        case 'select_all_visible':
          onSelectAllVisibleInBatch()
          return
        case 'undo_last_action':
          onUndoLastAction()
          return
        case 'confirm_pending_execute':
          onExecuteBatchMoveNow()
          return
        case 'toggle_batch_for_selected':
          onToggleBatchForSelectedAsset()
          return
        case 'clear_selection':
          onClearSelection()
          return
        case 'focus_pending':
          onFocusPending()
          return
        case 'toggle_batch_only':
          onToggleBatchOnly()
          return
        case 'open_next_pending':
          onOpenNextPending()
          return
        case 'toggle_density_mode':
          onToggleDensityMode()
          return
        case 'select_first_visible':
          onSelectFirstVisible()
          return
        case 'select_last_visible':
          onSelectLastVisible()
          return
        case 'refresh_batch_report':
          onRefreshBatchReport()
          return
        case 'clear_activity_log':
          onClearActivityLog()
          return
        case 'apply_preset_pending_recent':
          onApplyPresetPendingRecent()
          return
        case 'apply_preset_images_rejected':
          onApplyPresetImagesRejected()
          return
        case 'apply_preset_media_review':
          onApplyPresetMediaReview()
          return
        case 'focus_search': {
          const searchInput = document.getElementById('asset-search')
          if (searchInput instanceof HTMLInputElement) {
            searchInput.focus()
            searchInput.select()
          }
          return
        }
        case 'apply_decision_keep':
          onApplyDecisionKeep()
          return
        case 'apply_decision_reject':
          onApplyDecisionReject()
          return
        case 'apply_decision_clear':
          onApplyDecisionClear()
          return
        case 'toggle_shortcuts_help':
          onToggleShortcutsHelp()
          return
        case 'move_selection':
          onSelectVisibleByOffset(command.offset, command.extendRange)
          return
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
