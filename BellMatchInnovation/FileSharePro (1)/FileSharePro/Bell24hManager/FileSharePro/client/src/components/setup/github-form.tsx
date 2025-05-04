import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Check } from "lucide-react";

interface GithubFormProps {
  disabled: boolean;
  addTerminalCommand: (command: string) => void;
  addTerminalOutput: (output: string[]) => void;
  onComplete: () => void;
}

export function GithubForm({
  disabled,
  addTerminalCommand,
  addTerminalOutput,
  onComplete,
}: GithubFormProps) {
  const [repoName, setRepoName] = useState("bell24h");
  const [repoVisibility, setRepoVisibility] = useState("private");
  const [repoDescription, setRepoDescription] = useState("AI-powered RFQ marketplace");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    
    // Add git init
    addTerminalCommand("git init");
    addTerminalOutput(["Initialized empty Git repository in /home/runner/bell24h/.git/"]);
    
    // Simulate GitHub connection
    setTimeout(() => {
      addTerminalCommand("git remote add origin https://github.com/yourusername/bell24h.git");
      
      // Add git status
      setTimeout(() => {
        addTerminalCommand("git status");
        addTerminalOutput([
          "On branch main",
          "No commits yet",
          "Untracked files:",
          "  (use \"git add <file>...\" to include in what will be committed)",
          "        README.md",
          "        package-lock.json",
          "        package.json",
          "        server.js",
          "        src/",
          "nothing added to commit but untracked files present (use \"git add\" to track)"
        ]);
        
        // Add files
        setTimeout(() => {
          addTerminalCommand("git add .");
          
          // Commit
          setTimeout(() => {
            addTerminalCommand("git commit -m \"Initial commit for Bell24h\"");
            addTerminalOutput([
              "[main (root-commit) f7d8a1b] Initial commit for Bell24h",
              " 25 files changed, 3659 insertions(+)",
              " create mode 100644 README.md",
              " create mode 100644 package-lock.json",
              " create mode 100644 package.json",
              " create mode 100644 server.js",
              " create mode 100644 src/app.js",
              " create mode 100644 src/websocket.js",
              " create mode 100644 src/api/kotak.js",
              " create mode 100644 src/api/kredx.js",
              " create mode 100644 src/api/razorpayx.js",
              " create mode 100644 src/db/postgres.js",
              " create mode 100644 src/db/redis.js",
              " create mode 100644 src/auth/google.js",
              " create mode 100644 src/auth/jwt.js",
              " create mode 100644 src/monitoring/prometheus.js",
              " create mode 100644 src/monitoring/grafana.js"
            ]);
            
            // Push
            setTimeout(() => {
              addTerminalCommand("git push -u origin main");
              addTerminalOutput([
                "Enumerating objects: 30, done.",
                "Counting objects: 100% (30/30), done.",
                "Delta compression using up to 4 threads",
                "Compressing objects: 100% (28/28), done.",
                "Writing objects: 100% (30/30), 32.45 KiB | 2.12 MiB/s, done.",
                "Total 30 (delta 2), reused 0 (delta 0)",
                "remote: Resolving deltas: 100% (2/2), done.",
                "To https://github.com/yourusername/bell24h.git",
                " * [new branch]      main -> main",
                "Branch 'main' set up to track remote branch 'main' from 'origin'."
              ]);
              
              setIsConnecting(false);
              setIsConnected(true);
              
              // Complete this step
              setTimeout(() => {
                onComplete();
              }, 1000);
            }, 1000);
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  return (
    <div className="mt-4">
      {isConnected && (
        <Alert className="bg-success-50 text-success-700 border-success-200 mb-4">
          <Check className="h-4 w-4 text-success-500" />
          <AlertDescription>
            Successfully connected to GitHub repository: {repoName}
          </AlertDescription>
        </Alert>
      )}
      
      <form className="space-y-4">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <Label htmlFor="repo-name">Repository Name</Label>
            <Input
              id="repo-name"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              className="mt-1"
              disabled={disabled || isConnecting || isConnected}
            />
          </div>
          <div className="sm:col-span-3">
            <Label htmlFor="repo-visibility">Visibility</Label>
            <Select 
              value={repoVisibility} 
              onValueChange={setRepoVisibility}
              disabled={disabled || isConnecting || isConnected}
            >
              <SelectTrigger id="repo-visibility" className="mt-1">
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-6">
            <Label htmlFor="repo-description">Description</Label>
            <Input
              id="repo-description"
              value={repoDescription}
              onChange={(e) => setRepoDescription(e.target.value)}
              className="mt-1"
              disabled={disabled || isConnecting || isConnected}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleConnect}
            disabled={disabled || isConnecting || isConnected}
          >
            {isConnecting ? "Connecting..." : isConnected ? "Connected to GitHub" : "Connect to GitHub"}
          </Button>
        </div>
      </form>
    </div>
  );
}
