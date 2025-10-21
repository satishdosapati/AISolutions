/**
 * CloudFormationTab Component
 * 
 * Displays CloudFormation template with syntax highlighting
 */

import React, { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, Download, Eye, EyeOff } from 'lucide-react'

interface CloudFormationTabProps {
  template: string
}

export const CloudFormationTab: React.FC<CloudFormationTabProps> = ({ template }) => {
  const [copied, setCopied] = useState(false)
  const [showRaw, setShowRaw] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(template)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([template], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cloudformation-template.yaml'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">CloudFormation Template</h3>
          <p className="text-sm text-slate-400">YAML template ready for deployment</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            {showRaw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showRaw ? 'Syntax Highlight' : 'Raw View'}
          </button>
          
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
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

      {/* Template Display */}
      <div className="relative">
        {showRaw ? (
          <pre className="bg-slate-900 p-4 rounded-lg text-sm text-slate-300 overflow-x-auto border border-slate-700">
            <code>{template}</code>
          </pre>
        ) : (
          <div className="rounded-lg border border-slate-700 overflow-hidden">
            <SyntaxHighlighter
              language="yaml"
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                background: '#0f172a',
                fontSize: '14px'
              }}
              showLineNumbers
              wrapLines
            >
              {template}
            </SyntaxHighlighter>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
        <p className="text-blue-300 text-sm">
          <strong>💡 Tip:</strong> Copy this template to deploy your infrastructure using AWS CloudFormation console or CLI.
        </p>
      </div>
    </div>
  )
}
