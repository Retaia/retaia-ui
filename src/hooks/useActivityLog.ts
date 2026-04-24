import { useSyncExternalStore } from 'react'
import {
  readActivityLog,
  subscribeActivityLog,
  type ActivityLogEntry,
} from '../services/activityLogPersistence'

export function useActivityLog(): ActivityLogEntry[] {
  return useSyncExternalStore(
    subscribeActivityLog,
    readActivityLog,
    (): ActivityLogEntry[] => [],
  )
}
