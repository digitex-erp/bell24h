import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check } from "lucide-react";

interface RunApplicationProps {
  disabled: boolean;
  addTerminalCommand: (command: string) => void;
  addTerminalOutput: (output: string[]) => void;
  onComplete: () => void;
}

export function RunApplication({
  disabled,
  addTerminalCommand,
  addTerminalOutput,
  onComplete,
}: RunApplicationProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isRunningSuccess, setIsRunningSuccess] = useState(false);

  const replitContent = `run = "npm install && npm run dev"`;
  
  const handleRun = () => {
    setIsRunning(true);
    
    // Add terminal command for .replit file
    addTerminalCommand("cat > .replit");
    addTerminalOutput([replitContent]);
    
    // Add terminal command to run the app
    setTimeout(() => {
      addTerminalCommand("npm run dev");
      
      // Simulate app startup
      const startupSteps = [
        "> bell24h@1.0.0 dev",
        "> NODE_ENV=development tsx server/index.ts",
        "Preparing server...",
        "Connected to PostgreSQL database",
        "Connected to Redis cache server",
        "WebSocket server started on port 8000",
        "Loading API integrations:",
        "  - Kotak Securities API loaded",
        "  - KredX API loaded",
        "  - RazorpayX API loaded",
        "Initializing authentication providers:",
        "  - Google Login provider initialized",
        "  - JWT authentication configured",
        "Bell24h server is running on http://0.0.0.0:5000"
      ];
      
      let delay = 0;
      startupSteps.forEach((step, index) => {
        setTimeout(() => {
          addTerminalOutput([step]);
          
          // If it's the last step, mark as running
          if (index === startupSteps.length - 1) {
            setIsRunning(false);
            setIsRunningSuccess(true);
            
            // Complete this step
            setTimeout(() => {
              onComplete();
            }, 1000);
          }
        }, delay);
        
        // Increase delay for each step
        delay += 300;
      });
    }, 1000);
  };

  return (
    <div className="mt-4">
      {isRunningSuccess && (
        <Alert className="bg-success-50 text-success-700 border-success-200 mb-4">
          <Check className="h-4 w-4 text-success-500" />
          <AlertDescription>
            Bell24h application is running successfully at <a href="http://localhost:5000" className="font-medium underline">http://localhost:5000</a>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="bg-secondary-50 p-4 rounded-md">
        <h4 className="text-sm font-medium text-secondary-900">Configure Automatic Startup</h4>
        <div className="mt-2">
          <div className="text-sm text-secondary-700 mb-2">Add .replit file for automated startup:</div>
          <div className="bg-[#1E293B] text-[#E5E7EB] rounded-md p-4 font-mono text-sm overflow-x-auto">
            <pre>{replitContent}</pre>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button
          onClick={handleRun}
          disabled={disabled || isRunning || isRunningSuccess}
        >
          {isRunning ? "Starting..." : isRunningSuccess ? "Running" : "Run Application"}
        </Button>
      </div>
    </div>
  );
}
