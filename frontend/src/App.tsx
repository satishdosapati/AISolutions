/**
 * Main App Component with State Management
 * 
 * This component manages the shared state between Generator and Observability tabs.
 * State is preserved when switching between tabs.
 */

import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { InputPanel } from './components/InputPanel'
import { LoadingSpinner } from './components/LoadingSpinner'
import { ErrorAlert } from './components/ErrorAlert'
import { OutputPanel } from './components/OutputPanel'
import { generateArchitecture } from './services/api'

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

  const handleGenerate = async () => {
    if (!requirements.trim()) {
      setError('Please enter your AWS architecture requirements')
      return
    }

    setIsGenerating(true)
    setError(null)
    setArchitectureData(null)

    try {
      const response = await generateArchitecture(requirements)
      setArchitectureData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClear = () => {
    setRequirements('')
    setError(null)
    setArchitectureData(null)
  }

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