/**
 * LoadingSpinner Component
 * 
 * Enhanced loading animation with progress indicators and cancel functionality
 */

import React from 'react'
import { Loader2, Cloud, DollarSign, Image as ImageIcon, Zap, X } from 'lucide-react'

interface LoadingSpinnerProps {
  progress?: number
  message?: string
  onCancel?: () => void
  showCancel?: boolean
  compact?: boolean
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  progress = 0, 
  message = "AI agent is creating your AWS infrastructure...",
  onCancel,
  showCancel = true,
  compact = false
}) => {
  const steps = [
    { id: 'init', label: 'Initializing', icon: Zap, completed: progress > 0 },
    { id: 'connect', label: 'Connecting to AWS', icon: Cloud, completed: progress > 25 },
    { id: 'generate', label: 'Generating Template', icon: Cloud, completed: progress > 50 },
    { id: 'pricing', label: 'Calculating Pricing', icon: DollarSign, completed: progress > 75 },
    { id: 'diagram', label: 'Creating Diagram', icon: ImageIcon, completed: progress > 90 }
  ]

  const currentStep = steps.find(step => !step.completed) || steps[steps.length - 1]

  if (compact) {
    return (
      <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 text-center">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <div className="text-sm text-slate-300">{message}</div>
          {progress > 0 && (
            <div className="text-xs text-slate-400">{Math.round(progress)}%</div>
          )}
          {showCancel && onCancel && (
            <button
              onClick={onCancel}
              className="ml-2 p-1 text-slate-400 hover:text-red-400 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Header with cancel button */}
        <div className="flex items-center justify-between w-full">
          <h3 className="text-lg font-semibold text-white">Generating Architecture</h3>
          {showCancel && onCancel && (
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>

        {/* Enhanced spinner with progress ring */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-600 rounded-full"></div>
          <div 
            className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-blue-500 animate-pulse" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Current step indicator */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-blue-400 mb-2">
            {React.createElement(currentStep.icon, { className: "h-5 w-5" })}
            <span className="font-medium">{currentStep.label}</span>
          </div>
          <p className="text-slate-300 text-sm">{message}</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = step.id === currentStep.id
            const isCompleted = step.completed
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
                  isCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : isActive 
                    ? 'border-blue-500 text-blue-500 bg-slate-800' 
                    : 'border-slate-600 text-slate-500'
                }`}>
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 transition-colors ${
                    step.completed ? 'bg-green-500' : 'bg-slate-600'
                  }`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Helpful tips */}
        <div className="text-center text-slate-400 text-xs max-w-md">
          <p>💡 <strong>Tip:</strong> Complex architectures may take 2-3 minutes to generate. 
          The AI agent is analyzing your requirements and creating production-ready infrastructure.</p>
        </div>
      </div>
    </div>
  )
}
