import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMicroInteractions } from "@/hooks/use-micro-interactions";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import { BellSoundEffects } from "@/lib/audio";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InteractiveButton } from "@/components/ui/micro-interactions/InteractiveButton";
import { AnimatedSkeleton } from "@/components/ui/micro-interactions/AnimatedSkeleton";
import { SuccessAnimation } from "@/components/ui/micro-interactions/SuccessAnimation";
import OneClickGenerator from "@/components/trend-snapshot/OneClickGenerator";
import { ExportOptions } from "@/components/trend-snapshot/ExportOptions";

// Interface for industry trend data
interface IndustryTrendSnapshot {
  industry: string;
  summary: string;
  keyTrends: Array<{
    title: string;
    description: string;
    impact: "low" | "medium" | "high";
  }>;
  marketSizeData: {
    currentSize: string;
    projectedGrowth: string;
    cagr: string;
  };
  topPlayers: Array<{
    name: string;
    strengthAreas: string[];
    marketShare?: string;
  }>;
  emergingTechnologies: Array<{
    name: string;
    description: string;
    adoptionStage: "early" | "growing" | "mature";
    potentialImpact: "low" | "medium" | "high";
  }>;
  regionalInsights: Record<string, string>;
  challenges: string[];
  opportunities: string[];
  sourcesUsed?: string[];
}

// Predefined industry options for better user experience
const industryOptions = [
  "Automotive",
  "Construction",
  "Electronics",
  "Financial Services",
  "Healthcare",
  "Manufacturing",
  "Pharmaceuticals",
  "Retail",
  "Telecommunications",
  "Textiles",
  "Agriculture",
  "Information Technology",
  "Renewable Energy",
  "Food Processing",
  "Logistics",
];

// Region options
const regionOptions = [
  "Global",
  "India",
  "Asia Pacific",
  "North America",
  "Europe",
  "Middle East",
  "Africa",
  "Latin America",
];

