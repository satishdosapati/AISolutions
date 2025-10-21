/**
 * OutputPanel Component
 * 
 * Displays architecture results in tabs with enhanced UI
 */

import React, { useState } from 'react'
import { Cloud, DollarSign, Image as ImageIcon } from 'lucide-react'
import { CloudFormationTab } from './CloudFormationTab'
import { PricingTab } from './PricingTab'
import { DiagramTab } from './DiagramTab'
import { SaveResultsButton } from './SaveResultsButton'

interface OutputPanelProps {
  data: {
    cfTemplate: string
    pricing: any
    diagramUrl: string
  } | null
}

export const OutputPanel: React.FC<OutputPanelProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'cloudformation' | 'pricing' | 'diagram'>('cloudformation')

  if (!data) return null

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
      {/* Header with Save Button */}
      <div className="flex items-center justify-between p-6 border-b border-slate-700">
        <h2 className="text-xl font-semibold text-white">Architecture Results</h2>
        <SaveResultsButton data={data} />
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
    </div>
  )
}
