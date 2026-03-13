import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthPage } from '../pages/AuthPage'
import { SettingsPage } from '../pages/SettingsPage'
import ReviewWorkspacePage from '../pages/ReviewWorkspacePage'
import ActivityPage from '../pages/ActivityPage'
import { LibraryPage } from '../pages/LibraryPage'
import { StandaloneAssetDetailPage } from '../pages/StandaloneAssetDetailPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ForbiddenPage } from '../pages/ForbiddenPage'

export function AppRoutes() {
  return (
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
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