// Helper component for impact badge
const ImpactBadge = ({ impact }: { impact: "low" | "medium" | "high" }) => {
  const getVariant = () => {
    switch (impact) {
      case "low":
        return "secondary";
      case "medium":
        return "outline";
      case "high":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Badge variant={getVariant() as any} className="ml-2">
      {impact}
    </Badge>
  );
};

// Helper component for adoption stage badge
const AdoptionStageBadge = ({
  stage,
}: {
  stage: "early" | "growing" | "mature";
}) => {
  const getVariant = () => {
    switch (stage) {
      case "early":
        return "outline";
      case "growing":
        return "secondary";
      case "mature":
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <Badge variant={getVariant() as any} className="ml-2">
      {stage}
    </Badge>
  );
};

export default function IndustryTrends() {
  const [industry, setIndustry] = useState("");
  const [region, setRegion] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [snapshot, setSnapshot] = useState<IndustryTrendSnapshot | null>(null);
  const [customIndustry, setCustomIndustry] = useState("");
  const [activeView, setActiveView] = useState("summary");
  const [activeTab, setActiveTab] = useState("generate");
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<number | null>(null);
  const [sharingEmail, setSharingEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const snapshotRef = useRef<HTMLElement>(null);
  const { toast } = useToast();
  const { animate, animationStates } = useMicroInteractions();
  
  // Initialize audio on page load - uses a ref to store whether audio has been initialized
  const audioInitializedRef = useRef(false);
  
  // Effect to initialize audio on first interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!audioInitializedRef.current) {
        BellSoundEffects.initialize();
        audioInitializedRef.current = true;
        // Remove listeners after initialization
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
      }
    };
    
    // Add listeners for first user interaction
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    
    // Clean up listeners on component unmount
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);
  
  // Query for fetching user's saved snapshots
  const savedSnapshotsQuery = useQuery({
    queryKey: ['/api/industry-trends/user-snapshots'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/industry-trends/user-snapshots");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch saved snapshots");
      }
      return await response.json();
    },
    enabled: activeTab === "history", // Only fetch when history tab is active
  });
  
  // Query for fetching a specific snapshot by ID
  const snapshotDetailQuery = useQuery({
    queryKey: ['/api/industry-trends/snapshot', selectedSnapshotId],
    queryFn: async () => {
      if (!selectedSnapshotId) return null;
      
      const response = await apiRequest("GET", `/api/industry-trends/snapshot/${selectedSnapshotId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch snapshot details");
      }
      return await response.json();
    },
    enabled: !!selectedSnapshotId,
    onSuccess: (data) => {
      if (data) {
        setSnapshot(data);
        setActiveTab("details");
      }
    }
  });
  
  // Mutation for sharing snapshot via email
  const shareSnapshotMutation = useMutation({
    mutationFn: async (data: { snapshotId: number, recipientEmail: string, senderName: string }) => {
      const response = await apiRequest("POST", "/api/industry-trends/share", data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to share snapshot");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Play notification bell sound when snapshot is shared
      BellSoundEffects.notification();
      
      toast({
        title: "Snapshot Shared",
        description: `Snapshot has been shared with ${sharingEmail}`,
      });
      setSharingEmail("");
      setSenderName("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error Sharing Snapshot",
        description: error.message || "An error occurred. Please try again later.",
        variant: "destructive",
      });
    }
  });

  // Mutation for fetching industry trends
  const trendMutation = useMutation({
    mutationFn: async (data: {
      industry: string;
      region?: string;
      timeframe?: string;
    }) => {
      const response = await apiRequest("POST", "/api/industry-trends/snapshot", data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate industry trend snapshot");
      }
      
      return await response.json() as IndustryTrendSnapshot;
    },
    onSuccess: (data) => {
      setSnapshot(data);
      animate("success", true);
      // Play success bell sound when snapshot is generated
      BellSoundEffects.success();
      toast({
        title: "Industry Trend Snapshot Generated",
        description: "Your industry trend snapshot has been successfully generated.",
      });
    },
    onError: (error: Error) => {
      animate("error", true);
      toast({
        title: "Error Generating Snapshot",
        description: error.message || "An error occurred. Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateTrend = () => {
    // Determine which industry value to use
    const industryValue = industry === "custom" ? customIndustry : industry;
    
    if (!industryValue.trim()) {
      toast({
        title: "Industry Required",
        description: "Please select or enter an industry to generate a trend snapshot.",
        variant: "destructive",
      });
      return;
    }

    animate("loading", true);
    
    trendMutation.mutate({
      industry: industryValue,
      region: region || undefined,
      timeframe: timeframe || undefined,
    });
  };
  
  // Handle exporting snapshot to PDF
  const [exportingPDF, setExportingPDF] = useState(false);

  const handleExportPDF = async () => {
    if (!snapshot || !snapshotRef.current) return;
    
    try {
      setExportingPDF(true);
      toast({
        title: "Preparing PDF",
        description: "Please wait while we generate your PDF...",
      });
      
      // First change to "print-friendly" view
      document.body.classList.add('export-mode');
      
      const canvas = await html2canvas(snapshotRef.current, {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      
      // Remove print-friendly mode
      document.body.classList.remove('export-mode');
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Add header
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Bell24h Industry Trend Analysis`, 105, 15, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });
      pdf.line(20, 25, 190, 25);
      
      // Calculate dimensions
      const imgWidth = 170; // Slightly smaller to have margins
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      // Add the snapshot image
      pdf.addImage(imgData, 'PNG', 20, 30, imgWidth, imgHeight);
      
      // Add footer
      const pageCount = pdf.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text(`© ${new Date().getFullYear()} Bell24h.com - Powered by AI Analytics`, 105, 290, { align: 'center' });
        pdf.text(`Page ${i} of ${pageCount}`, 180, 290);
      }
      
      pdf.save(`${snapshot.industry}-industry-trend-snapshot.pdf`);
      
      // Play success bell sound when PDF is ready
      BellSoundEffects.success();
      
      toast({
        title: "PDF Export Complete",
        description: "Your snapshot has been exported to PDF.",
      });
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast({
        title: "PDF Export Failed",
        description: "Failed to export snapshot to PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExportingPDF(false);
      document.body.classList.remove('export-mode'); // Ensure it's removed
    }
  };
  
  // Handle sharing via email
  // Handler for when OneClickGenerator successfully creates a snapshot
  const handleOneClickSuccess = (snapshotId: number) => {
    // Set the selected snapshot ID, which will trigger the snapshotDetailQuery
    setSelectedSnapshotId(snapshotId);
    // Play bell sound to indicate success
    BellSoundEffects.success();
  };

  const handleShareViaEmail = () => {
    if (!snapshot || !selectedSnapshotId) {
      toast({
        title: "No Snapshot Selected",
        description: "Please select a snapshot to share.",
        variant: "destructive",
      });
      return;
    }
    
    if (!sharingEmail.trim() || !senderName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both recipient email and your name.",
        variant: "destructive",
      });
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sharingEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please provide a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    shareSnapshotMutation.mutate({
      snapshotId: selectedSnapshotId,
      recipientEmail: sharingEmail,
      senderName: senderName
    });
  };

  return (
    <div className="container py-4 md:py-8 px-4 md:px-8">
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 md:p-8 rounded-lg mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-3">One-Click Industry Trend Snapshot Generator</h1>
        <p className="text-muted-foreground">
          Generate a comprehensive analysis of industry trends, market size, key players,
          and emerging technologies with a single click.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="w-full flex flex-wrap md:flex-nowrap justify-start gap-1 md:gap-0">
          <TabsTrigger value="generate" className="flex-1">Generate New</TabsTrigger>
          <TabsTrigger value="history" className="flex-1">My Snapshots</TabsTrigger>
          {snapshot && <TabsTrigger value="details" className="flex-1">Current Snapshot</TabsTrigger>}
          {snapshot && <TabsTrigger value="share" className="flex-1">Share</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="history" className="mt-4">
          {savedSnapshotsQuery.isLoading ? (
            <div className="space-y-4">
              <AnimatedSkeleton className="h-16 w-full" />
              <AnimatedSkeleton className="h-16 w-full" />
              <AnimatedSkeleton className="h-16 w-full" />
            </div>
          ) : savedSnapshotsQuery.isError ? (
            <div className="p-6 bg-muted rounded-lg text-center">
              <p className="text-destructive">Error loading snapshots.</p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => savedSnapshotsQuery.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : savedSnapshotsQuery.data?.snapshots?.length ? (
            <div className="space-y-3">
              {savedSnapshotsQuery.data.snapshots.map((item: any) => (
                <Card key={item.id} className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => setSelectedSnapshotId(item.id)}
                >
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{item.industry} Industry</h3>
                      <p className="text-muted-foreground text-sm">
                        {item.region && `Region: ${item.region} • `}
                        Generated: {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost">View</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-muted rounded-lg text-center">
              <p className="mb-2">You haven't saved any snapshots yet.</p>
              <p className="text-muted-foreground">Generate a new snapshot to see it here.</p>
              <Button className="mt-4" onClick={() => setActiveTab("generate")}>
                Generate New Snapshot
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="details" className="mt-4">
          {snapshot && (
            <div ref={snapshotRef} className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">{snapshot.industry} Industry Trend Snapshot</h2>
                  <p className="text-muted-foreground">
                    {region && `Region: ${region} • `}
                    Generated on {new Date().toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExportPDF} size="sm">
                    Export PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("share")} 
                    size="sm"
                  >
                    Share
                  </Button>
                </div>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Executive Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{snapshot.summary}</p>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Market Size Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Current Size', value: parseInt(snapshot.marketSizeData.currentSize.replace(/[^0-9.-]+/g, "")) || 100 },
                            { name: 'Projected', value: parseInt(snapshot.marketSizeData.projectedGrowth.replace(/[^0-9.-]+/g, "")) || 150 }
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`${value}`, 'Market Size']} />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <h3 className="font-semibold">Current Market Size</h3>
                        <p className="text-xl font-bold">{snapshot.marketSizeData.currentSize}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold">Projected Growth</h3>
                        <p className="text-xl font-bold">{snapshot.marketSizeData.projectedGrowth}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold">CAGR</h3>
                        <p className="text-xl font-bold text-primary">{snapshot.marketSizeData.cagr}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Key Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {snapshot.keyTrends.slice(0, 3).map((trend, index) => (
                        <div key={index} className="border-b pb-2 last:border-0">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">{trend.title}</h3>
                            <ImpactBadge impact={trend.impact} />
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {trend.description.substring(0, 120)}
                            {trend.description.length > 120 ? '...' : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Market Players</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={snapshot.topPlayers.map((player, index) => ({
                              name: player.name,
                              value: player.marketShare ? parseInt(player.marketShare) : 100 / snapshot.topPlayers.length
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name}) => name}
                          >
                            {snapshot.topPlayers.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, 'Market Share']}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Key Players Strengths</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {snapshot.topPlayers.slice(0, 4).map((player, index) => (
                          <div key={index} className="bg-muted p-2 rounded-lg">
                            <p className="font-medium">{player.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {player.strengthAreas.slice(0, 2).join(', ')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Emerging Technologies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {snapshot.emergingTechnologies.map((tech, index) => (
                        <div key={index} className="border-b pb-2 last:border-0">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">{tech.name}</h3>
                            <div className="flex items-center gap-2">
                              <AdoptionStageBadge stage={tech.adoptionStage} />
                              <ImpactBadge impact={tech.potentialImpact} />
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {tech.description.substring(0, 100)}
                            {tech.description.length > 100 ? '...' : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Challenges & Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-2">Challenges</h3>
                        <ul className="space-y-1 pl-5 list-disc">
                          {snapshot.challenges.map((challenge, index) => (
                            <li key={index}>{challenge}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Opportunities</h3>
                        <ul className="space-y-1 pl-5 list-disc">
                          {snapshot.opportunities.map((opportunity, index) => (
                            <li key={index}>{opportunity}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {snapshot.sourcesUsed && snapshot.sourcesUsed.length > 0 && (
                <div className="text-sm text-muted-foreground mt-4">
                  <p className="font-medium">Sources:</p>
                  <ul className="list-disc pl-5 mt-1">
                    {snapshot.sourcesUsed.map((source, index) => (
                      <li key={index}>{source}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="share" className="mt-4">
          {snapshot && (
            <Card>
              <CardHeader>
                <CardTitle>Share This Snapshot</CardTitle>
                <CardDescription>
                  Send the {snapshot.industry} industry trend snapshot to a colleague or client.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientEmail">Recipient Email *</Label>
                  <Input
                    id="recipientEmail"
                    placeholder="colleague@company.com"
                    value={sharingEmail}
                    onChange={(e) => setSharingEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="senderName">Your Name *</Label>
                  <Input
                    id="senderName"
                    placeholder="Your Name"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleShareViaEmail} disabled={shareSnapshotMutation.isPending}>
                    {shareSnapshotMutation.isPending ? "Sending..." : "Share via Email"}
                  </Button>
                  
                  <Button variant="outline" onClick={handleExportPDF}>
                    Export as PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="generate" className="mt-4">
          {/* One-Click Generator Section */}
          <div className="mb-6">
            <OneClickGenerator onSuccess={handleOneClickSuccess} />
          </div>
          
          {/* Standard Generator Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Generate Trend Snapshot</CardTitle>
              <CardDescription>
                Enter the industry details to analyze trends and insights.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select value={industry} onValueChange={(value) => setIndustry(value)}>
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select an industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industryOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Industry</SelectItem>
                  </SelectContent>
                </Select>
                
                {industry === "custom" && (
                  <div className="mt-2">
                    <Label htmlFor="customIndustry">Custom Industry</Label>
                    <Input
                      id="customIndustry"
                      placeholder="Enter industry name"
                      value={customIndustry}
                      onChange={(e) => setCustomIndustry(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Region (Optional)</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Select a region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regionOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeframe">Timeframe (Optional)</Label>
                <Input
                  id="timeframe"
                  placeholder="e.g., 2025-2030"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <InteractiveButton
                onClick={handleGenerateTrend}
                isLoading={trendMutation.isPending || animationStates.loading}
                loadingText="Generating..."
                className="w-full"
              >
                Generate Trend Snapshot
              </InteractiveButton>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2">
          {trendMutation.isPending || animationStates.loading ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  <AnimatedSkeleton className="h-8 w-3/4" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AnimatedSkeleton className="h-24 w-full" />
                <AnimatedSkeleton className="h-36 w-full" />
                <AnimatedSkeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ) : snapshot ? (
            <Card>
              <CardHeader className="relative">
                {animationStates.success && (
                  <div className="absolute -top-4 -right-4">
                    <SuccessAnimation size={80} />
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>
                      {snapshot.industry} Industry Trend Snapshot
                      {region && ` - ${region}`}
                      {timeframe && ` (${timeframe})`}
                    </CardTitle>
                    <CardDescription>
                      Generated on {new Date().toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <ExportOptions snapshot={snapshot} contentRef={snapshotRef} />
                </div>
              </CardHeader>
              <CardContent>
                <div ref={snapshotRef}>
                <Tabs value={activeView} onValueChange={setActiveView}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="trends">Key Trends</TabsTrigger>
                    <TabsTrigger value="market">Market Data</TabsTrigger>
                    <TabsTrigger value="players">Top Players</TabsTrigger>
                    <TabsTrigger value="tech">Technologies</TabsTrigger>
                    <TabsTrigger value="insights">Regional Insights</TabsTrigger>
                    <TabsTrigger value="challenges">Challenges & Opportunities</TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p>{snapshot.summary}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <h3 className="font-semibold mb-2">Current Market Size</h3>
                        <p className="text-muted-foreground">{snapshot.marketSizeData.currentSize}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Projected Growth</h3>
                        <p className="text-muted-foreground">{snapshot.marketSizeData.projectedGrowth}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">CAGR</h3>
                        <p className="text-muted-foreground">{snapshot.marketSizeData.cagr}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Top Players</h3>
                        <p className="text-muted-foreground">
                          {snapshot.topPlayers.slice(0, 3).map(player => player.name).join(", ")}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="trends">
                    <Accordion type="single" collapsible className="w-full">
                      {snapshot.keyTrends.map((trend, index) => (
                        <AccordionItem key={index} value={`trend-${index}`}>
                          <AccordionTrigger className="text-left">
                            {trend.title}
                            <ImpactBadge impact={trend.impact} />
                          </AccordionTrigger>
                          <AccordionContent>
                            <p>{trend.description}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </TabsContent>

                  <TabsContent value="market">
                    <div className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle>Market Size Data</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-muted rounded-lg">
                              <h3 className="font-semibold">Current Market Size</h3>
                              <p className="text-2xl font-bold mt-2">{snapshot.marketSizeData.currentSize}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                              <h3 className="font-semibold">Projected Growth</h3>
                              <p className="text-2xl font-bold mt-2">{snapshot.marketSizeData.projectedGrowth}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                              <h3 className="font-semibold">CAGR</h3>
                              <p className="text-2xl font-bold mt-2">{snapshot.marketSizeData.cagr}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="players">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {snapshot.topPlayers.map((player, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle>{player.name}</CardTitle>
                            {player.marketShare && (
                              <CardDescription>Market Share: {player.marketShare}</CardDescription>
                            )}
                          </CardHeader>
                          <CardContent>
                            <div>
                              <h4 className="font-semibold mb-2">Key Strengths</h4>
                              <div className="flex flex-wrap gap-2">
                                {player.strengthAreas.map((area, idx) => (
                                  <Badge key={idx} variant="outline">
                                    {area}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="tech">
                    <div className="space-y-4">
                      {snapshot.emergingTechnologies.map((tech, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span>{tech.name}</span>
                              <div className="flex gap-2">
                                <AdoptionStageBadge stage={tech.adoptionStage} />
                                <ImpactBadge impact={tech.potentialImpact} />
                              </div>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>{tech.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="insights">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(snapshot.regionalInsights).map(([region, insight], index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle>{region}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>{insight}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="challenges">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Challenges</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc pl-5 space-y-2">
                            {snapshot.challenges.map((challenge, index) => (
                              <li key={index}>{challenge}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Opportunities</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="list-disc pl-5 space-y-2">
                            {snapshot.opportunities.map((opportunity, index) => (
                              <li key={index}>{opportunity}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setSnapshot(null)}>
                  Start New Analysis
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Industry Trend Snapshot</CardTitle>
                <CardDescription>
                  Fill in the form on the left and click "Generate Trend Snapshot" to see your insights here.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-12">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">
                    Get instant access to comprehensive industry analysis, market size data,
                    key trends, and competitive landscape.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Powered by advanced AI to deliver accurate and up-to-date insights.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}