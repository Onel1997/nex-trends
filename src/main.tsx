import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

if (localStorage.getItem('nextrends_reduced_motion') === '1') {
  document.documentElement.classList.add('nex-reduced-motion')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
