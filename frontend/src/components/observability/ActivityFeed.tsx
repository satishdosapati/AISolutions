/**
 * ActivityFeed Component
 * 
 * Scrollable timeline container for displaying events.
 * Auto-scrolls to latest events with smooth animations.
 */

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, AlertCircle } from 'lucide-react'
import { ObservabilityEvent } from '../../services/mockEventStream'
import { EventCard } from './EventCard'

interface ActivityFeedProps {
  events: ObservabilityEvent[]
  isStreaming: boolean
  className?: string
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  events, 
  isStreaming, 
  className = '' 
}) => {
  const feedRef = useRef<HTMLDivElement>(null)
  const shouldAutoScroll = useRef(true)

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (shouldAutoScroll.current && feedRef.current) {
      const element = feedRef.current
      element.scrollTop = element.scrollHeight
    }
  }, [events])

  // Handle scroll events to determine if user is manually scrolling
  const handleScroll = () => {
    if (!feedRef.current) return
    
    const { scrollTop, scrollHeight, clientHeight } = feedRef.current
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10
    
    shouldAutoScroll.current = isAtBottom
  }

  // Empty state
  if (events.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-96 text-center ${className}`}>
        <Activity className="h-16 w-16 text-slate-600 mb-4" />
        <h3 className="text-xl font-semibold text-slate-300 mb-2">No Events Yet</h3>
        <p className="text-slate-500 max-w-md">
          {isStreaming 
            ? "Waiting for agent and MCP server activity..." 
            : "Start the event stream to see real-time activity"
          }
        </p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Activity className="h-6 w-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-slate-100">Activity Feed</h2>
          {isStreaming && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center text-green-400 text-sm"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              Live
            </motion.div>
          )}
        </div>
        
        <div className="text-sm text-slate-400">
          {events.length} event{events.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Events Container */}
      <div 
        ref={feedRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        <AnimatePresence>
          {events.map((event, index) => (
            <EventCard 
              key={event.id} 
              event={event} 
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Auto-scroll indicator */}
      {!shouldAutoScroll.current && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={() => {
            shouldAutoScroll.current = true
            if (feedRef.current) {
              feedRef.current.scrollTop = feedRef.current.scrollHeight
            }
          }}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors z-10"
        >
          <AlertCircle className="h-5 w-5" />
        </motion.button>
      )}
    </div>
  )
}
