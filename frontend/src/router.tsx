/**
 * Router Configuration for AWS Agentic Web UI
 * 
 * Routes:
 * - / : Main architecture generator
 * - /observability : Real-time observability dashboard
 */

import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import GeneratorPage from './pages/GeneratorPage'
import ObservabilityPage from './pages/ObservabilityPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <GeneratorPage />,
      },
      {
        path: 'observability',
        element: <ObservabilityPage />,
      },
    ],
  },
])

export default router
