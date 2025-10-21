/**
 * ErrorAlert Component
 * 
 * Displays error messages with clear styling
 */

import React from 'react'
import { AlertCircle, X } from 'lucide-react'

interface ErrorAlertProps {
  error: string
  onDismiss?: () => void
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onDismiss }) => {
  return (
    <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-8 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="font-medium text-red-400">Error</h3>
        <p className="text-red-300 text-sm mt-1">{error}</p>
        {error.includes('MCP servers') && (
          <div className="mt-3 p-3 bg-red-800/30 rounded border border-red-600/50">
            <p className="text-red-200 text-xs">
              <strong>Tip:</strong> Deploy to a Linux EC2 instance for best compatibility with MCP servers.
            </p>
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
