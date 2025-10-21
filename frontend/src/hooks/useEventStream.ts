/**
 * useEventStream Hook
 * 
 * Custom hook for consuming mock event stream data.
 * Manages event state and provides filtering capabilities.
 * Ready for real WebSocket integration later.
 */

import { useState, useEffect, useCallback } from 'react'
import { ObservabilityEvent, EventType, mockEventStream } from '../services/mockEventStream'

interface UseEventStreamOptions {
  maxEvents?: number
  autoStart?: boolean
}

interface UseEventStreamReturn {
  events: ObservabilityEvent[]
  filteredEvents: ObservabilityEvent[]
  activeFilters: Set<EventType>
  isStreaming: boolean
  startStream: () => void
  stopStream: () => void
  clearEvents: () => void
  toggleFilter: (type: EventType) => void
  setFilters: (filters: Set<EventType>) => void
  generateBurst: (count?: number) => void
}

export const useEventStream = (options: UseEventStreamOptions = {}): UseEventStreamReturn => {
  const { maxEvents = 100, autoStart = true } = options
  
  const [events, setEvents] = useState<ObservabilityEvent[]>([])
  const [activeFilters, setActiveFilters] = useState<Set<EventType>>(
    new Set(['agent_to_mcp', 'mcp_response', 'processing', 'output', 'error'])
  )
  const [isStreaming, setIsStreaming] = useState(false)

  // Filter events based on active filters
  const filteredEvents = events.filter(event => activeFilters.has(event.type))

  // Event handler for new events
  const handleNewEvent = useCallback((event: ObservabilityEvent) => {
    setEvents(prevEvents => {
      const newEvents = [event, ...prevEvents]
      // Keep only the most recent events (performance optimization)
      return newEvents.slice(0, maxEvents)
    })
  }, [maxEvents])

  // Start the event stream
  const startStream = useCallback(() => {
    if (isStreaming) return
    
    setIsStreaming(true)
    mockEventStream.start()
    
    // Subscribe to events
    const unsubscribe = mockEventStream.subscribe(handleNewEvent)
    
    // Store unsubscribe function for cleanup
    return unsubscribe
  }, [isStreaming, handleNewEvent])

  // Stop the event stream
  const stopStream = useCallback(() => {
    if (!isStreaming) return
    
    setIsStreaming(false)
    mockEventStream.stop()
  }, [isStreaming])

  // Clear all events
  const clearEvents = useCallback(() => {
    setEvents([])
  }, [])

  // Toggle a specific filter
  const toggleFilter = useCallback((type: EventType) => {
    setActiveFilters(prev => {
      const newFilters = new Set(prev)
      if (newFilters.has(type)) {
        newFilters.delete(type)
      } else {
        newFilters.add(type)
      }
      return newFilters
    })
  }, [])

  // Set all filters at once
  const setFilters = useCallback((filters: Set<EventType>) => {
    setActiveFilters(filters)
  }, [])

  // Generate a burst of events for testing
  const generateBurst = useCallback((count: number = 5) => {
    mockEventStream.generateBurst(count)
  }, [])

  // Auto-start stream on mount if enabled
  useEffect(() => {
    if (autoStart) {
      const unsubscribe = startStream()
      
      // Cleanup on unmount
      return () => {
        if (unsubscribe) {
          unsubscribe()
        }
        stopStream()
      }
    }
  }, [autoStart, startStream, stopStream])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream()
    }
  }, [stopStream])

  return {
    events,
    filteredEvents,
    activeFilters,
    isStreaming,
    startStream,
    stopStream,
    clearEvents,
    toggleFilter,
    setFilters,
    generateBurst
  }
}
