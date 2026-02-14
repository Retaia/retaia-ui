export type ShortcutCommand =
  | { type: 'clear_search' }
  | { type: 'select_all_visible' }
  | { type: 'undo_last_action' }
  | { type: 'confirm_pending_execute' }
  | { type: 'toggle_batch_for_selected' }
  | { type: 'clear_selection' }
  | { type: 'focus_pending' }
  | { type: 'toggle_batch_only' }
  | { type: 'open_next_pending' }
  | { type: 'toggle_density_mode' }
  | { type: 'select_first_visible' }
  | { type: 'select_last_visible' }
  | { type: 'refresh_batch_report' }
  | { type: 'clear_activity_log' }
  | { type: 'apply_preset_pending_recent' }
  | { type: 'apply_preset_images_rejected' }
  | { type: 'apply_preset_media_review' }
  | { type: 'focus_search' }
  | { type: 'apply_decision_keep' }
  | { type: 'apply_decision_reject' }
  | { type: 'apply_decision_clear' }
  | { type: 'toggle_shortcuts_help' }
  | { type: 'move_selection'; offset: -1 | 1; extendRange: boolean }

type ResolveShortcutCommandArgs = {
  key: string
  code: string
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
  isTypingContext: boolean
  isSearchInputWithValue: boolean
  hasPendingBatchExecution: boolean
  hasVisibleAssets: boolean
  hasSelectedAsset: boolean
}

export function resolveShortcutCommand(args: ResolveShortcutCommandArgs): ShortcutCommand | null {
  const lowerKey = args.key.toLowerCase()
  const hasModifier = args.ctrlKey || args.metaKey || args.shiftKey

  if (args.isTypingContext) {
    if (args.key === 'Escape' && args.isSearchInputWithValue) {
      return { type: 'clear_search' }
    }
    return null
  }

  if ((args.ctrlKey || args.metaKey) && lowerKey === 'a') {
    return { type: 'select_all_visible' }
  }
  if ((args.ctrlKey || args.metaKey) && lowerKey === 'z') {
    return { type: 'undo_last_action' }
  }
  if (args.shiftKey && args.key === 'Enter' && args.hasPendingBatchExecution) {
    return { type: 'confirm_pending_execute' }
  }
  if (
    args.shiftKey &&
    (args.key === ' ' || args.key === 'Spacebar' || args.key === 'Space' || args.code === 'Space')
  ) {
    return { type: 'toggle_batch_for_selected' }
  }

  if (!hasModifier) {
    if (lowerKey === 'escape') {
      return { type: 'clear_selection' }
    }
    if (lowerKey === 'p') {
      return { type: 'focus_pending' }
    }
    if (lowerKey === 'b') {
      return { type: 'toggle_batch_only' }
    }
    if (lowerKey === 'n') {
      return { type: 'open_next_pending' }
    }
    if (lowerKey === 'd') {
      return { type: 'toggle_density_mode' }
    }
    if (args.key === 'Home' && args.hasVisibleAssets) {
      return { type: 'select_first_visible' }
    }
    if (args.key === 'End' && args.hasVisibleAssets) {
      return { type: 'select_last_visible' }
    }
    if (lowerKey === 'r') {
      return { type: 'refresh_batch_report' }
    }
    if (lowerKey === 'l') {
      return { type: 'clear_activity_log' }
    }
    if (lowerKey === '1') {
      return { type: 'apply_preset_pending_recent' }
    }
    if (lowerKey === '2') {
      return { type: 'apply_preset_images_rejected' }
    }
    if (lowerKey === '3') {
      return { type: 'apply_preset_media_review' }
    }
    if (args.key === '/') {
      return { type: 'focus_search' }
    }
    if (lowerKey === 'g') {
      return { type: 'apply_decision_keep' }
    }
    if (lowerKey === 'v') {
      return { type: 'apply_decision_reject' }
    }
    if (lowerKey === 'x') {
      return { type: 'apply_decision_clear' }
    }
  }

  if (args.key === '?') {
    return { type: 'toggle_shortcuts_help' }
  }
  if (args.key === 'j') {
    return { type: 'move_selection', offset: 1, extendRange: false }
  }
  if (args.key === 'k') {
    return { type: 'move_selection', offset: -1, extendRange: false }
  }
  if (args.key === 'ArrowDown') {
    return { type: 'move_selection', offset: 1, extendRange: args.shiftKey }
  }
  if (args.key === 'ArrowUp') {
    return { type: 'move_selection', offset: -1, extendRange: args.shiftKey }
  }
  if (args.key === 'Enter' && !args.hasSelectedAsset && args.hasVisibleAssets) {
    return { type: 'select_first_visible' }
  }

  return null
}
