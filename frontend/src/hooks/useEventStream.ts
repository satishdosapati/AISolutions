/**
 * useEventStream Hook
 * 
 * Custom hook for consuming real backend logs as events.
 * Manages event state and provides filtering capabilities.
 * Now connects to real backend observability endpoints.
 */

import { useState, useEffect, useCallback } from 'react'
import { ObservabilityEvent, EventType, getEvents, streamEvents } from '../services/api'

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
  const [eventSource, setEventSource] = useState<EventSource | null>(null)

  // Filter events based on active filters
  const filteredEvents = events.filter(event => activeFilters.has(event.type))

  // Load initial events from backend
  const loadInitialEvents = useCallback(async () => {
    try {
      const response = await getEvents(maxEvents)
      setEvents(response.events)
    } catch (error) {
      console.error('Failed to load initial events:', error)
      // Fallback to empty array if backend is not available
      setEvents([])
    }
  }, [maxEvents])

  // Start real-time streaming
  const startStream = useCallback(() => {
    if (isStreaming) return
    
    try {
      const source = streamEvents()
      setEventSource(source)
      setIsStreaming(true)
      
      source.onmessage = (event) => {
        try {
          const newEvent: ObservabilityEvent = JSON.parse(event.data)
          setEvents(prevEvents => {
            const newEvents = [newEvent, ...prevEvents]
            // Keep only the most recent events (performance optimization)
            return newEvents.slice(0, maxEvents)
          })
        } catch (error) {
          console.error('Failed to parse event:', error)
        }
      }
      
      source.onerror = (error) => {
        console.error('EventSource error:', error)
        setIsStreaming(false)
        setEventSource(null)
      }
      
    } catch (error) {
      console.error('Failed to start event stream:', error)
      setIsStreaming(false)
    }
  }, [isStreaming, maxEvents])

  // Stop streaming
  const stopStream = useCallback(() => {
    if (eventSource) {
      eventSource.close()
      setEventSource(null)
    }
    setIsStreaming(false)
  }, [eventSource])

  // Clear all events
  const clearEvents = useCallback(() => {
    setEvents([])
  }, [])

  // Toggle filter
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

  // Set filters
  const setFilters = useCallback((filters: Set<EventType>) => {
    setActiveFilters(filters)
  }, [])

  // Generate burst (for testing - now just reloads from backend)
  const generateBurst = useCallback(async (count?: number) => {
    await loadInitialEvents()
  }, [loadInitialEvents])

  // Load initial events and start streaming on mount
  useEffect(() => {
    loadInitialEvents()
    
    if (autoStart) {
      startStream()
    }
    
    return () => {
      stopStream()
    }
  }, [loadInitialEvents, autoStart, startStream, stopStream])

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