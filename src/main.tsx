import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global delegated pointer-follow for native buttons
document.addEventListener('mousemove', (e) => {
  const target = e.target as HTMLElement | null
  if (!target) return
  const btn = target.closest('button:not([data-pf-button])') as HTMLElement | null
  if (!btn) return
  const rect = btn.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  btn.style.setProperty('--x', `${x}px`)
  btn.style.setProperty('--y', `${y}px`)
})

createRoot(document.getElementById("root")!).render(<App />);
