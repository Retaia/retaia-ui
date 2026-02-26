import { AppRoutes } from './routes/AppRoutes'
import { QueryClientProvider } from '@tanstack/react-query'
import { appQueryClient } from './queryClient'
import { Provider } from 'react-redux'
import { useMemo } from 'react'
import { createAppPersistor, createAppStore } from './store'
import { PersistGate } from 'redux-persist/integration/react'

function App() {
  const store = useMemo(() => createAppStore(), [])
  const persistor = useMemo(() => createAppPersistor(store), [store])

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={appQueryClient}>
          <AppRoutes />
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  )
}

export default App
