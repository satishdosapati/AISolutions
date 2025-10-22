import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, AlertCircle } from "lucide-react";

interface CostItem {
  service: string;
  monthlyPrice: number;
  unit: string;
  isHighCost?: boolean;
}

interface CostEstimateProps {
  totalMonthly: number;
  items: CostItem[];
}

export default function CostEstimate({ totalMonthly, items }: CostEstimateProps) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated Monthly Cost</p>
              <p className="text-3xl font-bold">
                ${totalMonthly.toFixed(2)}
              </p>
            </div>
          </div>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Cost Breakdown</h3>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 text-sm font-semibold">Service</th>
                <th className="text-left p-3 text-sm font-semibold">Unit</th>
                <th className="text-right p-3 text-sm font-semibold">Monthly Cost</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={index}
                  className="border-t hover-elevate"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.service}</span>
                      {item.isHighCost && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          High Cost
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{item.unit}</td>
                  <td className="p-3 text-right font-mono font-semibold">
                    ${item.monthlyPrice.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
