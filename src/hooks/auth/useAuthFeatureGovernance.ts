import { useCallback, useEffect, useMemo, useState } from 'react'
import type { TFunction } from 'i18next'
import { mapApiErrorToMessage } from '../../api/errorMapping'
import type { ApiClient } from '../../api/client'

export type FeatureState = {
  userFeatureEnabled: Record<string, boolean>
  effectiveFeatureEnabled: Record<string, boolean>
  featureGovernance: Array<{
    key: string
    user_can_disable: boolean
  }>
}

type AppFeatureState = {
  appFeatureEnabled: Record<string, boolean>
  featureGovernance: Array<{
    key: string
    user_can_disable: boolean
  }>
}

function normalizeFeatures(payload: {
  user_feature_enabled?: Record<string, unknown>
  effective_feature_enabled?: Record<string, unknown>
  feature_governance?: Array<{ key?: string; user_can_disable?: boolean }>
}): FeatureState {
  const userFeatureEnabled = Object.entries(payload.user_feature_enabled ?? {}).reduce<Record<string, boolean>>(
    (acc, [key, value]) => {
      if (typeof value === 'boolean') {
        acc[key] = value
      }
      return acc
    },
    {},
  )
  const effectiveFeatureEnabled = Object.entries(payload.effective_feature_enabled ?? {}).reduce<
    Record<string, boolean>
  >((acc, [key, value]) => {
    if (typeof value === 'boolean') {
      acc[key] = value
    }
    return acc
  }, {})
  const featureGovernance = (payload.feature_governance ?? [])
    .filter((item) => typeof item.key === 'string')
    .map((item) => ({
      key: item.key as string,
      user_can_disable: item.user_can_disable === true,
    }))

  return {
    userFeatureEnabled,
    effectiveFeatureEnabled,
    featureGovernance,
  }
}

function normalizeAppFeatures(payload: {
  app_feature_enabled?: Record<string, unknown>
  feature_governance?: Array<{ key?: string; user_can_disable?: boolean }>
}): AppFeatureState {
  const appFeatureEnabled = Object.entries(payload.app_feature_enabled ?? {}).reduce<Record<string, boolean>>(
    (acc, [key, value]) => {
      if (typeof value === 'boolean') {
        acc[key] = value
      }
      return acc
    },
    {},
  )
  const featureGovernance = (payload.feature_governance ?? [])
    .filter((item) => typeof item.key === 'string')
    .map((item) => ({
      key: item.key as string,
      user_can_disable: item.user_can_disable === true,
    }))
  return {
    appFeatureEnabled,
    featureGovernance,
  }
}

type UseAuthFeatureGovernanceArgs = {
  apiClient: ApiClient
  t: TFunction
  authUserIsAdmin: boolean
  userFeatureState: FeatureState | null
  setUserFeatureState: React.Dispatch<React.SetStateAction<FeatureState | null>>
  setAuthMfaStatus: React.Dispatch<
    React.SetStateAction<{
      kind: 'success' | 'error'
      message: string
    } | null>
  >
  setAuthMfaBusy: React.Dispatch<React.SetStateAction<boolean>>
}

