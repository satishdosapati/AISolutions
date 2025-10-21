/**
 * SaveResultsButton Component
 * 
 * Downloads CloudFormation template and cost summary as a ZIP file
 */

import React, { useState } from 'react'
import { Download, FileText, DollarSign, Image as ImageIcon, Check } from 'lucide-react'
import JSZip from 'jszip'

interface SaveResultsButtonProps {
  data: {
    cfTemplate: string
    pricing: any
    diagramUrl: string
  }
}

export const SaveResultsButton: React.FC<SaveResultsButtonProps> = ({ data }) => {
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const handleSave = async () => {
    setDownloading(true)
    
    try {
      const zip = new JSZip()
      
      // Add CloudFormation template
      zip.file('cloudformation-template.yaml', data.cfTemplate)
      
      // Add pricing summary
      if (data.pricing) {
        const pricingSummary = {
          totalMonthly: data.pricing.totalMonthly,
          currency: data.pricing.currency || 'USD',
          region: data.pricing.region || 'us-east-1',
          breakdown: data.pricing.breakdown || [],
          generatedAt: new Date().toISOString()
        }
        
        zip.file('pricing-summary.json', JSON.stringify(pricingSummary, null, 2))
        
        // Also create a human-readable summary
        const humanSummary = `AWS Architecture Cost Summary
Generated: ${new Date().toLocaleDateString()}
Region: ${pricingSummary.region}
Currency: ${pricingSummary.currency}

Total Monthly Cost: $${pricingSummary.totalMonthly}

Service Breakdown:
${pricingSummary.breakdown.map((service: any) => 
  `- ${service.service}: $${service.cost}/month${service.description ? ` (${service.description})` : ''}`
).join('\n')}

Note: These are estimated costs. Actual costs may vary based on usage patterns.
`
        zip.file('cost-summary.txt', humanSummary)
      }
      
      // Add diagram if available
      if (data.diagramUrl) {
        try {
          const response = await fetch(data.diagramUrl)
          if (response.ok) {
            const blob = await response.blob()
            zip.file('architecture-diagram.png', blob)
          }
        } catch (error) {
          console.warn('Could not include diagram in ZIP:', error)
        }
      }
      
      // Add README
      const readme = `AWS Architecture Generation Results
Generated: ${new Date().toLocaleDateString()}

Files included:
- cloudformation-template.yaml: Complete CloudFormation template ready for deployment
- pricing-summary.json: Detailed cost breakdown in JSON format
- cost-summary.txt: Human-readable cost summary
- architecture-diagram.png: Visual architecture diagram (if available)

To deploy:
1. Open AWS CloudFormation console
2. Upload the cloudformation-template.yaml file
3. Review and deploy the stack

Cost estimates are based on current AWS pricing and may vary.
`
      zip.file('README.txt', readme)
      
      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `aws-architecture-${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setDownloaded(true)
      setTimeout(() => setDownloaded(false), 3000)
      
    } catch (error) {
      console.error('Error creating ZIP file:', error)
      alert('Failed to create download package. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <button
      onClick={handleSave}
      disabled={downloading}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
    >
      {downloading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Creating...
        </>
      ) : downloaded ? (
        <>
          <Check className="w-4 h-4" />
          Downloaded!
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Save Results
        </>
      )}
    </button>
  )
}
