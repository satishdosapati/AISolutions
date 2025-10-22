/**
 * ObservabilityPage Component
 * 
 * Simple page that displays real-time backend logs.
 * Shows the last 100 log entries with live updates and filtering.
 */

import React, { useState, useEffect, useMemo } from 'react'
import { Activity, RefreshCw, Trash2, Filter } from 'lucide-react'
import { getEvents, ObservabilityEvent } from '../services/api'

type LogLevel = 'all' | 'error' | 'warning' | 'success' | 'info'

const ObservabilityPage: React.FC = () => {
  const [logs, setLogs] = useState<ObservabilityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [logLevel, setLogLevel] = useState<LogLevel>('all')

  // Load logs from backend
  const loadLogs = async () => {
    try {
      setError(null)
      const response = await getEvents(100)
      
      // Deduplicate logs by message and timestamp
      const uniqueLogs = response.events.filter((log, index, self) => 
        index === self.findIndex((l) => 
          l.message === log.message && l.timestamp === log.timestamp
        )
      )
      
      setLogs(uniqueLogs)
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

  // Determine log level from message
  const getLogLevel = (message: string): LogLevel => {
    const msg = message.toLowerCase()
    if (msg.includes('error') || msg.includes('failed') || msg.includes('❌')) {
      return 'error'
    } else if (msg.includes('warning') || msg.includes('warn') || msg.includes('⚠️')) {
      return 'warning'
    } else if (msg.includes('success') || msg.includes('completed') || msg.includes('✅')) {
      return 'success'
    } else if (msg.includes('info:')) {
      return 'info'
    }
    return 'info'
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

  // Filter logs by selected level
  const filteredLogs = useMemo(() => {
    if (logLevel === 'all') return logs
    return logs.filter(log => getLogLevel(log.message) === logLevel)
  }, [logs, logLevel])

  // Count logs by level
  const logCounts = useMemo(() => {
    return {
      all: logs.length,
      error: logs.filter(log => getLogLevel(log.message) === 'error').length,
      warning: logs.filter(log => getLogLevel(log.message) === 'warning').length,
      success: logs.filter(log => getLogLevel(log.message) === 'success').length,
      info: logs.filter(log => getLogLevel(log.message) === 'info').length,
    }
  }, [logs])

  return (
    <div className="w-full h-[calc(100vh-80px)] flex">
      {/* Left Panel - Controls & Stats */}
      <div className="w-2/5 bg-slate-800 border-r border-slate-700 p-6 flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <Activity className="h-6 w-6 text-blue-400" />
            <h1 className="text-xl font-bold text-slate-100">Backend Logs</h1>
          </div>
          <p className="text-slate-400 text-sm">
            Real-time backend application logs from systemd journal
          </p>
        </div>

        {/* Controls */}
        <div className="space-y-4 mb-6">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`w-full flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
              autoRefresh 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span className="text-sm">{autoRefresh ? 'Auto-Refresh: ON' : 'Auto-Refresh: OFF'}</span>
          </button>

          <button
            onClick={loadLogs}
            disabled={loading}
            className="w-full flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh Now</span>
          </button>

          <button
            onClick={() => setLogs([])}
            className="w-full flex items-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-sm">Clear Logs</span>
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Filter by Level:</span>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => setLogLevel('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                logLevel === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              <span>All</span>
              <span className="text-xs">({logCounts.all})</span>
            </button>
            <button
              onClick={() => setLogLevel('error')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                logLevel === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              <span>🔴 Errors</span>
              <span className="text-xs">({logCounts.error})</span>
            </button>
            <button
              onClick={() => setLogLevel('warning')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                logLevel === 'warning'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              <span>🟡 Warnings</span>
              <span className="text-xs">({logCounts.warning})</span>
            </button>
            <button
              onClick={() => setLogLevel('success')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                logLevel === 'success'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              <span>🟢 Success</span>
              <span className="text-xs">({logCounts.success})</span>
            </button>
            <button
              onClick={() => setLogLevel('info')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                logLevel === 'info'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              <span>ℹ️ Info</span>
              <span className="text-xs">({logCounts.info})</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-slate-700 rounded-lg border border-slate-600 p-4 mt-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Showing:</span>
              <span className="text-white font-semibold">{filteredLogs.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total:</span>
              <span className="text-white font-semibold">{logs.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className={`font-semibold ${autoRefresh ? 'text-green-400' : 'text-yellow-400'}`}>
                {autoRefresh ? 'Live' : 'Paused'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Logs Display */}
      <div className="w-3/5 bg-slate-900 flex flex-col">
        <div className="p-4 border-b border-slate-700 bg-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-sm text-slate-400 ml-2">aws-agentic-backend.service</span>
            </div>
            <div className="text-xs text-slate-500">
              Filter: {logLevel === 'all' ? 'All Levels' : logLevel.charAt(0).toUpperCase() + logLevel.slice(1)}
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-black p-4">
          {/* Error State */}
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {loading && logs.length === 0 ? (
            <div className="text-green-400 font-mono text-sm">
              <RefreshCw className="h-4 w-4 inline animate-spin mr-2" />
              <span>Loading logs...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-slate-500 font-mono text-sm">
              <span className="text-slate-600">$</span> No logs matching filter "{logLevel}"
            </div>
          ) : (
            <div className="font-mono text-sm space-y-0.5">
              {filteredLogs.map((log, index) => (
                <div
                  key={`${log.id}-${index}`}
                  className="hover:bg-slate-900/30 py-1"
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

