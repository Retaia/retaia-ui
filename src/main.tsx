import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './i18n'
import './index.css'
import App from './App.tsx'
import { AppErrorBoundary } from './components/app/AppErrorBoundary.tsx'
import { TailadminThemeProvider } from './ui/tailadmin-theme.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TailadminThemeProvider>
      <AppErrorBoundary>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppErrorBoundary>
    </TailadminThemeProvider>
  </StrictMode>,
)
