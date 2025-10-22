import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import InputSection from "../components/InputSection";
import SolutionTabs from "../components/SolutionTabs";

interface GenerateSolutionRequest {
  prompt: string;
  title?: string;
  tags?: string[];
}

interface GenerateSolutionResponse {
  solution: {
    id: string;
    title: string;
    description: string;
    cloudFormation: string | null;
    costEstimate: any;
    deploymentSteps: string | null;
    recommendations: string | null;
    architectureDiagram?: any;
    bedrockAnalysis?: any;
    source?: string;
  };
  usedFallback: boolean;
  message: string;
}

export default function Workspace() {
  const [solution, setSolution] = useState<any>(null);

  const generateMutation = useMutation<
    GenerateSolutionResponse,
    Error,
    GenerateSolutionRequest
  >({
    mutationFn: async (data: GenerateSolutionRequest) => {
      const response = await fetch("/api/solutions/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate solution");
      }
      
      return response.json();
    },
    onSuccess: (data: GenerateSolutionResponse) => {
      const { solution: sol } = data;

      const parsedCostEstimate = typeof sol.costEstimate === "string" 
        ? JSON.parse(sol.costEstimate)
        : sol.costEstimate;

      const costItems = parsedCostEstimate?.items || [];
      const total = parsedCostEstimate?.total || 0;

      const deploymentStepsArray =
        sol.deploymentSteps
          ?.split("\n")
          .filter((step: string) => step.trim())
          .map((step: string, index: number) => {
            const cleaned = step.replace(/^\d+\.\s*/, "").trim();
            const parts = cleaned.split(":");
            return {
              title: parts[0]?.trim() || `Step ${index + 1}`,
              description: parts.slice(1).join(":").trim() || cleaned,
            };
          }) || [];

      const recommendationsArray =
        sol.recommendations
          ?.split("\n")
          .filter((rec: string) => rec.trim() && rec.includes(":"))
          .map((rec: string) => {
            const parts = rec.split(":");
            const categoryPart = parts[0]?.trim().toLowerCase() || "";
            let category: "security" | "performance" | "cost" | "general" = "general";

            if (categoryPart.includes("security")) category = "security";
            else if (categoryPart.includes("performance")) category = "performance";
            else if (categoryPart.includes("cost")) category = "cost";

            return {
              category,
              title: parts[0]?.trim() || "Recommendation",
              description: parts.slice(1).join(":").trim() || rec,
            };
          }) || [];

      setSolution({
        id: sol.id,
        cloudFormation: sol.cloudFormation,
        costEstimate: costItems.length > 0 ? { total, items: costItems } : undefined,
        deploymentSteps: deploymentStepsArray.length > 0 ? deploymentStepsArray : undefined,
        recommendations: recommendationsArray.length > 0 ? recommendationsArray : undefined,
        architectureDiagram: sol.architectureDiagram || undefined,
        bedrockAnalysis: sol.bedrockAnalysis || undefined,
        source: sol.source || "unknown",
      });
    },
    onError: (error: Error) => {
      console.error("Generation failed:", error);
    },
  });

  const handleGenerate = async (prompt: string) => {
    generateMutation.mutate({
      prompt,
      title: `AWS Solution - ${new Date().toLocaleDateString()}`,
      tags: ["generated", "aws"],
    });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-2/5 border-r overflow-y-auto">
        <InputSection
          onGenerate={handleGenerate}
          isGenerating={generateMutation.isPending}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <SolutionTabs 
          cloudFormation={solution?.cloudFormation}
          costEstimate={solution?.costEstimate}
          deploymentSteps={solution?.deploymentSteps}
          recommendations={solution?.recommendations}
          architectureDiagram={solution?.architectureDiagram}
          bedrockAnalysis={solution?.bedrockAnalysis}
          source={solution?.source}
        />
      </div>
    </div>
  );
}
