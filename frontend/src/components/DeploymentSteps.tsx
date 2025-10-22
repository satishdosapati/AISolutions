import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

interface Step {
  title: string;
  description: string;
}

interface DeploymentStepsProps {
  steps: Step[];
}

export default function DeploymentSteps({ steps }: DeploymentStepsProps) {
  return (
    <div className="flex flex-col gap-4">
      {steps.map((step, index) => (
        <Card
          key={index}
          className="p-4 hover-elevate"
        >
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold">
                {index + 1}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
