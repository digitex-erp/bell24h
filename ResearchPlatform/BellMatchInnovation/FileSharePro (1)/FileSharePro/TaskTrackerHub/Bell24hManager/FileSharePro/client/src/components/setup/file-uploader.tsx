import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Check, Info } from "lucide-react";

interface FileUploaderProps {
  fileUploaded: boolean;
  setFileUploaded: (value: boolean) => void;
  addTerminalCommand: (command: string) => void;
  addTerminalOutput: (output: string[]) => void;
  onComplete: () => void;
}

export function FileUploader({
  fileUploaded,
  setFileUploaded,
  addTerminalCommand,
  addTerminalOutput,
  onComplete,
}: FileUploaderProps) {
  const [fileName, setFileName] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isExtracted, setIsExtracted] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      
      // Simulate upload delay
      setTimeout(() => {
        setFileUploaded(true);
        
        // Add terminal command
        addTerminalCommand("ls -la");
        
        // Add terminal output
        addTerminalOutput([
          "total 28",
          "drwxr-xr-x  3 user user  4096 May  1 10:14 .",
          "drwxr-xr-x 19 user user  4096 May  1 10:12 ..",
          "-rw-r--r--  1 user user  1026 May  1 10:13 package.json",
          `-rw-r--r--  1 user user 12288 May  1 10:14 ${file.name}`
        ]);
      }, 1500);
    }
  };

  const handleExtract = () => {
    setIsExtracting(true);
    
    // Add extract command
    addTerminalCommand(`unzip ${fileName}`);
    
    // Simulate extraction
    setTimeout(() => {
      // Show extraction progress
      addTerminalOutput([
        `Archive:  ${fileName}`,
        "   creating: bell24h/"
      ]);
      
      // Show files being extracted with a delay
      const files = [
        "  inflating: bell24h/package.json",
        "  inflating: bell24h/package-lock.json",
        "  inflating: bell24h/server.js",
        "  inflating: bell24h/README.md",
        "   creating: bell24h/src/",
        "  inflating: bell24h/src/app.js",
        "  inflating: bell24h/src/websocket.js",
        "   creating: bell24h/src/api/",
        "  inflating: bell24h/src/api/kotak.js",
        "  inflating: bell24h/src/api/kredx.js",
        "  inflating: bell24h/src/api/razorpayx.js",
        "   creating: bell24h/src/db/",
        "  inflating: bell24h/src/db/postgres.js",
        "  inflating: bell24h/src/db/redis.js",
        "   creating: bell24h/src/auth/",
        "  inflating: bell24h/src/auth/google.js",
        "  inflating: bell24h/src/auth/jwt.js",
        "   creating: bell24h/src/monitoring/",
        "  inflating: bell24h/src/monitoring/prometheus.js",
        "  inflating: bell24h/src/monitoring/grafana.js"
      ];
      
      let delay = 0;
      files.forEach((file) => {
        setTimeout(() => {
          addTerminalOutput([file]);
        }, delay);
        delay += 50;
      });
      
      // Complete extraction
      setTimeout(() => {
        addTerminalOutput(["Extraction complete!"]);
        
        // Show cd command
        addTerminalCommand("cd bell24h");
        
        // Show ls command
        addTerminalCommand("ls -la");
        addTerminalOutput([
          "total 68",
          "drwxr-xr-x 7 user user  4096 May  1 10:15 .",
          "drwxr-xr-x 3 user user  4096 May  1 10:14 ..",
          "drwxr-xr-x 2 user user  4096 May  1 10:15 src",
          "-rw-r--r-- 1 user user 47473 May  1 10:15 package-lock.json",
          "-rw-r--r-- 1 user user   483 May  1 10:15 package.json",
          "-rw-r--r-- 1 user user  1622 May  1 10:15 README.md",
          "-rw-r--r-- 1 user user   752 May  1 10:15 server.js"
        ]);
        
        setIsExtracted(true);
        setIsExtracting(false);
        
        // Complete this step
        setTimeout(() => {
          onComplete();
        }, 1000);
      }, delay + 500);
    }, 1000);
  };

  return (
    <div className="mt-4">
      {!fileUploaded ? (
        <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-secondary-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-secondary-400" />
            <div className="flex text-sm text-secondary-600 justify-center">
              <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                <span>Upload ZIP file</span>
                <input 
                  id="file-upload" 
                  name="file-upload" 
                  type="file" 
                  className="sr-only" 
                  accept=".zip"
                  onChange={handleFileUpload} 
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-secondary-500">ZIP file containing Bell24h project</p>
          </div>
        </div>
      ) : (
        <>
          <Alert className="bg-success-50 text-success-700 border-success-200">
            <Check className="h-4 w-4 text-success-500" />
            <AlertDescription>
              {fileName} uploaded successfully!
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={handleExtract}
              disabled={isExtracting || isExtracted}
            >
              {isExtracting ? "Extracting..." : isExtracted ? "Extracted" : "Extract Files"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
