/**
 * DiagramTab Component
 * 
 * Displays architecture diagram with enhanced controls
 */

import React, { useState } from 'react'
import { Download, Maximize2, RotateCcw, AlertCircle, Image as ImageIcon } from 'lucide-react'

interface DiagramTabProps {
  diagramUrl: string
}

export const DiagramTab: React.FC<DiagramTabProps> = ({ diagramUrl }) => {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = diagramUrl
    link.download = 'architecture-diagram.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImageLoad = () => {
    setIsLoading(false)
    setImageError(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setImageError(true)
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setImageError(false)
    // Force image reload by adding timestamp
    const img = document.getElementById('architecture-diagram') as HTMLImageElement
    if (img) {
      const url = new URL(diagramUrl)
      url.searchParams.set('t', Date.now().toString())
      img.src = url.toString()
    }
  }

  if (!diagramUrl) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-400 text-lg">No diagram available</p>
        <p className="text-slate-500 text-sm mt-2">Architecture diagram will appear here when generated</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Architecture Diagram</h3>
          <p className="text-sm text-slate-400">Visual representation of your AWS infrastructure</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            title="Refresh diagram"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Diagram Display */}
      <div className="relative bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
              <p className="text-slate-400 text-sm">Loading diagram...</p>
            </div>
          </div>
        )}

        {imageError ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 text-lg mb-2">Failed to load diagram</p>
            <p className="text-slate-400 text-sm mb-4">The diagram image could not be displayed</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="relative">
            <img
              id="architecture-diagram"
              src={diagramUrl}
              alt="AWS Architecture Diagram"
              className="w-full h-auto max-w-full"
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ display: isLoading ? 'none' : 'block' }}
            />
            
            {/* Zoom overlay */}
            <button
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
              onClick={() => window.open(diagramUrl, '_blank')}
              title="Open in new tab"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
        <p className="text-green-300 text-sm">
          <strong>💡 Tip:</strong> Click the expand button to view the diagram in full size, or download it for documentation.
        </p>
      </div>
    </div>
  )
}
