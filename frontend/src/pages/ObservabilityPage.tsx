/**
 * ObservabilityPage Component
 * 
 * Main observability dashboard page that integrates all components.
 * Provides real-time monitoring of Strands agent and MCP server interactions.
 */

import React from 'react'
import { ActivityFeed } from '../components/observability/ActivityFeed'
import { FilterControls } from '../components/observability/FilterControls'
import { useEventStream } from '../hooks/useEventStream'
import { Activity, BarChart3, Settings } from 'lucide-react'

const ObservabilityPage: React.FC = () => {
  const {
    events,
    filteredEvents,
    activeFilters,
    isStreaming,
    startStream,
    stopStream,
    clearEvents,
    toggleFilter,
    generateBurst
  } = useEventStream({ maxEvents: 100, autoStart: true })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Activity className="h-8 w-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-slate-100">Observability Dashboard</h1>
        </div>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Real-time monitoring of Strands agent and MCP server interactions. 
          Watch the complete workflow from agent requests to final output generation.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <Activity className="h-6 w-6 text-blue-400" />
            <div>
              <p className="text-sm text-slate-400">Total Events</p>
              <p className="text-2xl font-bold text-slate-100">{events.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-green-400" />
            <div>
              <p className="text-sm text-slate-400">Filtered Events</p>
              <p className="text-2xl font-bold text-slate-100">{filteredEvents.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-yellow-400" />
            <div>
              <p className="text-sm text-slate-400">Stream Status</p>
              <p className={`text-lg font-bold ${isStreaming ? 'text-green-400' : 'text-red-400'}`}>
                {isStreaming ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <FilterControls
          activeFilters={activeFilters}
          onToggleFilter={toggleFilter}
          onClearEvents={clearEvents}
          onGenerateBurst={() => generateBurst(5)}
          isStreaming={isStreaming}
          onStartStream={startStream}
          onStopStream={stopStream}
        />
      </div>

      {/* Activity Feed */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <ActivityFeed events={filteredEvents} />
      </div>
    </div>
  )
}

export default ObservabilityPage