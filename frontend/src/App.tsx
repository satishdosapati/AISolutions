/**
 * Main App Component with State Management
 * 
 * This component manages the shared state between Generator and Observability tabs.
 * State is preserved when switching between tabs.
 */

import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'

interface ArchitectureData {
  cfTemplate: string
  pricing: {
    totalMonthlyCost: string
    currency: string
    region: string
    breakdown: Array<{
      service: string
      cost: string
      unit: string
      details: string
    }>
    annual?: number
    raw?: any
  }
  diagramUrl: string
}

function App() {
  const [requirements, setRequirements] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [architectureData, setArchitectureData] = useState<ArchitectureData | null>(null)

  return (
    <AppLayout>
      <Outlet context={{
        requirements,
        setRequirements,
        isGenerating,
        setIsGenerating,
        error,
        setError,
        architectureData,
        setArchitectureData
      }} />
    </AppLayout>
  )
}

export default App