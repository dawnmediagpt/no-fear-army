import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import EntrepreneurDetox from './detox/EntrepreneurDetox.jsx'

// /detox → The Entrepreneur's Detox. Everything else → the live Fear Detox (untouched).
const Root = window.location.pathname.startsWith('/detox') ? EntrepreneurDetox : App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
