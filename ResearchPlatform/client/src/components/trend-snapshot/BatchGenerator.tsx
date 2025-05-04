import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useAudio } from "@/lib/audio";

interface BatchGeneratorProps {
  onComplete?: (snapshotIds: number[]) => void;
}

export function BatchGenerator({ onComplete }: BatchGeneratorProps) {
  const [industries, setIndustries] = useState<string[]>([]);
  const [currentIndustry, setCurrentIndustry] = useState("");
  const [region, setRegion] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const { toast } = useToast();
  const { playBellSound } = useAudio();

  // Mutation for batch processing
  const batchMutation = useMutation({
    mutationFn: async (data: { 
      industries: string[]; 
      region?: string; 
      timeframe?: string; 
    }) => {
      const response = await apiRequest("POST", "/api/industry-trends/batch", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Batch Processing Complete",
        description: `Successfully generated ${data.snapshotIds.length} industry snapshots.`,
        variant: "default",
      });
      playBellSound();
      
      if (onComplete) {
        onComplete(data.snapshotIds);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Batch Processing Failed",
        description: error.message || "Failed to generate industry snapshots in batch.",
        variant: "destructive",
      });
    }
  });

  const handleAddIndustry = () => {
    if (currentIndustry.trim() && !industries.includes(currentIndustry.trim())) {
      setIndustries([...industries, currentIndustry.trim()]);
      setCurrentIndustry("");
    }
  };

  const handleRemoveIndustry = (industry: string) => {
    setIndustries(industries.filter(i => i !== industry));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddIndustry();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (industries.length === 0) {
      toast({
        title: "No Industries Selected",
        description: "Please add at least one industry to generate a snapshot.",
        variant: "destructive",
      });
      return;
    }
    
    batchMutation.mutate({
      industries,
      region: region.trim() || undefined,
      timeframe: timeframe.trim() || undefined,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Batch Snapshot Generator</CardTitle>
        <CardDescription>
          Generate multiple industry trend snapshots at once.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="industry">Add Industries</Label>
            <div className="flex gap-2">
              <Input
                id="industry"
                value={currentIndustry}
                onChange={(e) => setCurrentIndustry(e.target.value)}
                placeholder="E.g., Automotive, Healthcare, Software"
                onKeyDown={handleKeyDown}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddIndustry}
              >
                Add
              </Button>
            </div>
            {industries.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {industries.map((industry) => (
                  <Badge key={industry} variant="secondary" className="flex items-center gap-1">
                    {industry}
                    <X
                      size={14}
                      className="cursor-pointer"
                      onClick={() => handleRemoveIndustry(industry)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="region">Region (Optional)</Label>
            <Input
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="E.g., North America, Europe, Asia"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="timeframe">Timeframe (Optional)</Label>
            <Input
              id="timeframe"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              placeholder="E.g., 2023-2025, Next 5 years"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={industries.length === 0 || batchMutation.isPending}
          >
            {batchMutation.isPending ? "Processing..." : "Generate Snapshots"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}