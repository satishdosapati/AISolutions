/**
 * AWS Agentic Web UI - Main Application Component
 * 
 * Phase 5: Refactored into clean, modular components with enhanced features
 * Now wrapped with AppLayout for navigation
 */

import React, { useState } from 'react'
import { AppLayout } from './components/AppLayout'
import { InputPanel } from './components/InputPanel'
import { LoadingSpinner } from './components/LoadingSpinner'
import { ErrorAlert } from './components/ErrorAlert'
import { OutputPanel } from './components/OutputPanel'
import { generateArchitecture } from './services/api'

interface ArchitectureData {
  cfTemplate: string
  pricing: {
    totalMonthly: number
    currency: string
    region: string
    breakdown: Array<{
      service: string
      cost: number
      type?: string
      description?: string
      specifications?: Record<string, any>
    }>
    annual?: number
    raw?: any
  }
  diagramUrl: string
}

function App() {
  const [requirements, setRequirements] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ArchitectureData | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!requirements.trim()) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await generateArchitecture(requirements)
      setResult(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate architecture')
    } finally {
      setLoading(false)
    }
  }

  const handleDismissError = () => {
    setError('')
  }

  return (
    <AppLayout>
      <div>
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">AWS Agentic Architecture Generator</h1>
          <p className="text-slate-400">Generate CloudFormation templates, pricing estimates, and architecture diagrams using AI</p>
        </header>

        <InputPanel
          requirements={requirements}
          setRequirements={setRequirements}
          onSubmit={handleSubmit}
          loading={loading}
        />

        {error && (
          <ErrorAlert error={error} onDismiss={handleDismissError} />
        )}

        {loading && <LoadingSpinner />}

        {result && <OutputPanel data={result} />}
      </div>
    </AppLayout>
  )
}

export default App