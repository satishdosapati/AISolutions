/**
 * Mock Event Stream Service
 * 
 * Simulates real-time events from Strands agents and MCP servers.
 * Provides realistic event patterns for observability dashboard testing.
 */

export interface ObservabilityEvent {
  id: string
  type: 'agent_to_mcp' | 'mcp_response' | 'processing' | 'output' | 'error'
  timestamp: string
  message: string
  metadata?: Record<string, any>
}

export type EventType = ObservabilityEvent['type']

class MockEventStream {
  private listeners: Set<(event: ObservabilityEvent) => void> = new Set()
  private intervalId: NodeJS.Timeout | null = null
  private eventCounter = 0
  private isRunning = false

  // Event templates for realistic simulation
  private eventTemplates = {
    agent_to_mcp: [
      "Agent Alpha requested infrastructure setup details",
      "Agent Beta sent CloudFormation generation request",
      "Agent Gamma initiated pricing calculation",
      "Agent Delta requested diagram generation",
      "Agent Epsilon sent resource validation request",
      "Agent Zeta initiated cost optimization analysis"
    ],
    mcp_response: [
      "MCP Server 1 returned CloudFormation script",
      "MCP Server 2 provided pricing estimates",
      "MCP Server 3 generated architecture diagram",
      "MCP Server 1 validated resource configuration",
      "MCP Server 2 calculated cost breakdown",
      "MCP Server 3 returned optimization suggestions"
    ],
    processing: [
      "Merging CloudFormation templates",
      "Calculating total infrastructure costs",
      "Validating resource dependencies",
      "Optimizing configuration parameters",
      "Generating deployment scripts",
      "Finalizing architecture components"
    ],
    output: [
      "Architecture generation completed successfully",
      "CloudFormation template ready for deployment",
      "Pricing analysis finalized",
      "Architecture diagram generated",
      "Complete solution package prepared",
      "Results validated and optimized"
    ],
    error: [
      "MCP Server connection timeout",
      "Resource validation failed",
      "Pricing calculation error",
      "Template generation failed",
      "Diagram creation error",
      "Agent communication timeout"
    ]
  }

  private mcpServers = [
    "AWS CloudFormation MCP",
    "AWS Pricing MCP", 
    "AWS Diagram MCP",
    "AWS Resource MCP"
  ]

  private agents = [
    "Agent Alpha",
    "Agent Beta", 
    "Agent Gamma",
    "Agent Delta",
    "Agent Epsilon",
    "Agent Zeta"
  ]

  subscribe(listener: (event: ObservabilityEvent) => void): () => void {
    this.listeners.add(listener)
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  start(): void {
    if (this.isRunning) return
    
    this.isRunning = true
    console.log('🔄 Starting mock event stream...')
    
    // Generate events at random intervals (1-5 seconds)
    this.intervalId = setInterval(() => {
      this.generateEvent()
    }, Math.random() * 4000 + 1000)
  }

  stop(): void {
    if (!this.isRunning) return
    
    this.isRunning = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    console.log('⏹️ Mock event stream stopped')
  }

  private generateEvent(): void {
    const eventTypes: EventType[] = ['agent_to_mcp', 'mcp_response', 'processing', 'output', 'error']
    
    // Weighted probability for realistic flow
    const weights = {
      'agent_to_mcp': 0.3,
      'mcp_response': 0.25,
      'processing': 0.2,
      'output': 0.15,
      'error': 0.1
    }
    
    const type = this.weightedRandom(eventTypes, weights)
    const templates = this.eventTemplates[type]
    const message = templates[Math.floor(Math.random() * templates.length)]
    
    const event: ObservabilityEvent = {
      id: `event-${++this.eventCounter}`,
      type,
      timestamp: new Date().toISOString(),
      message,
      metadata: this.generateMetadata(type)
    }
    
    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in event listener:', error)
      }
    })
  }

  private generateMetadata(type: EventType): Record<string, any> {
    const baseMetadata: Record<string, any> = {
      duration: Math.floor(Math.random() * 2000 + 500), // 500-2500ms
      timestamp: Date.now()
    }

    switch (type) {
      case 'agent_to_mcp':
        return {
          ...baseMetadata,
          agent: this.agents[Math.floor(Math.random() * this.agents.length)],
          mcpServer: this.mcpServers[Math.floor(Math.random() * this.mcpServers.length)],
          requestId: `req-${Math.random().toString(36).substr(2, 9)}`
        }
      
      case 'mcp_response':
        return {
          ...baseMetadata,
          mcpServer: this.mcpServers[Math.floor(Math.random() * this.mcpServers.length)],
          responseSize: Math.floor(Math.random() * 50000 + 1000), // 1-51KB
          statusCode: Math.random() > 0.1 ? 200 : 500
        }
      
      case 'processing':
        return {
          ...baseMetadata,
          stage: ['validation', 'optimization', 'merging', 'finalization'][Math.floor(Math.random() * 4)],
          progress: Math.floor(Math.random() * 100)
        }
      
      case 'output':
        return {
          ...baseMetadata,
          outputSize: Math.floor(Math.random() * 100000 + 5000), // 5-105KB
          components: Math.floor(Math.random() * 20 + 5) // 5-25 components
        }
      
      case 'error':
        return {
          ...baseMetadata,
          errorCode: ['TIMEOUT', 'VALIDATION_ERROR', 'MCP_ERROR', 'AGENT_ERROR'][Math.floor(Math.random() * 4)],
          retryCount: Math.floor(Math.random() * 3)
        }
      
      default:
        return baseMetadata
    }
  }

  private weightedRandom<T>(items: T[], weights: Record<string, number>): T {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
    let random = Math.random() * totalWeight
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const weight = weights[item as string] || 0
      random -= weight
      if (random <= 0) {
        return item
      }
    }
    
    return items[items.length - 1]
  }

  // Generate a burst of events for testing
  generateBurst(count: number = 5): void {
    console.log(`🚀 Generating burst of ${count} events...`)
    for (let i = 0; i < count; i++) {
      setTimeout(() => this.generateEvent(), i * 200)
    }
  }

  // Clear all listeners and reset
  reset(): void {
    this.stop()
    this.listeners.clear()
    this.eventCounter = 0
  }
}

// Export singleton instance
export const mockEventStream = new MockEventStream()
