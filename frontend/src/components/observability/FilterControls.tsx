/**
 * FilterControls Component
 * 
 * Event filtering controls for the observability dashboard.
 * Allows filtering by event type and provides utility controls.
 */

import React from 'react'
import { motion } from 'framer-motion'
import { Filter, Trash2, Play, Square, Zap } from 'lucide-react'
import { EventType } from '../../services/mockEventStream'
import { EventTag } from './EventTag'

interface FilterControlsProps {
  activeFilters: Set<EventType>
  isStreaming: boolean
  eventCount: number
  onToggleFilter: (type: EventType) => void
  onClearEvents: () => void
  onStartStream: () => void
  onStopStream: () => void
  onGenerateBurst: () => void
  className?: string
}

const allEventTypes: EventType[] = ['agent_to_mcp', 'mcp_response', 'processing', 'output', 'error']

export const FilterControls: React.FC<FilterControlsProps> = ({
  activeFilters,
  isStreaming,
  eventCount,
  onToggleFilter,
  onClearEvents,
  onStartStream,
  onStopStream,
  onGenerateBurst,
  className = ''
}) => {
  const handleSelectAll = () => {
    allEventTypes.forEach(type => {
      if (!activeFilters.has(type)) {
        onToggleFilter(type)
      }
    })
  }

  const handleSelectNone = () => {
    allEventTypes.forEach(type => {
      if (activeFilters.has(type)) {
        onToggleFilter(type)
      }
    })
  }

  return (
    <div className={`bg-slate-800 border border-slate-700 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-100">Filters & Controls</h3>
        </div>
        <div className="text-sm text-slate-400">
          {eventCount} events
        </div>
      </div>

      {/* Event Type Filters */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-slate-300">Event Types</h4>
          <div className="flex space-x-2">
            <button
              onClick={handleSelectAll}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              All
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={handleSelectNone}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              None
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          {allEventTypes.map(type => (
            <motion.label
              key={type}
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-700 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={activeFilters.has(type)}
                onChange={() => onToggleFilter(type)}
                className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <EventTag type={type} />
            </motion.label>
          ))}
        </div>
      </div>

      {/* Stream Controls */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Stream Controls</h4>
        <div className="space-y-2">
          {isStreaming ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStopStream}
              className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              <Square className="h-4 w-4" />
              <span>Stop Stream</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartStream}
              className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors"
            >
              <Play className="h-4 w-4" />
              <span>Start Stream</span>
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onGenerateBurst}
            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
          >
            <Zap className="h-4 w-4" />
            <span>Generate Burst</span>
          </motion.button>
        </div>
      </div>

      {/* Utility Controls */}
      <div>
        <h4 className="text-sm font-medium text-slate-300 mb-3">Utilities</h4>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClearEvents}
          className="w-full flex items-center justify-center space-x-2 bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-md transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          <span>Clear Events</span>
        </motion.button>
      </div>
    </div>
  )
}
