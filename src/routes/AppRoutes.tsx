import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthPage } from '../pages/AuthPage'
import ReviewPage from '../pages/ReviewPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/review" replace />} />
      <Route path="/review" element={<ReviewPage />} />
      <Route path="/review/:assetId" element={<ReviewPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/review" replace />} />
    </Routes>
  )
}
