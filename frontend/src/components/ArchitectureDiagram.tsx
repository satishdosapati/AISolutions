import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Download, ZoomIn, ZoomOut } from "lucide-react";

export default function ArchitectureDiagram() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Architecture Visualization</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <Card className="p-8 bg-muted/30 min-h-96 flex items-center justify-center">
        <div className="text-center space-y-4">
          <svg
            className="mx-auto h-32 w-32 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-muted-foreground">
            Architecture diagram will be generated based on CloudFormation template
          </p>
        </div>
      </Card>
    </div>
  );
}
