import { useState, useEffect } from "react";
import { useToast } from "../../hooks/use-toast";
import { apiRequest } from "../../lib/queryClient";
import { BellSoundEffects } from "../../lib/audio";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Lightbulb, Zap, Bell, Calendar, DownloadCloud, Share2 } from "lucide-react";

type FeaturedIndustry = {
  id: number;
  name: string;
  description: string;
  icon: string;
  marketSize: string;
  growth: string;
  keyCompetitors?: string[];
  riskLevel?: "low" | "medium" | "high";
  trendsValidity?: string;
};

type RegionOption = {
  id: string;
  name: string;
  description: string;
};

type TimeframeOption = {
  id: string;
  name: string;
  description: string;
};

type AlertConfig = {
  industryId: number;
  industryName: string;
  thresholdType: 'growth' | 'decline' | 'volatility';
  threshold: number;
  frequency: 'realtime' | 'daily' | 'weekly';
  channels: ('email' | 'sms' | 'in-app')[];
  region?: string;
  description?: string;
};

interface OneClickGeneratorProps {
  onSuccess?: (snapshotId: number) => void;
  onAlertSetup?: (industryName: string, alertConfig: AlertConfig) => void;
}

/**
 * One-Click Industry Trend Snapshot Generator Component
 * 
 * Allows users to generate comprehensive industry trend snapshots with minimal input
 */
