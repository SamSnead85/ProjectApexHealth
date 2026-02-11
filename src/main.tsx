import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import './index.css'
import './styles/light-mode.css'
import './styles/premium-enhancements.css'
import './styles/animations.css'
import './styles/accessibility.css'
import './styles/enterprise.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>,
)
