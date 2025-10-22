import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCode, DollarSign, List, Layout, Lightbulb, Network } from "lucide-react";
import CodeDisplay from "./CodeDisplay";
import CostEstimate from "./CostEstimate";
import DeploymentSteps from "./DeploymentSteps";
import ArchitectureDiagram from "./ArchitectureDiagram";
import Recommendations from "./Recommendations";

interface SolutionTabsProps {
  cloudFormation?: string;
  costEstimate?: {
    total: number;
    items: Array<{
      service: string;
      monthlyPrice: number;
      unit: string;
      isHighCost?: boolean;
    }>;
  };
  deploymentSteps?: Array<{
    title: string;
    description: string;
  }>;
  recommendations?: Array<{
    category: "security" | "performance" | "cost" | "general";
    title: string;
    description: string;
  }>;
  architectureDiagram?: any;
  bedrockAnalysis?: any;
  source?: string;
}

export default function SolutionTabs({
  cloudFormation,
  costEstimate,
  deploymentSteps,
  recommendations,
  architectureDiagram,
}: SolutionTabsProps) {
  return (
    <Tabs defaultValue="cloudformation" className="w-full">
      <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0">
        <TabsTrigger
          value="cloudformation"
          className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
        >
          <FileCode className="h-4 w-4" />
          CloudFormation
        </TabsTrigger>
        <TabsTrigger
          value="cost"
          className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
        >
          <DollarSign className="h-4 w-4" />
          Cost Estimate
        </TabsTrigger>
        <TabsTrigger
          value="deployment"
          className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
        >
          <List className="h-4 w-4" />
          Deployment
        </TabsTrigger>
        <TabsTrigger
          value="diagram"
          className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
        >
          <Layout className="h-4 w-4" />
          Diagram
        </TabsTrigger>
        <TabsTrigger
          value="architecture"
          className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
        >
          <Network className="h-4 w-4" />
          Architecture
        </TabsTrigger>
        <TabsTrigger
          value="recommendations"
          className="gap-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
        >
          <Lightbulb className="h-4 w-4" />
          Recommendations
        </TabsTrigger>
      </TabsList>

      <div className="p-6">
        <TabsContent value="cloudformation" className="mt-0">
          {cloudFormation ? (
            <CodeDisplay code={cloudFormation} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Generate a solution to see CloudFormation template
            </div>
          )}
        </TabsContent>

        <TabsContent value="cost" className="mt-0">
          {costEstimate ? (
            <CostEstimate totalMonthly={costEstimate.total} items={costEstimate.items} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Generate a solution to see cost estimates
            </div>
          )}
        </TabsContent>

        <TabsContent value="deployment" className="mt-0">
          {deploymentSteps ? (
            <DeploymentSteps steps={deploymentSteps} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Generate a solution to see deployment steps
            </div>
          )}
        </TabsContent>

        <TabsContent value="diagram" className="mt-0">
          <ArchitectureDiagram />
        </TabsContent>

        <TabsContent value="architecture" className="mt-0">
          {architectureDiagram ? (
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Architecture Overview</h3>
                <div className="space-y-3">
                  {architectureDiagram.components?.map((component: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <div className="font-medium">{component.tier}</div>
                        <div className="text-sm text-muted-foreground">
                          {component.services?.join(", ")} - {component.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {architectureDiagram.network_flow && (
                <div className="bg-card p-6 rounded-lg border">
                  <h4 className="font-semibold mb-3">Network Flow</h4>
                  <div className="space-y-2">
                    {architectureDiagram.network_flow.map((flow: string, index: number) => (
                      <div key={index} className="text-sm font-mono bg-muted p-2 rounded">
                        {flow}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {architectureDiagram.compliance_features && (
                <div className="bg-card p-6 rounded-lg border">
                  <h4 className="font-semibold mb-3">Compliance Features</h4>
                  <ul className="space-y-2">
                    {architectureDiagram.compliance_features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Generate a solution to see architecture details
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="mt-0">
          {recommendations ? (
            <Recommendations recommendations={recommendations} />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Generate a solution to see recommendations
            </div>
          )}
        </TabsContent>
      </div>
    </Tabs>
  );
}
