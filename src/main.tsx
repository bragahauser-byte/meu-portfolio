import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Prévia do iPhone Duo aberto: um iframe chamado "duo-fold" (ou ?fold=1)
// simula a dobradiça no meio da tela. No aparelho isso vem da Viewport
// Segments API, sem parâmetro nenhum. window.name sobrevive à navegação
// dentro do iframe e não vaza para outras abas/iframes.
if (window.name === 'duo-fold' || new URLSearchParams(location.search).get('fold') === '1') {
  window.name = 'duo-fold'
  document.documentElement.dataset.fold = '1'
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)