import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthPage } from '../pages/AuthPage'
import { SettingsPage } from '../pages/SettingsPage'
import ReviewWorkspacePage from '../pages/ReviewWorkspacePage'
import BatchOperationsPage from '../pages/BatchOperationsPage'
import BatchReportsPage from '../pages/BatchReportsPage'
import ActivityPage from '../pages/ActivityPage'
import { LibraryPage } from '../pages/LibraryPage'
import { StandaloneAssetDetailPage } from '../pages/StandaloneAssetDetailPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/review" replace />} />
      <Route path="/review" element={<ReviewWorkspacePage />} />
      <Route path="/review/detail/:assetId" element={<StandaloneAssetDetailPage context="review" />} />
      <Route path="/batch" element={<BatchOperationsPage />} />
      <Route path="/batch/reports" element={<BatchReportsPage />} />
      <Route path="/activity" element={<ActivityPage />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/library/detail/:assetId" element={<StandaloneAssetDetailPage context="library" />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/review" replace />} />
    </Routes>
  )
}
