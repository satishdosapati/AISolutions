/**
 * AppLayout Component
 * 
 * Shared layout wrapper with header navigation for all pages.
 * Provides consistent navigation between Generator and Observability pages.
 */

import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Activity, Zap, BarChart3 } from 'lucide-react'

interface AppLayoutProps {
  children: React.ReactNode
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation()
  
  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header Navigation */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Title */}
            <div className="flex items-center space-x-3">
              <Zap className="h-8 w-8 text-blue-400" />
              <h1 className="text-xl font-bold">AWS Agentic Builder</h1>
            </div>
            
            {/* Navigation Links */}
            <nav className="flex space-x-6">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive('/') 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Zap className="h-4 w-4" />
                <span>Generator</span>
              </Link>
              
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive('/dashboard') 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/observability"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive('/observability') 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Activity className="h-4 w-4" />
                <span>Observability</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="w-full px-4 py-8">
        {children}
      </main>
    </div>
  )
}
