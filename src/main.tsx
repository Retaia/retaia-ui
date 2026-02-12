import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './i18n'
import './index.scss'
import App from './App.tsx'
import { AppErrorBoundary } from './components/app/AppErrorBoundary.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/review" replace />} />
          <Route path="/review" element={<App />} />
          <Route path="/review/:assetId" element={<App />} />
          <Route path="*" element={<Navigate to="/review" replace />} />
        </Routes>
      </BrowserRouter>
    </AppErrorBoundary>
  </StrictMode>,
)
