/**
 * InputPanel Component
 * 
 * Handles user input for architecture requirements
 */

import React from 'react'
import { Loader2 } from 'lucide-react'

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
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 text-white">Architecture Requirements</h2>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="Describe your AWS architecture requirements (e.g., 'Create a 3-tier web app with ALB, auto-scaling EC2 instances, and RDS MySQL database')"
          className="w-full h-32 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={loading}
        />
        
        <button
          type="submit"
          disabled={loading || !requirements.trim()}
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
