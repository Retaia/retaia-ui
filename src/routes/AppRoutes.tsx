import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { AuthPage } from '../pages/AuthPage'
import { SettingsPage } from '../pages/SettingsPage'
import ReviewWorkspacePage from '../pages/ReviewWorkspacePage'
import ActivityPage from '../pages/ActivityPage'
import { LibraryPage } from '../pages/LibraryPage'
import { StandaloneAssetDetailPage } from '../pages/StandaloneAssetDetailPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ForbiddenPage } from '../pages/ForbiddenPage'
import { RejectsPage } from '../pages/RejectsPage'
import { AccountPage } from '../pages/AccountPage'

function LegacyDetailRedirect({ context }: { context: 'review' | 'library' }) {
  const { assetId } = useParams<{ assetId: string }>()
  const location = useLocation()
  const query = location.search

  return (
    <Navigate
      to={assetId ? `/${context}/asset/${assetId}${query}` : `/${context}`}
      replace
    />
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/review" replace />} />
      <Route path="/review" element={<ReviewWorkspacePage />} />
      <Route path="/review/detail/:assetId" element={<LegacyDetailRedirect context="review" />} />
      <Route path="/review/asset/:assetId" element={<StandaloneAssetDetailPage context="review" />} />
      <Route path="/activity" element={<ActivityPage />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/library/detail/:assetId" element={<LegacyDetailRedirect context="library" />} />
      <Route path="/library/asset/:assetId" element={<StandaloneAssetDetailPage context="library" />} />
      <Route path="/rejects" element={<RejectsPage />} />
      <Route path="/rejects/asset/:assetId" element={<StandaloneAssetDetailPage context="rejects" />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/reset-password" element={<AuthPage />} />
      <Route path="/auth/verify-email" element={<AuthPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path="/not-found" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
