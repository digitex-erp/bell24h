import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface TerminalProps {
  lines: string[];
  height?: string;
  className?: string;
}

export function Terminal({ lines, height = "h-28", className }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when lines change
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="mt-4">
      <div className="text-sm font-medium text-secondary-700 mb-2">Terminal Output:</div>
      <div 
        ref={terminalRef}
        className={cn(
          "terminal p-4 text-sm overflow-y-auto",
          height,
          className
        )}
      >
        {lines.map((line, index) => (
          <div key={index} dangerouslySetInnerHTML={{ __html: line }} />
        ))}
      </div>
    </div>
  );
}