export function useAuthFeatureGovernance({
  apiClient,
  t,
  authUserIsAdmin,
  userFeatureState,
  setUserFeatureState,
  setAuthMfaStatus,
  setAuthMfaBusy,
}: UseAuthFeatureGovernanceArgs) {
  const [appFeatureState, setAppFeatureState] = useState<AppFeatureState | null>(null)
  const [appFeatureBusy, setAppFeatureBusy] = useState(false)
  const [appFeatureStatus, setAppFeatureStatus] = useState<{
    kind: 'success' | 'error'
    message: string
  } | null>(null)

  useEffect(() => {
    if (!authUserIsAdmin) {
      setAppFeatureState(null)
      setAppFeatureStatus(null)
      return
    }
    let canceled = false
    const loadAppFeatures = async () => {
      try {
        const appFeatures = await apiClient.getAppFeatures()
        if (canceled) {
          return
        }
        setAppFeatureState(normalizeAppFeatures(appFeatures))
      } catch (error) {
        if (canceled) {
          return
        }
        setAppFeatureState(null)
        setAppFeatureStatus({
          kind: 'error',
          message: t('app.authAppFeatureLoadError', {
            message: mapApiErrorToMessage(error, t),
          }),
        })
      }
    }
    void loadAppFeatures()
    return () => {
      canceled = true
    }
  }, [apiClient, authUserIsAdmin, t])

  const appMfaFeatureKey = useMemo(() => {
    if (!appFeatureState) {
      return null
    }
    const fromGovernance = appFeatureState.featureGovernance.find((item) =>
      /(2fa|mfa|totp)/i.test(item.key),
    )
    if (fromGovernance) {
      return fromGovernance.key
    }
    return Object.keys(appFeatureState.appFeatureEnabled).find((key) => /(2fa|mfa|totp)/i.test(key)) ?? null
  }, [appFeatureState])

  const appMfaFeatureEnabled = useMemo(() => {
    if (!appMfaFeatureKey || !appFeatureState) {
      return false
    }
    return appFeatureState.appFeatureEnabled[appMfaFeatureKey] === true
  }, [appFeatureState, appMfaFeatureKey])

  const setAppFeature = useCallback(
    async (enabled: boolean) => {
      if (!appMfaFeatureKey || !appFeatureState) {
        return
      }
      setAppFeatureBusy(true)
      setAppFeatureStatus(null)
      try {
        const response = await apiClient.updateAppFeatures({
          app_feature_enabled: {
            ...appFeatureState.appFeatureEnabled,
            [appMfaFeatureKey]: enabled,
          },
        })
        setAppFeatureState(normalizeAppFeatures(response))
        setAppFeatureStatus({
          kind: 'success',
          message: enabled ? t('app.authAppFeatureEnabled') : t('app.authAppFeatureDisabled'),
        })
      } catch (error) {
        setAppFeatureStatus({
          kind: 'error',
          message: t('app.authAppFeatureUpdateError', {
            message: mapApiErrorToMessage(error, t),
          }),
        })
      } finally {
        setAppFeatureBusy(false)
      }
    },
    [apiClient, appFeatureState, appMfaFeatureKey, t],
  )

  const mfaFeatureKey = useMemo(() => {
    if (!userFeatureState) {
      return null
    }
    const fromGovernance = userFeatureState.featureGovernance.find((item) =>
      /(2fa|mfa|totp)/i.test(item.key),
    )
    if (fromGovernance) {
      return fromGovernance.key
    }
    const fromEffective = Object.keys(userFeatureState.effectiveFeatureEnabled).find((key) =>
      /(2fa|mfa|totp)/i.test(key),
    )
    return fromEffective ?? null
  }, [userFeatureState])

  const mfaFeatureAvailable = useMemo(() => {
    if (!mfaFeatureKey || !userFeatureState) {
      return false
    }
    const userEffective = userFeatureState.effectiveFeatureEnabled[mfaFeatureKey] === true
    if (!appMfaFeatureKey) {
      return userEffective
    }
    return userEffective && appMfaFeatureEnabled
  }, [appMfaFeatureEnabled, appMfaFeatureKey, mfaFeatureKey, userFeatureState])

  const mfaFeatureUserEnabled = useMemo(() => {
    if (!mfaFeatureKey || !userFeatureState) {
      return false
    }
    const current = userFeatureState.userFeatureEnabled[mfaFeatureKey]
    return current !== false
  }, [mfaFeatureKey, userFeatureState])

  const mfaFeatureUserCanDisable = useMemo(() => {
    if (!mfaFeatureKey || !userFeatureState) {
      return false
    }
    const governance = userFeatureState.featureGovernance.find((item) => item.key === mfaFeatureKey)
    return governance?.user_can_disable === true
  }, [mfaFeatureKey, userFeatureState])

  const setUserFeature = useCallback(
    async (enabled: boolean) => {
      if (!mfaFeatureKey || !userFeatureState) {
        return
      }
      setAuthMfaBusy(true)
      setAuthMfaStatus(null)
      try {
        const response = await apiClient.updateUserFeatures({
          user_feature_enabled: {
            ...userFeatureState.userFeatureEnabled,
            [mfaFeatureKey]: enabled,
          },
        })
        const normalized = normalizeFeatures(response)
        setUserFeatureState({
          ...normalized,
          featureGovernance: userFeatureState.featureGovernance,
        })
        setAuthMfaStatus({
          kind: 'success',
          message: enabled ? t('app.authMfaFeatureEnabled') : t('app.authMfaFeatureDisabled'),
        })
      } catch (error) {
        setAuthMfaStatus({
          kind: 'error',
          message: t('app.authMfaFeatureError', {
            message: mapApiErrorToMessage(error, t),
          }),
        })
      } finally {
        setAuthMfaBusy(false)
      }
    },
    [apiClient, mfaFeatureKey, setAuthMfaBusy, setAuthMfaStatus, setUserFeatureState, t, userFeatureState],
  )

  return {
    appFeatureBusy,
    appFeatureStatus,
    appMfaFeatureKey,
    appMfaFeatureEnabled,
    mfaFeatureKey,
    mfaFeatureAvailable,
    mfaFeatureUserEnabled,
    mfaFeatureUserCanDisable,
    setAppFeature,
    setUserFeature,
  }
}

