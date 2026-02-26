import { useEffect, useRef } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthPage } from '../pages/AuthPage'
import { SettingsPage } from '../pages/SettingsPage'
import ReviewWorkspacePage from '../pages/ReviewWorkspacePage'
import ActivityPage from '../pages/ActivityPage'
import { LibraryPage } from '../pages/LibraryPage'
import { StandaloneAssetDetailPage } from '../pages/StandaloneAssetDetailPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ForbiddenPage } from '../pages/ForbiddenPage'
import { reportUiNavigationScreenView } from '../ui/telemetry'

function NavigationTelemetry() {
  const location = useLocation()
  const previousRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    const current = `${location.pathname}${location.search}`
    reportUiNavigationScreenView({
      pathname: location.pathname,
      search: location.search,
      from: previousRef.current,
    })
    previousRef.current = current
  }, [location.pathname, location.search])

  return null
}

export function AppRoutes() {
  return (
    <>
      <NavigationTelemetry />
      <Routes>
        <Route path="/" element={<Navigate to="/review" replace />} />
        <Route path="/review" element={<ReviewWorkspacePage />} />
        <Route path="/review/detail/:assetId" element={<StandaloneAssetDetailPage context="review" />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/library/detail/:assetId" element={<StandaloneAssetDetailPage context="library" />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="/not-found" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </>
  )
}
