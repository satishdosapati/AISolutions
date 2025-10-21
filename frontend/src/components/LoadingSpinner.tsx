/**
 * LoadingSpinner Component
 * 
 * Professional loading animation
 */

import React from 'react'
import { Loader2, Cloud, DollarSign, Image as ImageIcon } from 'lucide-react'

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-blue-400/20 rounded-full animate-pulse"></div>
        </div>
        
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Generating Architecture</h3>
          <p className="text-slate-400 text-sm">AI agent is creating your AWS infrastructure...</p>
        </div>
        
        <div className="flex space-x-4 text-slate-500">
          <div className="flex items-center space-x-2">
            <Cloud className="w-4 h-4" />
            <span className="text-xs">CloudFormation</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs">Pricing</span>
          </div>
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-4 h-4" />
            <span className="text-xs">Diagram</span>
          </div>
        </div>
      </div>
    </div>
  )
}
