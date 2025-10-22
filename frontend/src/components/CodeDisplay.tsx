import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface CodeDisplayProps {
  code: string;
  language?: string;
}

export default function CodeDisplay({ code, language = "yaml" }: CodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-lg border bg-card overflow-hidden">
      <div className="absolute top-2 right-2 z-10">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
        <code className="text-foreground">{code}</code>
      </pre>
    </div>
  );
}
