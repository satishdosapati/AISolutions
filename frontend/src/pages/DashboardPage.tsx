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
  Plus, 
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
  isGenerating: boolean
  setIsGenerating: (value: boolean) => void
  error: string | null
  setError: (value: string | null) => void
  architectureData: any
  setArchitectureData: (value: any) => void
}

const Dashboard: React.FC = () => {
  const {
    setRequirements,
    setArchitectureData
  } = useOutletContext<DashboardContext>()
  
  const [solutions, setSolutions] = useState<SolutionData[]>([])
  const [templates, setTemplates] = useState<TemplateType[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'solutions' | 'templates' | 'analytics'>('solutions')

  // Load data on component mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [solutionsData, templatesData, statsData] = await Promise.all([
        listSolutions(searchTerm, selectedTags.join(','), 50),
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

  const handleDeleteSolution = async (solutionId: string) => {
    if (!confirm('Are you sure you want to delete this solution?')) return
    
    try {
      await deleteSolution(solutionId)
      await loadDashboardData() // Reload data
    } catch (error) {
      console.error('Failed to delete solution:', error)
    }
  }

  const handleUseTemplate = (template: TemplateType) => {
    setRequirements(template.requirements)
    // Navigate to generator page
    window.location.href = '/'
  }

  const handleViewSolution = (solution: SolutionData) => {
    setArchitectureData({
      cfTemplate: solution.cfTemplate,
      pricing: solution.pricing,
      diagramUrl: solution.diagramUrl
    })
    // Navigate to generator page to view results
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-100 mb-4">
          AWS Architecture Dashboard
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Manage your solutions, explore templates, and track your AWS architecture journey.
        </p>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Solutions</p>
                <p className="text-3xl font-bold text-white">{stats.total_solutions}</p>
              </div>
              <Archive className="w-12 h-12 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Templates Available</p>
                <p className="text-3xl font-bold text-white">{templates.length}</p>
              </div>
              <Layout className="w-12 h-12 text-green-400" />
            </div>
          </div>
          
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Popular Tags</p>
                <p className="text-3xl font-bold text-white">{stats.popular_tags.length}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-400" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-slate-800 rounded-lg border border-slate-700">
        <div className="flex border-b border-slate-700">
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
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-750'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-750'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Solutions Tab */}
          {activeTab === 'solutions' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search solutions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={loadDashboardData}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Search
                </button>
              </div>

              {/* Solutions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {solutions.map((solution) => (
                  <div key={solution.metadata.id} className="bg-slate-700 rounded-lg border border-slate-600 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {solution.metadata.title}
                        </h3>
                        <p className="text-slate-400 text-sm mb-3">
                          {solution.metadata.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {solution.metadata.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-slate-600 text-slate-300 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(solution.metadata.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewSolution(solution)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteSolution(solution.metadata.id)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {solutions.length === 0 && (
                <div className="text-center py-12">
                  <Archive className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">No solutions found</p>
                  <p className="text-slate-500 text-sm mt-2">Generate your first AWS architecture to get started</p>
                </div>
              )}
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((template) => (
                  <div key={template.id} className="bg-slate-700 rounded-lg border border-slate-600 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {template.name}
                          </h3>
                          <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                            {template.category}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mb-3">
                          {template.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {template.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-slate-600 text-slate-300 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-700 rounded-lg border border-slate-600 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Solutions</h3>
                  <div className="space-y-3">
                    {stats.recent_solutions.map((solution) => (
                      <div key={solution.metadata.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm font-medium">{solution.metadata.title}</p>
                          <p className="text-slate-400 text-xs">
                            {new Date(solution.metadata.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleViewSolution(solution)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs"
                        >
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-slate-700 rounded-lg border border-slate-600 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Popular Tags</h3>
                  <div className="space-y-2">
                    {stats.popular_tags.map(([tag, count]) => (
                      <div key={tag} className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm">{tag}</span>
                        <span className="text-blue-400 text-sm font-medium">{count}</span>
                      </div>
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
