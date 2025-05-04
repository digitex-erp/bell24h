import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Terminal } from "./terminal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check } from "lucide-react";

interface DependencyInstallerProps {
  disabled: boolean;
  addTerminalCommand: (command: string) => void;
  addTerminalOutput: (output: string[]) => void;
  onComplete: () => void;
}

export function DependencyInstaller({
  disabled,
  addTerminalCommand,
  addTerminalOutput,
  onComplete,
}: DependencyInstallerProps) {
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  
  const packageJson = `{
  "name": "bell24h",
  "version": "1.0.0",
  "type": "module",
  "license": "MIT",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js"
  },
  "dependencies": {
    "express": "^4.21.2",
    "ws": "^8.18.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "wouter": "^3.3.5",
    "@tanstack/react-query": "^5.60.5"
    // ... more dependencies
  }
}`;

  const handleInstall = () => {
    setIsInstalling(true);
    
    // Add terminal command
    addTerminalCommand("npm install");
    
    // Simulate npm install
    const installSteps = [
      "Preparing installation...",
      "added 254 packages, and audited 255 packages in 8s",
      "112 packages are looking for funding",
      "run `npm fund` for details",
      "found 0 vulnerabilities",
      "Installation complete!"
    ];
    
    let delay = 0;
    installSteps.forEach((step, index) => {
      setTimeout(() => {
        if (index === 0) {
          // Show detailed install progress for first few packages
          addTerminalOutput([
            step,
            "installing react@18.3.1...",
            "installing express@4.21.2...",
            "installing ws@8.18.0...",
            "installing react-dom@18.3.1...",
            "installing @tanstack/react-query@5.60.5..."
          ]);
        } else {
          addTerminalOutput([step]);
        }
        
        // If it's the last step, mark as installed
        if (index === installSteps.length - 1) {
          setIsInstalling(false);
          setIsInstalled(true);
          
          // Complete this step
          setTimeout(() => {
            onComplete();
          }, 1000);
        }
      }, delay);
      
      // Increase delay for each step
      delay += index === 0 ? 2000 : 1000;
    });
  };

  return (
    <div className="mt-4">
      {isInstalled && (
        <Alert className="bg-success-50 text-success-700 border-success-200 mb-4">
          <Check className="h-4 w-4 text-success-500" />
          <AlertDescription>
            Dependencies installed successfully!
          </AlertDescription>
        </Alert>
      )}
      
      <div className="text-sm font-medium text-secondary-700 mb-2">Package Dependencies:</div>
      <div className="bg-[#1E293B] text-[#E5E7EB] rounded-md p-4 font-mono text-sm overflow-x-auto">
        <pre>{packageJson}</pre>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button
          onClick={handleInstall}
          disabled={disabled || isInstalling || isInstalled}
        >
          {isInstalling ? "Installing..." : isInstalled ? "Installed" : "Install Dependencies"}
        </Button>
      </div>
    </div>
  );
}