export default function OneClickGenerator({ onSuccess, onAlertSetup }: OneClickGeneratorProps) {
  const { toast } = useToast();
  
  // State
  const [featuredIndustries, setFeaturedIndustries] = useState<FeaturedIndustry[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedSnapshotId, setGeneratedSnapshotId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [emailSubscription, setEmailSubscription] = useState<string>("");
  const [showSubscriptionForm, setShowSubscriptionForm] = useState<boolean>(false);
  
  // Alert Configuration
  const [showAlertConfig, setShowAlertConfig] = useState<boolean>(false);
  const [alertThresholdType, setAlertThresholdType] = useState<'growth' | 'decline' | 'volatility'>('growth');
  const [alertThreshold, setAlertThreshold] = useState<number>(5);
  const [alertFrequency, setAlertFrequency] = useState<'realtime' | 'daily' | 'weekly'>('daily');
  const [alertChannels, setAlertChannels] = useState<('email' | 'sms' | 'in-app')[]>(['email', 'in-app']);
  const [alertDescription, setAlertDescription] = useState<string>("");
  
  // Region options
  const regions: RegionOption[] = [
    { id: "global", name: "Global", description: "Worldwide analysis" },
    { id: "north-america", name: "North America", description: "USA, Canada, Mexico" },
    { id: "europe", name: "Europe", description: "European Union and United Kingdom" },
    { id: "asia-pacific", name: "Asia-Pacific", description: "China, Japan, India, Australia, Southeast Asia" },
    { id: "india", name: "India", description: "Focus on Indian market" },
    { id: "middle-east", name: "Middle East", description: "GCC Countries and surrounding regions" },
  ];
  
  // Fetch featured industries when the component loads
  useEffect(() => {
    fetchFeaturedIndustries();
  }, []);
  
  /**
   * Fetch featured industries from API
   */
  const fetchFeaturedIndustries = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest("GET", "/api/industry-trends/featured-industries");
      const data = await response.json();
      setFeaturedIndustries(data);
    } catch (error) {
      console.error("Error fetching featured industries:", error);
      toast({
        title: "Failed to fetch industries",
        description: "Could not load featured industries. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Generate a snapshot with the selected industry and region
   */
  const generateSnapshot = async () => {
    if (!selectedIndustry) {
      toast({
        title: "Industry Required",
        description: "Please select an industry for the trend snapshot.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsGenerating(true);
      const payload = {
        industry: selectedIndustry,
        region: selectedRegion || null
      };
      
      const response = await apiRequest("POST", "/api/industry-trends/generate-snapshot", payload);
      const data = await response.json();
      
      setGeneratedSnapshotId(data.id);
      
      // Call onSuccess callback if provided
      if (onSuccess && data.id) {
        onSuccess(data.id);
      }
      
      toast({
        title: "Snapshot Generated",
        description: "Your industry trend snapshot has been successfully generated.",
        variant: "default"
      });
      
    } catch (error: any) {
      console.error("Error generating snapshot:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate industry trend snapshot. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Subscribe to weekly email updates
   */
  const subscribeToUpdates = async () => {
    if (!emailSubscription || !selectedIndustry) {
      toast({
        title: "Information Required",
        description: "Please enter your email and select an industry.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const industryObj = featuredIndustries.find(ind => ind.name === selectedIndustry);
      if (!industryObj) {
        throw new Error("Selected industry not found");
      }
      
      const payload = {
        email: emailSubscription,
        industryId: industryObj.id
      };
      
      const response = await apiRequest("POST", "/api/industry-trends/subscribe", payload);
      await response.json();
      
      toast({
        title: "Subscription Successful",
        description: "You've been subscribed to weekly industry trend updates.",
        variant: "default"
      });
      
      // Play sound effect for success
      BellSoundEffects.success();
      
      setShowSubscriptionForm(false);
      setEmailSubscription("");
      
    } catch (error) {
      console.error("Error subscribing to updates:", error);
      toast({
        title: "Subscription Failed",
        description: "Could not subscribe to updates. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  /**
   * Setup industry trend alerts for real-time notifications
   */
  const setupTrendAlert = async () => {
    if (!selectedIndustry) {
      toast({
        title: "Industry Required",
        description: "Please select an industry to set up alerts for.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const industryObj = featuredIndustries.find(ind => ind.name === selectedIndustry);
      if (!industryObj) {
        throw new Error("Selected industry not found");
      }
      
      // Create alert configuration
      const alertConfig: AlertConfig = {
        industryId: industryObj.id,
        industryName: industryObj.name,
        thresholdType: alertThresholdType,
        threshold: alertThreshold,
        frequency: alertFrequency,
        channels: alertChannels,
        region: selectedRegion || undefined,
        description: alertDescription || `${alertThresholdType} alerts for ${industryObj.name} industry`,
      };
      
      // Send to parent component if callback exists
      if (onAlertSetup) {
        onAlertSetup(industryObj.name, alertConfig);
      }
      
      // Save to the backend
      const response = await apiRequest("POST", "/api/alerts/create", alertConfig);
      await response.json();
      
      // Play sound effect for alert setup
      BellSoundEffects.notification();
      
      toast({
        title: "Alert Setup Successful",
        description: `You'll be notified of ${alertThresholdType} events in the ${industryObj.name} industry.`,
        variant: "default"
      });
      
      setShowAlertConfig(false);
      
    } catch (error: any) {
      console.error("Error setting up alert:", error);
      toast({
        title: "Alert Setup Failed",
        description: error.message || "Could not set up industry trend alerts. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="h-5 w-5 mr-2 text-primary" />
          One-Click Industry Trend Generator
        </CardTitle>
        <CardDescription>
          Generate comprehensive industry trend snapshots with minimal input
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="featured" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="featured">Featured Industries</TabsTrigger>
            <TabsTrigger value="custom">Custom Industry</TabsTrigger>
          </TabsList>
          
          <TabsContent value="featured">
            {isLoading ? (
              <div className="w-full flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredIndustries.map((industry) => (
                  <Card 
                    key={industry.id} 
                    className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                      selectedIndustry === industry.name ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => setSelectedIndustry(industry.name)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{industry.name}</CardTitle>
                      <Badge variant="outline" className="w-fit">{industry.growth}</Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{industry.description}</p>
                      <p className="text-sm font-medium mt-2">Market Size: {industry.marketSize}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="custom">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Custom Industry</label>
                <input 
                  type="text" 
                  placeholder="Enter industry name" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1.5"
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                />
              </div>
              
              <Alert variant="default" className="bg-muted/50">
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Industry Tip</AlertTitle>
                <AlertDescription>
                  Be specific with the industry name for better results. For example, use "Electric Vehicles" instead of just "Automotive".
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6">
          <label className="text-sm font-medium">Regional Focus (Optional)</label>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Global (Worldwide)" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  <div>
                    <span>{region.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">({region.description})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {showSubscriptionForm && (
          <div className="mt-6 p-4 border rounded-md bg-muted/30">
            <h4 className="font-medium mb-2">Subscribe to Weekly Updates</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Get weekly email updates with fresh insights on this industry
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={emailSubscription}
                onChange={(e) => setEmailSubscription(e.target.value)}
              />
              <Button onClick={subscribeToUpdates}>Subscribe</Button>
            </div>
          </div>
        )}
        
        {showAlertConfig && (
          <div className="mt-6 p-4 border rounded-md bg-primary/5 border-primary">
            <h4 className="font-medium mb-2 flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Configure Industry Trend Alerts
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Get notified when significant changes occur in this industry
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Alert Type</label>
                <Select value={alertThresholdType} onValueChange={(value: 'growth' | 'decline' | 'volatility') => setAlertThresholdType(value)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="growth">Growth Opportunity</SelectItem>
                    <SelectItem value="decline">Market Decline</SelectItem>
                    <SelectItem value="volatility">Market Volatility</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Threshold (%)</label>
                <div className="flex items-center gap-2 mt-1.5">
                  <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    step="1"
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <span className="w-8 text-center">{alertThreshold}%</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Alert Frequency</label>
                <Select value={alertFrequency} onValueChange={(value: 'realtime' | 'daily' | 'weekly') => setAlertFrequency(value)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">Notification Channels</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="email-channel" 
                      checked={alertChannels.includes('email')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAlertChannels([...alertChannels, 'email']);
                        } else {
                          setAlertChannels(alertChannels.filter(c => c !== 'email'));
                        }
                      }}
                    />
                    <Label htmlFor="email-channel">Email</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sms-channel" 
                      checked={alertChannels.includes('sms')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAlertChannels([...alertChannels, 'sms']);
                        } else {
                          setAlertChannels(alertChannels.filter(c => c !== 'sms'));
                        }
                      }}
                    />
                    <Label htmlFor="sms-channel">SMS</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="in-app-channel" 
                      checked={alertChannels.includes('in-app')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setAlertChannels([...alertChannels, 'in-app']);
                        } else {
                          setAlertChannels(alertChannels.filter(c => c !== 'in-app'));
                        }
                      }}
                    />
                    <Label htmlFor="in-app-channel">In-app Notification</Label>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <Button onClick={setupTrendAlert} className="w-full">
                  <Bell className="mr-2 h-4 w-4" />
                  Set Up Alert
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSubscriptionForm(!showSubscriptionForm)}
            className="w-full sm:w-auto"
          >
            {showSubscriptionForm ? "Hide Subscription" : "Get Weekly Updates"}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowAlertConfig(!showAlertConfig)}
            className="w-full sm:w-auto"
          >
            <Bell className="mr-2 h-4 w-4" />
            {showAlertConfig ? "Hide Alert Config" : "Setup Alerts"}
          </Button>
        </div>
        
        <Button
          onClick={generateSnapshot}
          disabled={!selectedIndustry || isGenerating}
          className="w-full sm:w-auto"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Generate Snapshot
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}