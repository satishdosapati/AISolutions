/**
 * Router Configuration for AWS Agentic Web UI
 * 
 * Routes:
 * - / : Main architecture generator
 * - /dashboard : Solution management dashboard
 * - /observability : Real-time observability dashboard
 */

import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import GeneratorPage from './pages/GeneratorPage'
import ObservabilityPage from './pages/ObservabilityPage'
import DashboardPage from './pages/DashboardPage'

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
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
    ],
  },
])

export default router
