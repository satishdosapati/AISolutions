/**
 * PricingTab Component
 * 
 * Enhanced pricing display with better formatting and breakdown
 */

import React from 'react'
import { DollarSign, Info, AlertCircle } from 'lucide-react'

interface PricingTabProps {
  pricing: any
}

export const PricingTab: React.FC<PricingTabProps> = ({ pricing }) => {
  if (!pricing) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-400">No pricing information available</p>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: pricing.currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Cost Breakdown</h3>
        <p className="text-sm text-slate-400">
          Estimated monthly costs for {pricing.region || 'us-east-1'} region
        </p>
      </div>

      {/* Total Cost Card */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-300 text-sm font-medium">Total Monthly Cost</p>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(parseFloat(pricing.totalMonthlyCost) || 0)}
            </p>
          </div>
          <DollarSign className="w-12 h-12 text-blue-400" />
        </div>
        
        {pricing.annual && (
          <div className="mt-4 pt-4 border-t border-blue-500/30">
            <p className="text-blue-200 text-sm">
              Annual Estimate: <span className="font-semibold">{formatCurrency(pricing.annual)}</span>
            </p>
          </div>
        )}
      </div>

      {/* Service Breakdown */}
      {pricing.breakdown && Array.isArray(pricing.breakdown) && (
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-white">Service Breakdown</h4>
          
          <div className="space-y-3">
            {pricing.breakdown.map((service: any, index: number) => (
              <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-white">{service.service}</h5>
                      {service.type && (
                        <span className="px-2 py-1 text-xs bg-slate-600 text-slate-300 rounded-full">
                          {service.type}
                        </span>
                      )}
                    </div>
                    
                    {service.description && (
                      <p className="text-sm text-slate-400 mb-2">{service.description}</p>
                    )}
                    
                    {service.specifications && (
                      <div className="text-xs text-slate-500 space-y-1">
                        {Object.entries(service.specifications).map(([key, value]: [string, any]) => (
                          <div key={key} className="flex justify-between">
                            <span>{key}:</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="text-lg font-semibold text-white">
                      {formatCurrency(parseFloat(service.cost) || 0)}
                    </p>
                    <p className="text-xs text-slate-400">/month</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="bg-amber-900/20 border border-amber-500/50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-amber-300 font-medium text-sm mb-1">Cost Disclaimer</h4>
            <p className="text-amber-200 text-xs leading-relaxed">
              These are estimated costs based on current AWS pricing. Actual costs may vary based on usage patterns, 
              data transfer, and regional pricing differences. Monitor your AWS billing dashboard for actual costs.
            </p>
          </div>
        </div>
      </div>

      {/* Raw Pricing Data (if available) */}
      {pricing.raw && (
        <details className="bg-slate-700/30 rounded-lg">
          <summary className="p-4 cursor-pointer text-sm font-medium text-slate-300 hover:text-white">
            View Raw Pricing Data
          </summary>
          <div className="px-4 pb-4">
            <pre className="bg-slate-900 p-3 rounded text-xs text-slate-300 overflow-x-auto border border-slate-700">
              {JSON.stringify(pricing.raw, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  )
}
