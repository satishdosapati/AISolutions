/**
 * Generator Component
 * 
 * Main architecture generation interface.
 * Uses shared state from App component via Outlet context.
 * Now with async polling for long-running generation tasks.
 */

import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { InputPanel } from '../components/InputPanel'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorAlert } from '../components/ErrorAlert'
import { OutputPanel } from '../components/OutputPanel'
import { startGeneration, getGenerationStatus } from '../services/api'

interface GeneratorContext {
  requirements: string
  setRequirements: (value: string) => void
  isGenerating: boolean
  setIsGenerating: (value: boolean) => void
  error: string | null
  setError: (value: string | null) => void
  architectureData: any
  setArchitectureData: (value: any) => void
}

const Generator: React.FC = () => {
  const {
    requirements,
    setRequirements,
    isGenerating,
    setIsGenerating,
    error,
    setError,
    architectureData,
    setArchitectureData
  } = useOutletContext<GeneratorContext>()
  
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)

  // Poll for task status
  useEffect(() => {
    if (!currentTaskId || !isGenerating) {
      return
    }

    const pollInterval = setInterval(async () => {
      try {
        const status = await getGenerationStatus(currentTaskId)
        
        setProgress(status.progress)
        setProgressMessage(status.message)
        
        if (status.status === 'completed' && status.data) {
          setArchitectureData(status.data)
          setIsGenerating(false)
          setCurrentTaskId(null)
          clearInterval(pollInterval)
        } else if (status.status === 'failed') {
          setError(status.error || 'Generation failed')
          setIsGenerating(false)
          setCurrentTaskId(null)
          clearInterval(pollInterval)
        }
      } catch (err) {
        console.error('Failed to poll task status:', err)
        setError('Failed to check generation status')
        setIsGenerating(false)
        setCurrentTaskId(null)
        clearInterval(pollInterval)
      }
    }, 2000) // Poll every 2 seconds

    return () => clearInterval(pollInterval)
  }, [currentTaskId, isGenerating, setArchitectureData, setError, setIsGenerating])

  const handleGenerate = async () => {
    if (!requirements.trim()) {
      setError('Please enter your AWS architecture requirements')
      return
    }

    setIsGenerating(true)
    setError(null)
    setArchitectureData(null)
    setProgress(0)
    setProgressMessage('Starting generation...')

    try {
      // Start generation
      const response = await startGeneration(requirements)
      setCurrentTaskId(response.task_id)
      setProgressMessage(response.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setIsGenerating(false)
    }
  }

  return (
    <div className="w-full h-[calc(100vh-80px)] flex">
      {/* Left Panel - Input */}
      <div className="w-2/5 bg-slate-800 border-r border-slate-700 p-6 flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-100 mb-2">
            Generate AWS Solutions with AI
          </h1>
          <p className="text-slate-400 text-sm">
            Describe your AWS use case and get CloudFormation templates, cost estimates, and architecture diagrams.
          </p>
        </div>

        {/* Input Panel */}
        <div className="flex-1 flex flex-col">
          <InputPanel
            requirements={requirements}
            setRequirements={setRequirements}
            onSubmit={(e) => {
              e.preventDefault()
              handleGenerate()
            }}
            loading={isGenerating}
            compact={true}
          />
        </div>

        {/* Loading State with Progress */}
        {isGenerating && (
          <div className="mt-4">
            <LoadingSpinner 
              progress={progress}
              message={progressMessage}
              onCancel={() => {
                setIsGenerating(false)
                setCurrentTaskId(null)
                setProgress(0)
                setProgressMessage('')
                setError('Generation cancelled by user')
              }}
              showCancel={true}
              compact={true}
            />
          </div>
        )}

        {/* Error State */}
        {error && <ErrorAlert error={error} onDismiss={() => setError(null)} />}
      </div>

      {/* Right Panel - Output */}
      <div className="w-3/5 bg-slate-900 flex flex-col">
        {architectureData && !isGenerating ? (
          <OutputPanel data={architectureData} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-300 mb-2">
                Ready to Generate
              </h3>
              <p className="text-slate-500 max-w-md">
                Generate a solution to see CloudFormation template, cost estimates, and architecture diagrams.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Generator
