/**
 * EventTag Component
 * 
 * Color-coded tags for different event types in the observability dashboard.
 * Provides visual identification of event categories.
 */

import React from 'react'
import { EventType } from '../../services/mockEventStream'

interface EventTagProps {
  type: EventType
  className?: string
}

const eventTypeConfig = {
  'agent_to_mcp': {
    label: 'Agent → MCP',
    className: 'bg-blue-500 text-white',
    icon: '🤖'
  },
  'mcp_response': {
    label: 'MCP Response',
    className: 'bg-green-500 text-white',
    icon: '📡'
  },
  'processing': {
    label: 'Processing',
    className: 'bg-yellow-500 text-black',
    icon: '⚙️'
  },
  'output': {
    label: 'Output',
    className: 'bg-purple-500 text-white',
    icon: '📤'
  },
  'error': {
    label: 'Error',
    className: 'bg-red-500 text-white',
    icon: '❌'
  }
}

export const EventTag: React.FC<EventTagProps> = ({ type, className = '' }) => {
  const config = eventTypeConfig[type]
  
  return (
    <span 
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.className} ${className}`}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  )
}
