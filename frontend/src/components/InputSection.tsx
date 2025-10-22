import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Sparkles, Loader2 } from "lucide-react";

interface InputSectionProps {
  onGenerate?: (prompt: string) => void;
  isGenerating?: boolean;
}

const suggestions = [
  "3-tier web application",
  "Serverless API",
  "Data lake architecture",
  "CI/CD pipeline",
  "High-availability setup",
];

export default function InputSection({
  onGenerate,
  isGenerating = false,
}: InputSectionProps) {
  const [prompt, setPrompt] = useState("");

  const handleSuggestion = (suggestion: string) => {
    setPrompt((prev) => (prev ? `${prev} ${suggestion}` : suggestion));
  };

  const handleGenerate = () => {
    if (prompt.trim() && onGenerate) {
      onGenerate(prompt);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold">Generate AWS Solutions with AI</h2>
        <p className="text-sm text-muted-foreground">
          Describe your AWS use case and get CloudFormation templates, cost estimates, and architecture diagrams
        </p>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        <Textarea
          placeholder="Describe your AWS use case in detail. For example: 'I need a scalable web application with RDS database, auto-scaling EC2 instances, and CloudFront for content delivery...'"
          value={prompt}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
          className="min-h-40 resize-none text-base"
        />

        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">Quick suggestions:</span>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <Badge
                key={suggestion}
                variant="secondary"
                className="cursor-pointer hover-elevate"
                onClick={() => handleSuggestion(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {prompt.length} characters
          </span>
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating Solution...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Solution
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
