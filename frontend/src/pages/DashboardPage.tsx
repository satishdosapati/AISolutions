/**
 * Dashboard Page Component
 * 
 * Comprehensive dashboard with solution management, templates, and analytics
 */

import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { 
  BarChart3, 
  Clock, 
  Search, 
  Eye, 
  Trash2, 
  TrendingUp,
  Archive,
  Layout
} from 'lucide-react'
import { 
  listSolutions, 
  listTemplates, 
  getDashboardStats, 
  deleteSolution,
  SolutionData,
  Template as TemplateType,
  DashboardStats
} from '../services/api'

interface DashboardContext {
  requirements: string
  setRequirements: (value: string) => void
}

const Dashboard: React.FC = () => {
  const { setRequirements } = useOutletContext<DashboardContext>()
  
  const [solutions, setSolutions] = useState<SolutionData[]>([])
  const [templates, setTemplates] = useState<TemplateType[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'solutions' | 'templates' | 'analytics'>('solutions')

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [solutionsData, templatesData, statsData] = await Promise.all([
          listSolutions(),
          listTemplates(),
          getDashboardStats()
        ])
        
        setSolutions(solutionsData.solutions)
        setTemplates(templatesData.templates)
        setStats(statsData)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Handle using a template
  const handleUseTemplate = (template: TemplateType) => {
    setRequirements(template.description)
    // Navigate to generator page
    window.location.href = '/'
  }

  // Handle viewing a solution
  const handleViewSolution = (solution: SolutionData) => {
    // Load solution data and navigate to generator
    setRequirements(solution.metadata.description)
    window.location.href = '/'
  }

  // Handle deleting a solution
  const handleDeleteSolution = async (solutionId: string) => {
    if (window.confirm('Are you sure you want to delete this solution?')) {
      try {
        await deleteSolution(solutionId)
        setSolutions(solutions.filter(s => s.metadata.id !== solutionId))
      } catch (error) {
        console.error('Failed to delete solution:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="w-full h-[calc(100vh-80px)] flex">
      {/* Left Panel - Navigation & Stats */}
      <div className="w-2/5 bg-slate-800 border-r border-slate-700 p-6 flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-100 mb-2">
            AWS Architecture Dashboard
          </h1>
          <p className="text-slate-400 text-sm">
            Manage your solutions, explore templates, and track your AWS architecture journey.
          </p>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="space-y-4 mb-6">
            <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Solutions</p>
                  <p className="text-2xl font-bold text-white">{stats.total_solutions}</p>
                </div>
                <Archive className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Templates</p>
                  <p className="text-2xl font-bold text-white">{templates.length}</p>
                </div>
                <Layout className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-slate-700 rounded-lg border border-slate-600 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Popular Tags</p>
                  <p className="text-2xl font-bold text-white">{stats.popular_tags.length}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="space-y-2">
          {[
            { id: 'solutions' as const, label: 'My Solutions', icon: Archive },
            { id: 'templates' as const, label: 'Templates', icon: Layout },
            { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'text-blue-400 bg-blue-400/20 border border-blue-400/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Right Panel - Main Content */}
      <div className="w-3/5 bg-slate-900 flex flex-col">
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Solutions Tab */}
          {activeTab === 'solutions' && (
            <div className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search solutions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Solutions Grid */}
              <div className="grid gap-4">
                {solutions
                  .filter(solution => 
                    solution.metadata.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    solution.metadata.description.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((solution) => (
                    <div key={solution.metadata.id} className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">{solution.metadata.title}</h3>
                          <p className="text-slate-400 text-sm mb-3 line-clamp-2">{solution.metadata.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(solution.metadata.created_at).toLocaleDateString()}
                            </span>
                            {solution.metadata.tags && solution.metadata.tags.length > 0 && (
                              <span>{solution.metadata.tags.join(', ')}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleViewSolution(solution)}
                            className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSolution(solution.metadata.id)}
                            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="grid gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
                        <p className="text-slate-400 text-sm mb-3">{template.description}</p>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-blue-400/20 text-blue-400 text-xs rounded-full">
                            {template.category}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUseTemplate(template)}
                        className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Use Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid gap-6">
                {/* Recent Solutions */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Solutions</h3>
                  <div className="space-y-3">
                    {stats?.recent_solutions.slice(0, 5).map((solution) => (
                      <div key={solution.metadata.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm">{solution.metadata.title}</p>
                          <p className="text-slate-400 text-xs">
                            {new Date(solution.metadata.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-xs text-slate-500">
                          {solution.metadata.tags?.join(', ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular Tags */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {stats?.popular_tags.map((tag, index) => (
                      <span key={`${tag}-${index}`} className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard