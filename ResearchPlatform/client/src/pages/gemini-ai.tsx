import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Check } from "lucide-react";
import { motion } from "framer-motion";
import { generateWithGemini, getIndustryTrends, categorizeRfq } from '@/lib/gemini';

const GeminiAI = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("text-generation");
  const [loading, setLoading] = useState(false);
  
  // Text Generation
  const [prompt, setPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [model, setModel] = useState<'gemini-1.5-pro' | 'gemini-1.5-flash'>('gemini-1.5-pro');
  const [generatedText, setGeneratedText] = useState("");
  
  // Industry Trends
  const [industry, setIndustry] = useState("");
  const [region, setRegion] = useState("");
  const [timeframe, setTimeframe] = useState("current");
  const [trendResults, setTrendResults] = useState<any>(null);
  
  // RFQ Categorization
  const [rfqText, setRfqText] = useState("");
  const [rfqResults, setRfqResults] = useState<any>(null);
  
  // Handle text generation
  const handleGenerateText = async () => {
    if (!prompt) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt to generate text.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await generateWithGemini({
        prompt,
        temperature,
        model
      });
      setGeneratedText(response.text);
      toast({
        title: "Text generated",
        description: "AI has successfully generated text based on your prompt."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate text.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle industry trends analysis
  const handleAnalyzeIndustry = async () => {
    if (!industry) {
      toast({
        title: "Industry required",
        description: "Please enter an industry to analyze.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await getIndustryTrends(industry, region, timeframe);
      setTrendResults(response);
      toast({
        title: "Analysis complete",
        description: "Industry trend analysis has been completed successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to analyze industry trends.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle RFQ categorization
  const handleCategorizeRfq = async () => {
    if (!rfqText) {
      toast({
        title: "RFQ text required",
        description: "Please enter RFQ text to categorize.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await categorizeRfq(rfqText);
      setRfqResults(response);
      toast({
        title: "Categorization complete",
        description: "RFQ has been successfully categorized."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to categorize RFQ.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Gemini AI Integration</h1>
      <p className="text-gray-500 mb-8">
        Explore the power of Google's Gemini AI to enhance your business decisions
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="text-generation">Text Generation</TabsTrigger>
          <TabsTrigger value="industry-trends">Industry Trends</TabsTrigger>
          <TabsTrigger value="rfq-categorization">RFQ Categorization</TabsTrigger>
        </TabsList>
        
        {/* Text Generation Tab */}
        <TabsContent value="text-generation">
          <Card>
            <CardHeader>
              <CardTitle>Gemini Text Generation</CardTitle>
              <CardDescription>
                Generate text responses using Google's Gemini AI models.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Your prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Enter your prompt here..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={5}
                />
              </div>
              
              <div className="flex gap-4">
                <div className="w-1/2 space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select value={model} onValueChange={(value: any) => setModel(value)}>
                    <SelectTrigger id="model">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                        <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-1/2 space-y-2">
                  <Label htmlFor="temperature">Temperature: {temperature}</Label>
                  <Input
                    id="temperature"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  />
                </div>
              </div>
              
              {generatedText && (
                <div className="mt-4 space-y-2">
                  <Label>Generated Text</Label>
                  <div className="p-4 bg-muted rounded-md whitespace-pre-wrap">
                    {generatedText}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGenerateText} 
                disabled={loading || !prompt}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Text"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Industry Trends Tab */}
        <TabsContent value="industry-trends">
          <Card>
            <CardHeader>
              <CardTitle>Industry Trend Analysis</CardTitle>
              <CardDescription>
                Get comprehensive industry trend analysis with market size, growth rates, and key players.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="Enter industry (e.g., 'renewable energy')"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Region (optional)</Label>
                  <Input
                    id="region"
                    placeholder="Enter region (e.g., 'India' or 'Global')"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeframe">Timeframe</Label>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger id="timeframe">
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="current">Current</SelectItem>
                        <SelectItem value="next 5 years">Next 5 Years</SelectItem>
                        <SelectItem value="next decade">Next Decade</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {trendResults && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-xl font-semibold">Industry Trend Analysis Results</h3>
                  
                  <div className="p-4 bg-muted rounded-md">
                    <h4 className="font-medium">{trendResults.industry} Industry Overview</h4>
                    <p className="text-sm text-gray-500 mb-4">Analysis Date: {trendResults.date}</p>
                    
                    <div className="mb-4">
                      <h5 className="font-medium mb-2">Market Size</h5>
                      <p>Current Value: {trendResults.marketSize.currentValue} {trendResults.marketSize.currency}</p>
                      <p>Growth Rate: {trendResults.marketSize.growthRate}%</p>
                      <p>Forecast Year: {trendResults.marketSize.forecastYear}</p>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="font-medium mb-2">Key Trends</h5>
                      <ul className="list-disc pl-5 space-y-2">
                        {trendResults.trends.map((trend: any, index: number) => (
                          <li key={index}>
                            <span className="font-medium">{trend.title}</span> - 
                            <span className="text-sm"> Impact Score: {trend.impactScore}/10</span>
                            <p className="text-sm">{trend.description}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="font-medium mb-2">Key Players</h5>
                      <ul className="list-disc pl-5">
                        {trendResults.keyPlayers.map((player: any, index: number) => (
                          <li key={index}>
                            {player.name}
                            {player.marketShare && <span className="text-sm"> - Market Share: {player.marketShare}%</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">Opportunities</h5>
                        <ul className="list-disc pl-5">
                          {trendResults.opportunities.map((item: string, index: number) => (
                            <li key={index} className="text-sm">{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Challenges</h5>
                        <ul className="list-disc pl-5">
                          {trendResults.challenges.map((item: string, index: number) => (
                            <li key={index} className="text-sm">{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleAnalyzeIndustry} 
                disabled={loading || !industry}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Industry Trends"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* RFQ Categorization Tab */}
        <TabsContent value="rfq-categorization">
          <Card>
            <CardHeader>
              <CardTitle>RFQ Categorization</CardTitle>
              <CardDescription>
                Analyze and categorize RFQs to improve supplier matching and response time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rfq-text">RFQ Text</Label>
                <Textarea
                  id="rfq-text"
                  placeholder="Paste your RFQ text here..."
                  value={rfqText}
                  onChange={(e) => setRfqText(e.target.value)}
                  rows={6}
                />
              </div>
              
              {rfqResults && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <div className="p-4 bg-muted rounded-md">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-semibold">{rfqResults.category}</h4>
                        <p className="text-sm text-gray-500">{rfqResults.subCategory}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                          {Math.round(rfqResults.confidence * 100)}% Confidence
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <h5 className="text-sm font-medium mb-1">Estimated Value</h5>
                        <p>{rfqResults.estimatedValue.min} - {rfqResults.estimatedValue.max} {rfqResults.estimatedValue.currency}</p>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium mb-1">Complexity</h5>
                        <div className="flex items-center">
                          <span className={`
                            inline-block w-3 h-3 rounded-full mr-2
                            ${rfqResults.complexity === 'low' ? 'bg-green-500' : 
                              rfqResults.complexity === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}
                          `}></span>
                          <span className="capitalize">{rfqResults.complexity}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="text-sm font-medium mb-1">Timeline</h5>
                      <p>Estimated Days: {rfqResults.timeline.estimatedDays}</p>
                      <p>Urgency: <span className="capitalize">{rfqResults.timeline.urgency}</span></p>
                    </div>
                    
                    <div className="mb-4">
                      <h5 className="text-sm font-medium mb-1">Tags</h5>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rfqResults.tags.map((tag: string, index: number) => (
                          <span 
                            key={index}
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium mb-1">Potential Suppliers</h5>
                      <ul className="list-disc pl-5">
                        {rfqResults.potentialSuppliers.map((supplier: string, index: number) => (
                          <li key={index} className="text-sm">{supplier}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleCategorizeRfq} 
                disabled={loading || !rfqText}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Categorizing RFQ...
                  </>
                ) : (
                  "Categorize RFQ"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GeminiAI;