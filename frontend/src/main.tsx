import { StrictMode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from '@/auth/auth-provider'
import { Toaster } from '@/components/ui/toast'
import './index.css'
import App from '@/App'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
