import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App.tsx'
import { Toaster } from '@/components/ui/sonner'

if (import.meta.env.DEV) {
  // Expose store for manual testing in DevTools Console:
  // window.__store__.getState().addDot(categoryId, name, xRatio, yRatio)
  import('./store/dotBoardStore').then(({ useDotBoardStore }) => {
    ;(window as Window & { __store__?: unknown }).__store__ = useDotBoardStore
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster richColors position="top-right" />
  </StrictMode>,
)
