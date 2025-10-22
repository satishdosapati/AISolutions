/**
 * InputPanel Component
 * 
 * Enhanced input panel with validation, character counter, and better UX
 */

import React, { useState, useEffect } from 'react'
import { Loader2, AlertCircle, CheckCircle, Info } from 'lucide-react'

interface InputPanelProps {
  requirements: string
  setRequirements: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
}

export const InputPanel: React.FC<InputPanelProps> = ({
  requirements,
  setRequirements,
  onSubmit,
  loading
}) => {
  const [validationMessage, setValidationMessage] = useState<string>('')
  const [isValid, setIsValid] = useState<boolean>(false)
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)

  const characterCount = requirements.length
  const minLength = 20
  const maxLength = 2000

  // Enhanced placeholder text with examples
  const placeholderText = `Describe your AWS architecture requirements...

Examples:
• "Create a 3-tier web application with load balancer, auto-scaling EC2 instances, and RDS MySQL database"
• "Build a microservices architecture with EKS, API Gateway, and DynamoDB"
• "Design a data analytics pipeline with S3, Lambda, and Redshift"
• "Set up a serverless application with API Gateway, Lambda, and DynamoDB"`

  // Validation logic
  useEffect(() => {
    if (characterCount === 0) {
      setValidationMessage('')
      setIsValid(false)
    } else if (characterCount < minLength) {
      setValidationMessage(`Please provide more details (minimum ${minLength} characters)`)
      setIsValid(false)
    } else if (characterCount > maxLength) {
      setValidationMessage(`Input too long (maximum ${maxLength} characters)`)
      setIsValid(false)
    } else {
      setValidationMessage('Ready to generate architecture')
      setIsValid(true)
    }
  }, [characterCount])

  // Common AWS service suggestions
  const suggestions = [
    'EC2 instances',
    'RDS database',
    'S3 storage',
    'Lambda functions',
    'API Gateway',
    'Load Balancer',
    'Auto Scaling',
    'CloudFront CDN',
    'DynamoDB',
    'SQS queues'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setRequirements(value)
    setShowSuggestions(value.length > 0 && !value.includes(' '))
  }

  const insertSuggestion = (suggestion: string) => {
    const words = requirements.split(' ')
    const lastWord = words[words.length - 1]
    const newValue = requirements.replace(new RegExp(`${lastWord}$`), suggestion)
    setRequirements(newValue + ' ')
    setShowSuggestions(false)
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Architecture Requirements</h2>
        <div className="flex items-center gap-2">
          {characterCount > 0 && (
            <span className={`text-sm ${
              isValid ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {characterCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={requirements}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(requirements.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholderText}
            className={`w-full h-40 px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors ${
              isValid ? 'border-green-500/50' : characterCount > 0 ? 'border-yellow-500/50' : 'border-slate-600'
            }`}
            disabled={loading}
          />
          
          {/* Suggestions dropdown */}
          {showSuggestions && requirements.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
              {suggestions
                .filter(suggestion => 
                  suggestion.toLowerCase().includes(requirements.toLowerCase()) ||
                  requirements.toLowerCase().includes(suggestion.toLowerCase())
                )
                .slice(0, 5)
                .map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => insertSuggestion(suggestion)}
                    className="w-full px-4 py-2 text-left text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                  >
                    {suggestion}
                  </button>
                ))
              }
            </div>
          )}
        </div>

        {/* Validation message */}
        {validationMessage && (
          <div className={`flex items-center gap-2 text-sm ${
            isValid ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {isValid ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{validationMessage}</span>
          </div>
        )}

        {/* Help text */}
        <div className="flex items-start gap-2 text-sm text-slate-400">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p>Be specific about your requirements. Include:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Application type (web app, API, data pipeline, etc.)</li>
              <li>Expected traffic and scaling needs</li>
              <li>Database and storage requirements</li>
              <li>Security and compliance needs</li>
            </ul>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading || !isValid}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Architecture'
          )}
        </button>
      </form>
    </div>
  )
}
