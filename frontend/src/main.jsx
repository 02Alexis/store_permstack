import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

// Create a client
const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
      </BrowserRouter>
      </ClerkProvider>
  </StrictMode>,
)
