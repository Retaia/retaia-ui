import { AppRoutes } from './routes/AppRoutes'
import { QueryClientProvider } from '@tanstack/react-query'
import { appQueryClient } from './queryClient'
import { Provider } from 'react-redux'
import { useMemo } from 'react'
import { createAppStore } from './store'

function App() {
  const store = useMemo(() => createAppStore(), [])

  return (
    <Provider store={store}>
      <QueryClientProvider client={appQueryClient}>
        <AppRoutes />
      </QueryClientProvider>
    </Provider>
  )
}

export default App
