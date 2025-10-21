/**
 * Router Configuration for AWS Agentic Web UI
 * 
 * Routes:
 * - / : Main architecture generator
 * - /observability : Real-time observability dashboard
 */

import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import ObservabilityPage from './pages/ObservabilityPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/observability',
    element: <ObservabilityPage />,
  },
])

export default router
