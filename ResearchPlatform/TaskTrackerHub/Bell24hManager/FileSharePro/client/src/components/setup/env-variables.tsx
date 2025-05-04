import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Check, Plus } from "lucide-react";

interface EnvVariable {
  key: string;
  value: string;
}

interface EnvVariablesProps {
  disabled: boolean;
  addTerminalCommand: (command: string) => void;
  addTerminalOutput: (output: string[]) => void;
  onComplete: () => void;
}

export function EnvVariables({
  disabled,
  addTerminalCommand,
  addTerminalOutput,
  onComplete,
}: EnvVariablesProps) {
  const [envVariables, setEnvVariables] = useState<EnvVariable[]>([
    { key: "PORT", value: "5000" },
    { key: "DATABASE_URL", value: "postgresql://..." },
    { key: "KOTAK_API_KEY", value: "your-api-key" },
    { key: "RAZORPAY_KEY_ID", value: "rzp_test_..." },
  ]);
  
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  const handleConfigure = () => {
    setIsConfiguring(true);
    
    // Add terminal command
    addTerminalCommand("ls -la ~/.env");
    addTerminalOutput([
      "ls: cannot access '~/.env': No such file or directory"
    ]);
    
    // Create env file
    setTimeout(() => {
      addTerminalCommand("touch .env");
      
      // Add env vars to file
      setTimeout(() => {
        const envCommands = envVariables.map(v => `echo '${v.key}=${v.value}' >> .env`);
        envCommands.forEach((cmd, index) => {
          setTimeout(() => {
            addTerminalCommand(cmd);
          }, index * 200);
        });
        
        // Show env file
        setTimeout(() => {
          addTerminalCommand("cat .env");
          addTerminalOutput(envVariables.map(v => `${v.key}=${v.value}`));
          
          // Set up secrets in Replit
          setTimeout(() => {
            addTerminalCommand("# Setting up Replit Secrets");
            
            const secretCommands = envVariables.map(v => `# Added secret: ${v.key}`);
            secretCommands.forEach((cmd, index) => {
              setTimeout(() => {
                addTerminalOutput([cmd]);
              }, index * 200);
            });
            
            // Complete configuration
            setTimeout(() => {
              addTerminalOutput(["All environment variables configured successfully."]);
              
              setIsConfiguring(false);
              setIsConfigured(true);
              
              // Complete this step
              setTimeout(() => {
                onComplete();
              }, 1000);
            }, secretCommands.length * 200 + 500);
          }, 1000);
        }, envCommands.length * 200 + 500);
      }, 500);
    }, 500);
  };

  return (
    <div className="mt-4">
      <Alert variant="warning" className="bg-warning-50 text-warning-700 border-warning-200 mb-4">
        <AlertTriangle className="h-4 w-4 text-warning-500" />
        <AlertDescription>
          Some environment variables detected in your project need configuration.
        </AlertDescription>
      </Alert>
      
      {isConfigured && (
        <Alert className="bg-success-50 text-success-700 border-success-200 mb-4">
          <Check className="h-4 w-4 text-success-500" />
          <AlertDescription>
            Environment variables configured successfully!
          </AlertDescription>
        </Alert>
      )}
      
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-secondary-900">Required Environment Variables</h4>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs"
            disabled={disabled || isConfiguring || isConfigured}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add New Secret
          </Button>
        </div>
        
        <div className="mt-2 border border-secondary-200 rounded-md">
          <Table>
            <TableHeader className="bg-secondary-50">
              <TableRow>
                <TableHead className="w-[40%]">Key</TableHead>
                <TableHead className="w-[50%]">Value</TableHead>
                <TableHead className="w-[10%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {envVariables.map((variable) => (
                <TableRow key={variable.key}>
                  <TableCell className="font-medium">{variable.key}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span>••••••</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 text-primary-600 hover:text-primary-900"
                      disabled={disabled || isConfiguring || isConfigured}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button
          onClick={handleConfigure}
          disabled={disabled || isConfiguring || isConfigured}
        >
          {isConfiguring ? "Configuring..." : isConfigured ? "Configured" : "Configure Environment Variables"}
        </Button>
      </div>
    </div>
  );
}
