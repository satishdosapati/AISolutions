import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Lightbulb, Shield, Zap, DollarSign } from "lucide-react";

interface Recommendation {
  category: "security" | "performance" | "cost" | "general";
  title: string;
  description: string;
}

interface RecommendationsProps {
  recommendations: Recommendation[];
}

const categoryConfig = {
  security: { icon: Shield, label: "Security", color: "text-chart-3" },
  performance: { icon: Zap, label: "Performance", color: "text-chart-4" },
  cost: { icon: DollarSign, label: "Cost Optimization", color: "text-chart-1" },
  general: { icon: Lightbulb, label: "Best Practice", color: "text-chart-2" },
};

export default function Recommendations({ recommendations }: RecommendationsProps) {
  return (
    <div className="flex flex-col gap-4">
      {recommendations.map((rec, index) => {
        const config = categoryConfig[rec.category];
        const Icon = config.icon;

        return (
          <Card
            key={index}
            className="p-4 hover-elevate"
          >
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className={`p-2 rounded-lg bg-card ${config.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {config.label}
                  </Badge>
                  <h3 className="font-semibold">{rec.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
