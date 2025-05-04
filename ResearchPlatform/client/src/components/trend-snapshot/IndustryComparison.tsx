import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { X, BarChart2, ChevronRight, ChevronDown, Briefcase, Lightbulb, Gem } from "lucide-react";
import { useAudio } from "@/lib/audio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { IndustryComparisonData } from "./types";

interface IndustryComparisonProps {
  onComplete?: (data: IndustryComparisonData) => void;
}

export function IndustryComparison({ onComplete }: IndustryComparisonProps) {
  const [industries, setIndustries] = useState<string[]>([]);
  const [currentIndustry, setCurrentIndustry] = useState("");
  const [comparisonName, setComparisonName] = useState("");
  const [comparisonData, setComparisonData] = useState<IndustryComparisonData | null>(null);
  const { toast } = useToast();
  const { playBellSound } = useAudio();
  const [activeTab, setActiveTab] = useState("marketSize");

  // Mutation for comparison generation
  const comparisonMutation = useMutation({
    mutationFn: async (data: { 
      industries: string[];
      name?: string;
    }) => {
      const response = await apiRequest("POST", "/api/industry-trends/compare", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Comparison Generated",
        description: `Successfully compared ${data.industries.length} industries.`,
        variant: "default",
      });
      playBellSound();
      
      setComparisonData(data);
      
      if (onComplete) {
        onComplete(data);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Comparison Failed",
        description: error.message || "Failed to generate industry comparison.",
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
    
    if (industries.length < 2) {
      toast({
        title: "Not Enough Industries",
        description: "Please add at least two industries to compare.",
        variant: "destructive",
      });
      return;
    }
    
    comparisonMutation.mutate({
      industries,
      name: comparisonName.trim() || undefined,
    });
  };

  const renderComparisonResults = () => {
    if (!comparisonData) return null;
    
    return (
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">
          Industry Comparison: {comparisonName || comparisonData.industries.join(", ")}
        </h3>
        <p className="text-muted-foreground mb-4">{comparisonData.summaryInsights}</p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="marketSize">Market Size</TabsTrigger>
            <TabsTrigger value="growth">Growth Rates</TabsTrigger>
            <TabsTrigger value="players">Key Players</TabsTrigger>
            <TabsTrigger value="tech">Technologies</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          </TabsList>
          
          <TabsContent value="marketSize" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="mr-2" /> Market Size Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(comparisonData.marketSizeComparison).map(([industry, marketSize]) => (
                    <div key={industry} className="flex flex-col">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{industry}</span>
                        <span>{marketSize}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ 
                            width: `${Math.min(100, Math.random() * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="growth" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Growth Rate Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(comparisonData.growthRateComparison).map(([industry, growthRate]) => (
                    <div key={industry} className="flex justify-between items-center p-2 border-b">
                      <span className="font-medium">{industry}</span>
                      <Badge variant="outline">{growthRate}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="players" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="mr-2" /> Key Players Overlap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {comparisonData.keyPlayerOverlap.map((player, index) => (
                    <Collapsible key={index} className="border rounded-md p-2">
                      <CollapsibleTrigger className="flex justify-between items-center w-full">
                        <div className="font-medium">{player.companyName}</div>
                        <div className="flex items-center">
                          <Badge variant="secondary" className="mr-2">
                            {player.industries.length} industries
                          </Badge>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-2">
                        <div className="bg-muted p-3 rounded-md">
                          <div className="mb-2">
                            <span className="font-semibold">Industries: </span>
                            {player.industries.join(", ")}
                          </div>
                          <div>
                            <span className="font-semibold">Dominance Score: </span>
                            {player.dominanceScore}/10
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tech" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="mr-2" /> Technology Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(comparisonData.technologyTrends).map(([industry, technologies]) => (
                    <div key={industry} className="border-b pb-3">
                      <h4 className="font-semibold mb-2">{industry}</h4>
                      <div className="flex flex-wrap gap-2">
                        {technologies.map((tech, index) => (
                          <Badge key={index}>{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="opportunities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gem className="mr-2" /> Opportunity Matrix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(comparisonData.opportunityMatrix).map(([industry, opportunities]) => (
                    <Collapsible key={industry} className="border rounded-md">
                      <CollapsibleTrigger className="flex justify-between items-center w-full p-3">
                        <h4 className="font-semibold">{industry}</h4>
                        <ChevronDown className="h-4 w-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-3 pb-3">
                        <div className="space-y-2">
                          {opportunities.map((opportunity, index) => (
                            <div key={index} className="bg-muted p-2 rounded-md">
                              <div className="flex justify-between">
                                <span>{opportunity.opportunity}</span>
                                <Badge variant="outline">
                                  Score: {opportunity.potentialScore}/10
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Timeframe: {opportunity.timeFrame}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Industry Comparison</CardTitle>
          <CardDescription>
            Compare trends and insights across multiple industries.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comparisonName">Comparison Name (Optional)</Label>
              <Input
                id="comparisonName"
                value={comparisonName}
                onChange={(e) => setComparisonName(e.target.value)}
                placeholder="E.g., Tech vs. Healthcare Analysis"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Add Industries to Compare</Label>
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
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={industries.length < 2 || comparisonMutation.isPending}
            >
              {comparisonMutation.isPending ? "Generating Comparison..." : "Compare Industries"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      {renderComparisonResults()}
    </div>
  );
}