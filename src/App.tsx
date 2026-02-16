import { AppRoutes } from './routes/AppRoutes'
import { QueryClientProvider } from '@tanstack/react-query'
import { appQueryClient } from './queryClient'

function App() {
  return (
    <QueryClientProvider client={appQueryClient}>
      <AppRoutes />
    </QueryClientProvider>
  )
}

export default App
