/**
 * EventCard Component
 * 
 * Individual event display card with expandable metadata.
 * Shows timestamp, type tag, message, and detailed information.
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Clock, Info } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ObservabilityEvent } from '../../services/mockEventStream'
import { EventTag } from './EventTag'

interface EventCardProps {
  event: ObservabilityEvent
  index: number
}

export const EventCard: React.FC<EventCardProps> = ({ event, index }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return 'Just now'
    }
  }

  const formatMetadata = (metadata: Record<string, any>) => {
    return Object.entries(metadata).map(([key, value]) => (
      <div key={key} className="flex justify-between py-1">
        <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
        <span className="text-slate-200 font-mono text-sm">
          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
        </span>
      </div>
    ))
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.05,
        ease: "easeOut"
      }}
      className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-3 hover:border-slate-600 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <EventTag type={event.type} />
          <div className="flex items-center text-slate-400 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            {formatTimestamp(event.timestamp)}
          </div>
        </div>
        
        {event.metadata && (
          <button
            onClick={toggleExpanded}
            className="flex items-center text-slate-400 hover:text-slate-200 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Message */}
      <div className="mt-3">
        <p className="text-slate-100 leading-relaxed">{event.message}</p>
      </div>

      {/* Expandable Metadata */}
      <AnimatePresence>
        {isExpanded && event.metadata && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-slate-700">
              <div className="flex items-center mb-3">
                <Info className="h-4 w-4 text-slate-400 mr-2" />
                <span className="text-slate-400 text-sm font-medium">Event Details</span>
              </div>
              <div className="space-y-1">
                {formatMetadata(event.metadata)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
