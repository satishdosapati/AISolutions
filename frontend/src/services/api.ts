/**
 * API service for communicating with the backend
 * 
 * This service handles all HTTP requests to the FastAPI backend.
 * In Phase 4, this will connect to the real Strands agent integration.
 */

import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000, // 30 seconds timeout for agent processing
  headers: {
    'Content-Type': 'application/json',
  },
})

// API response types
export interface GenerateRequest {
  requirements: string
}

export interface GenerateResponse {
  success: boolean
  data: {
    cfTemplate: string
    pricing: {
      totalMonthlyCost: string
      breakdown: Array<{
        service: string
        cost: string
        unit: string
        details: string
      }>
      currency: string
      region: string
    }
    diagramUrl: string
  }
  message: string
}

/**
 * Generate architecture based on user requirements
 * 
 * @param requirements - User's AWS architecture requirements
 * @returns Promise with CloudFormation template, pricing, and diagram
 */
export const generateArchitecture = async (requirements: string): Promise<GenerateResponse> => {
  try {
    const response = await api.post<GenerateResponse>('/generate', {
      requirements,
    })
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to generate architecture')
    }
    
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle HTTP errors
      if (error.response) {
        throw new Error(error.response.data.detail || 'Server error occurred')
      } else if (error.request) {
        throw new Error('Unable to connect to the server. Please check if the backend is running.')
      }
    }
    
    // Handle other errors
    throw error instanceof Error ? error : new Error('An unexpected error occurred')
  }
}

/**
 * Health check endpoint
 */
export const healthCheck = async (): Promise<{ message: string; status: string }> => {
  const response = await api.get('/')
  return response.data
}

// Observability API types
export interface ObservabilityEvent {
  id: string
  type: 'agent_to_mcp' | 'mcp_response' | 'processing' | 'output' | 'error'
  timestamp: string
  message: string
  metadata?: Record<string, any>
}

export interface EventsResponse {
  events: ObservabilityEvent[]
  total: number
}

/**
 * Get recent backend logs as events
 */
export const getEvents = async (limit: number = 100): Promise<EventsResponse> => {
  try {
    const response = await api.get<EventsResponse>(`/events?limit=${limit}`)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch events')
    }
    throw error instanceof Error ? error : new Error('An unexpected error occurred')
  }
}

/**
 * Stream events in real-time using Server-Sent Events
 */
export const streamEvents = (): EventSource => {
  const baseURL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'
  return new EventSource(`${baseURL}/events/stream`)
}

// Async generation types
export interface TaskStartResponse {
  task_id: string
  message: string
}

export interface TaskStatus {
  task_id: string
  status: 'started' | 'generating_cf' | 'completed' | 'failed'
  progress: number
  message: string
  started_at: string
  completed_at: string | null
  data: any
  error: string | null
}

/**
 * Start architecture generation as a background task
 */
export const startGeneration = async (requirements: string): Promise<TaskStartResponse> => {
  try {
    const response = await api.post<TaskStartResponse>('/generate/start', { requirements })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Failed to start generation')
    }
    throw error instanceof Error ? error : new Error('An unexpected error occurred')
  }
}

/**
 * Check the status of a generation task
 */
export const getGenerationStatus = async (taskId: string): Promise<TaskStatus> => {
  try {
    const response = await api.get<TaskStatus>(`/generate/status/${taskId}`)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Failed to get task status')
    }
    throw error instanceof Error ? error : new Error('An unexpected error occurred')
  }
}
