/**
 * ObservabilityPage Component
 * 
 * Simple page that displays real-time backend logs.
 * Shows the last 100 log entries with live updates.
 */

import React, { useState, useEffect } from 'react'
import { Activity, RefreshCw, Trash2 } from 'lucide-react'
import { getEvents, ObservabilityEvent } from '../services/api'

const ObservabilityPage: React.FC = () => {
  const [logs, setLogs] = useState<ObservabilityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Load logs from backend
  const loadLogs = async () => {
    try {
      setError(null)
      const response = await getEvents(100)
      setLogs(response.events)
      setLoading(false)
    } catch (err) {
      console.error('Failed to load logs:', err)
      setError('Failed to load backend logs')
      setLoading(false)
    }
  }

  // Auto-refresh logs every 3 seconds
  useEffect(() => {
    loadLogs()

    if (autoRefresh) {
      const interval = setInterval(() => {
        loadLogs()
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  // Format timestamp
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(parseInt(timestamp) / 1000)
      return date.toLocaleTimeString()
    } catch {
      return timestamp
    }
  }

  // Get color based on log type/priority (terminal-style colors)
  const getLogColor = (log: ObservabilityEvent) => {
    const message = log.message.toLowerCase()
    
    if (message.includes('error') || message.includes('failed') || message.includes('❌')) {
      return 'text-red-400'
    } else if (message.includes('warning') || message.includes('warn') || message.includes('⚠️')) {
      return 'text-yellow-300'
    } else if (message.includes('success') || message.includes('completed') || message.includes('✅')) {
      return 'text-green-400'
    } else if (message.includes('info:') || message.includes('processing')) {
      return 'text-cyan-400'
    } else if (message.includes('🚀') || message.includes('🎬') || message.includes('🤖')) {
      return 'text-blue-300'
    } else if (message.includes('💰') || message.includes('📊') || message.includes('🔧')) {
      return 'text-purple-300'
    }
    return 'text-slate-400'
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Activity className="h-8 w-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-slate-100">Backend Logs</h1>
          </div>
          <p className="text-slate-400">
            Real-time backend application logs from systemd journal
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              autoRefresh 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>{autoRefresh ? 'Auto-Refresh: ON' : 'Auto-Refresh: OFF'}</span>
          </button>

          <button
            onClick={loadLogs}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Now</span>
          </button>

          <button
            onClick={() => setLogs([])}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Total Logs: <span className="text-slate-100 font-semibold">{logs.length}</span>
          </div>
          <div className="text-sm text-slate-400">
            Status: <span className={`font-semibold ${autoRefresh ? 'text-green-400' : 'text-yellow-400'}`}>
              {autoRefresh ? 'Live' : 'Paused'}
            </span>
          </div>
          <div className="text-sm text-slate-400">
            Last Updated: <span className="text-slate-100 font-semibold">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Terminal-style Logs Display */}
      <div className="bg-black border border-slate-700 rounded-lg overflow-hidden shadow-2xl">
        <div className="px-4 py-2 border-b border-slate-700 bg-slate-900 flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm text-slate-400 ml-2">aws-agentic-backend.service</span>
        </div>
        
        <div className="overflow-y-auto bg-black p-4" style={{ maxHeight: '600px' }}>
          {loading && logs.length === 0 ? (
            <div className="text-green-400 font-mono text-sm">
              <RefreshCw className="h-4 w-4 inline animate-spin mr-2" />
              <span>Loading logs...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-slate-500 font-mono text-sm">
              <span className="text-slate-600">$</span> No logs available
            </div>
          ) : (
            <div className="font-mono text-sm space-y-0.5">
              {logs.map((log, index) => (
                <div
                  key={log.id || index}
                  className="hover:bg-slate-900/30"
                >
                  <div className="flex items-start space-x-2">
                    <span className="text-slate-600 text-xs shrink-0 select-none">
                      [{formatTime(log.timestamp)}]
                    </span>
                    <span className={`${getLogColor(log)} leading-relaxed break-words`}>
                      {log.message}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ObservabilityPage
