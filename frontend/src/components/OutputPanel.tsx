/**
 * OutputPanel Component
 * 
 * Displays architecture results in tabs with enhanced UI
 */

import React, { useState } from 'react'
import { Cloud, DollarSign, Image as ImageIcon, Save } from 'lucide-react'
import { CloudFormationTab } from './CloudFormationTab'
import { PricingTab } from './PricingTab'
import { DiagramTab } from './DiagramTab'
import { SaveResultsButton } from './SaveResultsButton'
import { saveSolution } from '../services/api'

interface OutputPanelProps {
  data: {
    cfTemplate: string
    pricing: any
    diagramUrl: string
    requirements?: string
  } | null
}

export const OutputPanel: React.FC<OutputPanelProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'cloudformation' | 'pricing' | 'diagram'>('cloudformation')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveTitle, setSaveTitle] = useState('')
  const [saveDescription, setSaveDescription] = useState('')
  const [saveTags, setSaveTags] = useState('')
  const [saving, setSaving] = useState(false)

  if (!data) return null

  const handleSaveSolution = async () => {
    if (!saveTitle.trim()) return
    
    try {
      setSaving(true)
      const tags = saveTags.split(',').map(tag => tag.trim()).filter(tag => tag)
      
      await saveSolution({
        title: saveTitle,
        description: saveDescription,
        tags,
        solution_data: data
      })
      
      setShowSaveDialog(false)
      setSaveTitle('')
      setSaveDescription('')
      setSaveTags('')
    } catch (error) {
      console.error('Failed to save solution:', error)
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    {
      id: 'cloudformation' as const,
      label: 'CloudFormation',
      icon: Cloud,
      count: data.cfTemplate ? 'Template' : null
    },
    {
      id: 'pricing' as const,
      label: 'Pricing',
      icon: DollarSign,
      count: data.pricing?.totalMonthly ? `$${data.pricing.totalMonthly}/mo` : null
    },
    {
      id: 'diagram' as const,
      label: 'Diagram',
      icon: ImageIcon,
      count: data.diagramUrl ? 'Ready' : null
    }
  ]

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700">
      {/* Header with Save Buttons */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700">
        <h2 className="text-xl font-semibold text-white">Architecture Results</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSaveDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Solution
          </button>
          <SaveResultsButton data={data} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-750'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-750'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.count && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  isActive 
                    ? 'bg-blue-400/20 text-blue-300' 
                    : 'bg-slate-600 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'cloudformation' && <CloudFormationTab template={data.cfTemplate} />}
        {activeTab === 'pricing' && <PricingTab pricing={data.pricing} />}
        {activeTab === 'diagram' && <DiagramTab diagramUrl={data.diagramUrl} />}
      </div>

      {/* Save Solution Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Save Solution</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="Enter solution title..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  placeholder="Enter solution description..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={saveTags}
                  onChange={(e) => setSaveTags(e.target.value)}
                  placeholder="Enter tags separated by commas..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleSaveSolution}
                disabled={!saveTitle.trim() || saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Solution
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
