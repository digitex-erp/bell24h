import { useState, useEffect, useRef } from "react";
import { useAnalytics } from "@/hooks/use-analytics";
import { useRFQs } from "@/hooks/use-rfqs";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Chart from "chart.js/auto";
import { 
  BarChart,
  ChartLine,
  BarChart2,
  TrendingUp, 
  AlertTriangle, 
  Users, 
  ShieldCheck,
  ExternalLink,
  ArrowRight
} from "lucide-react";

// Industry options for market insights
const INDUSTRIES = [
  "Manufacturing",
  "Electronics",
  "IT Services",
  "Healthcare",
  "Automotive",
  "Construction",
  "Pharmaceuticals",
  "Retail",
  "Energy",
  "Telecommunications",
];

export default function AnalyticsPage() {
  const { rfqs } = useRFQs();
  const { getSupplierRisk, getMarketInsights, verifyBlockchainTransaction } = useAnalytics();
  
  const [selectedIndustry, setSelectedIndustry] = useState("Manufacturing");
  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(1); // Default to first supplier
  const [blockchainHash, setBlockchainHash] = useState("");
  
  // Get supplier risk data
  const { 
    data: supplierRiskData, 
    isLoading: isLoadingSupplierRisk 
  } = getSupplierRisk(selectedSupplierId);
  
  // Get market insights
  const { 
    data: marketInsights, 
    isLoading: isLoadingMarketInsights 
  } = getMarketInsights(selectedIndustry);
  
  // Get blockchain verification
  const { 
    data: blockchainData, 
    isLoading: isLoadingBlockchain 
  } = verifyBlockchainTransaction(blockchainHash);
  
  // Chart refs
  const rfqStatusChartRef = useRef<HTMLCanvasElement>(null);
  const rfqCategoryChartRef = useRef<HTMLCanvasElement>(null);
  const rfqTrendChartRef = useRef<HTMLCanvasElement>(null);
  
  // Chart instances
  const rfqStatusChartInstance = useRef<Chart | null>(null);
  const rfqCategoryChartInstance = useRef<Chart | null>(null);
  const rfqTrendChartInstance = useRef<Chart | null>(null);
  
  // Initialize and update RFQ Status chart
  useEffect(() => {
    if (!rfqStatusChartRef.current || !rfqs.length) return;
    
    // Count RFQs by status
    const statusCounts = {
      draft: 0,
      open: 0,
      in_review: 0,
      awarded: 0,
      closed: 0,
      cancelled: 0
    };
    
    rfqs.forEach(rfq => {
      if (statusCounts.hasOwnProperty(rfq.status)) {
        statusCounts[rfq.status as keyof typeof statusCounts]++;
      }
    });
    
    // Destroy previous chart instance if it exists
    if (rfqStatusChartInstance.current) {
      rfqStatusChartInstance.current.destroy();
    }
    
    // Create new chart instance
    const ctx = rfqStatusChartRef.current.getContext('2d');
    if (!ctx) return;
    
    rfqStatusChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(statusCounts).map(status => 
          status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
        ),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: [
            'rgba(156, 163, 175, 0.7)', // draft - gray
            'rgba(59, 130, 246, 0.7)',  // open - blue
            'rgba(245, 158, 11, 0.7)',  // in_review - amber
            'rgba(16, 185, 129, 0.7)',  // awarded - green
            'rgba(107, 114, 128, 0.7)', // closed - gray
            'rgba(239, 68, 68, 0.7)',   // cancelled - red
          ],
          borderWidth: 1,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
          }
        }
      }
    });
    
    // Cleanup function
    return () => {
      if (rfqStatusChartInstance.current) {
        rfqStatusChartInstance.current.destroy();
      }
    };
  }, [rfqs]);
  
  // Initialize and update RFQ Category chart
  useEffect(() => {
    if (!rfqCategoryChartRef.current || !rfqs.length) return;
    
    // Count RFQs by category
    const categoryCounts: Record<string, number> = {};
    
    rfqs.forEach(rfq => {
      categoryCounts[rfq.category] = (categoryCounts[rfq.category] || 0) + 1;
    });
    
    // Sort categories by count (descending)
    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6); // Take top 6 categories
    
    // Destroy previous chart instance if it exists
    if (rfqCategoryChartInstance.current) {
      rfqCategoryChartInstance.current.destroy();
    }
    
    // Create new chart instance
    const ctx = rfqCategoryChartRef.current.getContext('2d');
    if (!ctx) return;
    
    rfqCategoryChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sortedCategories.map(([category]) => category),
        datasets: [{
          label: 'Number of RFQs',
          data: sortedCategories.map(([, count]) => count),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
    
    // Cleanup function
    return () => {
      if (rfqCategoryChartInstance.current) {
        rfqCategoryChartInstance.current.destroy();
      }
    };
  }, [rfqs]);
  
  // Initialize and update RFQ Trend chart
  useEffect(() => {
    if (!rfqTrendChartRef.current || !rfqs.length) return;
    
    // Group RFQs by month
    const rfqsByMonth: Record<string, number> = {};
    
    // Get last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = date.toISOString().substring(0, 7); // YYYY-MM format
      rfqsByMonth[monthKey] = 0;
    }
    
    // Count RFQs by month
    rfqs.forEach(rfq => {
      const month = new Date(rfq.created_at).toISOString().substring(0, 7);
      if (rfqsByMonth.hasOwnProperty(month)) {
        rfqsByMonth[month]++;
      }
    });
    
    // Prepare chart data
    const labels = Object.keys(rfqsByMonth).map(month => {
      const [year, monthNum] = month.split('-');
      return `${new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString('default', { month: 'short' })} ${year}`;
    });
    
    const data = Object.values(rfqsByMonth);
    
    // Destroy previous chart instance if it exists
    if (rfqTrendChartInstance.current) {
      rfqTrendChartInstance.current.destroy();
    }
    
    // Create new chart instance
    const ctx = rfqTrendChartRef.current.getContext('2d');
    if (!ctx) return;
    
    rfqTrendChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'RFQs Created',
          data: data,
          fill: false,
          borderColor: 'rgb(59, 130, 246)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
    
    // Cleanup function
    return () => {
      if (rfqTrendChartInstance.current) {
        rfqTrendChartInstance.current.destroy();
      }
    };
  }, [rfqs]);
  
  // Format risk score to have appropriate color
  const getRiskScoreColor = (score: number) => {
    if (score <= 20) return "text-green-600";
    if (score <= 50) return "text-amber-600";
    return "text-red-600";
  };
  
  // Handle blockchain hash input
  const handleBlockchainVerify = (hash: string) => {
    setBlockchainHash(hash);
  };
  
  return (
    <MainLayout
      title="Analytics"
      description="Gain insights into your marketplace activities and supplier performance."
    >
      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="supplier">Supplier Risk</TabsTrigger>
          <TabsTrigger value="market">Market Insights</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain Verification</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* RFQ Status Chart */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2 text-primary-600" />
                  RFQ Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <canvas ref={rfqStatusChartRef}></canvas>
                </div>
              </CardContent>
            </Card>
            
            {/* RFQ Category Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-primary-600" />
                  Top Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <canvas ref={rfqCategoryChartRef}></canvas>
                </div>
              </CardContent>
            </Card>
            
            {/* RFQ Trend Chart */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
                  RFQ Trend
                </CardTitle>
                <CardDescription>Number of RFQs created over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <canvas ref={rfqTrendChartRef}></canvas>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Supplier Risk Tab */}
        <TabsContent value="supplier">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Supplier Selection</CardTitle>
                <CardDescription>Select a supplier to view risk analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedSupplierId.toString()} 
                  onValueChange={(value) => setSelectedSupplierId(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">TechSolutions Ltd</SelectItem>
                    <SelectItem value="2">MegaSupplies Inc</SelectItem>
                    <SelectItem value="3">Acme Manufacturing</SelectItem>
                    <SelectItem value="4">Global Logistics</SelectItem>
                    <SelectItem value="5">QuickShip Partners</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShieldCheck className="h-5 w-5 mr-2 text-primary-600" />
                  Supplier Risk Analysis
                </CardTitle>
                {!isLoadingSupplierRisk && supplierRiskData && (
                  <CardDescription>
                    Risk analysis for {supplierRiskData.supplier} ({supplierRiskData.company})
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {isLoadingSupplierRisk ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : supplierRiskData ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Risk Score</p>
                        <p className={`text-3xl font-bold ${getRiskScoreColor(supplierRiskData.risk_score)}`}>
                          {supplierRiskData.risk_score}/100
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={supplierRiskData.risk_score <= 20 ? "success" : 
                                        supplierRiskData.risk_score <= 50 ? "warning" : "destructive"}>
                          {supplierRiskData.risk_score <= 20 ? "Low Risk" : 
                           supplierRiskData.risk_score <= 50 ? "Medium Risk" : "High Risk"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Analysis</p>
                      <p className="text-sm text-gray-700">{supplierRiskData.analysis}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Risk Factors</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {supplierRiskData.risk_factors.map((factor, index) => (
                          <li key={index} className="text-sm text-gray-700">{factor}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Recommendations</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {supplierRiskData.recommendations.map((recommendation, index) => (
                          <li key={index} className="text-sm text-gray-700">{recommendation}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48">
                    <p className="text-gray-500">Select a supplier to view risk analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Market Insights Tab */}
        <TabsContent value="market">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Industry Selection</CardTitle>
                <CardDescription>Select an industry to view market insights</CardDescription>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedIndustry} 
                  onValueChange={setSelectedIndustry}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map(industry => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
                  Market Insights
                </CardTitle>
                {!isLoadingMarketInsights && marketInsights && (
                  <CardDescription>
                    Market analysis for the {selectedIndustry} industry
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {isLoadingMarketInsights ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : marketInsights ? (
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Summary</p>
                      <p className="text-sm text-gray-700">{marketInsights.summary}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Current Trends</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {marketInsights.trends.map((trend, index) => (
                            <li key={index} className="text-sm text-gray-700">{trend}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Opportunities</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {marketInsights.opportunities.map((opportunity, index) => (
                            <li key={index} className="text-sm text-gray-700">{opportunity}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Risks</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {marketInsights.risks.map((risk, index) => (
                            <li key={index} className="text-sm text-gray-700">{risk}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Key Players</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {marketInsights.key_players.map((player, index) => (
                            <li key={index} className="text-sm text-gray-700">{player}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48">
                    <p className="text-gray-500">Select an industry to view market insights</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Blockchain Verification Tab */}
        <TabsContent value="blockchain">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ChartLine className="h-5 w-5 mr-2 text-primary-600" />
                Blockchain Transaction Verification
              </CardTitle>
              <CardDescription>
                Verify the authenticity of RFQs, contracts, and payments using their blockchain hash
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction Hash
                    </label>
                    <Input 
                      value={blockchainHash}
                      onChange={(e) => setBlockchainHash(e.target.value)}
                      placeholder="Enter blockchain hash to verify"
                    />
                  </div>
                  <Button 
                    onClick={() => handleBlockchainVerify(blockchainHash)}
                    disabled={!blockchainHash}
                  >
                    Verify
                  </Button>
                </div>
                
                {isLoadingBlockchain ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : blockchainData ? (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="success">Verified</Badge>
                      <p className="text-sm font-medium text-gray-900">Transaction Found on Blockchain</p>
                    </div>
                    
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Hash</TableCell>
                          <TableCell className="font-mono text-xs break-all">
                            {blockchainData.hash}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Timestamp</TableCell>
                          <TableCell>{blockchainData.timestamp}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Status</TableCell>
                          <TableCell>{blockchainData.status}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Block Number</TableCell>
                          <TableCell>{blockchainData.blockNumber}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Network</TableCell>
                          <TableCell>{blockchainData.networkName}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        View on Explorer
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : blockchainHash ? (
                  <div className="bg-red-50 p-4 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Transaction Not Found</p>
                      <p className="text-sm text-red-700 mt-1">
                        The hash you entered was not found on the blockchain. Please check the hash and try again.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-lg flex flex-col items-center justify-center text-center">
                    <div className="bg-primary-100 p-3 rounded-full mb-3">
                      <ChartLine className="h-6 w-6 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Verify Blockchain Transactions</h3>
                    <p className="text-sm text-gray-500 mb-4 max-w-md">
                      Enter a blockchain hash from an RFQ, contract, or payment to verify its authenticity and view transaction details.
                    </p>
                    <Button
                      variant="link"
                      className="flex items-center gap-1 text-primary-600"
                      onClick={() => setBlockchainHash("0x8f942d9e5b8c9f1b8f0bed35ed89e7fac7d50c798be1c14e9aa4e0a1d6973b5c")}
                    >
                      Use sample hash
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <FileCheck className="h-4 w-4 mr-2 text-primary-600" />
                  RFQ Verifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{rfqs.filter(rfq => rfq.blockchain_hash).length}</p>
                <p className="text-sm text-gray-500">RFQs with blockchain verification</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <FileCheck className="h-4 w-4 mr-2 text-primary-600" />
                  Contract Verifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-gray-500">Contracts with blockchain verification</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <FileCheck className="h-4 w-4 mr-2 text-primary-600" />
                  Payment Verifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">28</p>
                <p className="text-sm text-gray-500">Payments with blockchain verification</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}

// Helper components
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    />
  );
}
