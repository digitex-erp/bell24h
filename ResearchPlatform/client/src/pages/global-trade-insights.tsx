import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Download, 
  Filter, 
  MapPin, 
  TrendingUp, 
  Package, 
  BarChart2, 
  Users 
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// Define type interfaces
interface Country {
  id: number;
  name: string;
  code: string;
}

interface Industry {
  id: number;
  name: string;
  sector: string;
}

interface ImportExportData {
  country: string;
  year: number;
  exportValue: number;
  importValue: number;
  tradeBalance: number;
  topExportPartners: string[];
  topImportPartners: string[];
  topExportCategories: string[];
  topImportCategories: string[];
  exportGrowth: number;
  importGrowth: number;
}

interface IndustryTradeData {
  industry: string;
  globalExports: number;
  globalImports: number;
  topExportingCountries: Array<{country: string, value: number}>;
  topImportingCountries: Array<{country: string, value: number}>;
  growthRate: number;
  marketSize: number;
  futureOutlook: string;
  regulatoryConsiderations: string[];
}

interface TradeOpportunity {
  id?: number;
  country: string;
  industry: string;
  title?: string;
  description?: string;
  opportunityType: 'export' | 'import' | 'partnership';
  potentialValue: number;
  growthPotential: 'high' | 'medium' | 'low';
  entryBarriers: string[];
  competitiveAdvantage: string;
  recommendedApproach: string;
  businessSize?: 'micro' | 'small' | 'medium';
  timeframe?: 'short' | 'medium' | 'long';
  riskLevel?: 'high' | 'medium' | 'low';
}

interface SMETradeData {
  country: string;
  industry: string;
  year: number;
  exportValue: number;
  importValue: number;
  marketSize: number;
  growthRate: number;
  exportBarriers: string[];
  importBarriers: string[];
  topMarkets: { market: string; potential: number; }[];
  competitivePosition: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  regulatoryInfo: {
    requirements: string[];
    certifications: string[];
    customsProcedures: string[];
  };
  businessSizeApplicability: ('micro' | 'small' | 'medium')[];
}

interface SMETradeInsight {
  industry: string;
  businessSize: 'micro' | 'small' | 'medium';
  marketEntryStrategies: string[];
  financingOptions: string[];
  logisticsConsiderations: string[];
  regulatoryRequirements: string[];
  commonPitfalls: string[];
  successFactors: string[];
  caseStudies?: string[];
  recommendedApproach: string;
}

// Component for Global Trade Insights
export default function GlobalTradeInsights() {
  // State for filters
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<number | null>(null);
  const [selectedBusinessSize, setSelectedBusinessSize] = useState<'micro' | 'small' | 'medium'>('small');
  const [selectedOpportunityType, setSelectedOpportunityType] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch countries
  const { data: countries, isLoading: isLoadingCountries } = useQuery({
    queryKey: ['/api/global-trade/countries'],
    enabled: true,
  });

  // Fetch industries
  const { data: industries, isLoading: isLoadingIndustries } = useQuery({
    queryKey: ['/api/global-trade/industries'],
    enabled: true,
  });

  // Fetch trade opportunities based on filters
  const { data: opportunities, isLoading: isLoadingOpportunities } = useQuery({
    queryKey: ['/api/global-trade/opportunities', selectedIndustry, selectedCountry, selectedOpportunityType, selectedBusinessSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedIndustry) params.append('industry', selectedIndustry.toString());
      if (selectedCountry) params.append('country', selectedCountry.toString());
      if (selectedOpportunityType) params.append('type', selectedOpportunityType);
      if (selectedBusinessSize) params.append('size', selectedBusinessSize);
      
      const response = await apiRequest('GET', `/api/global-trade/opportunities?${params.toString()}`);
      return await response.json();
    },
    enabled: true,
  });

  // Fetch SME trade data when industry is selected
  const { data: smeTradeData, isLoading: isLoadingSMEData } = useQuery({
    queryKey: ['/api/global-trade/industries/sme-trade-data', selectedIndustry, selectedCountry, selectedBusinessSize],
    queryFn: async () => {
      if (!selectedIndustry) return null;
      
      const params = new URLSearchParams();
      if (selectedCountry) params.append('country', selectedCountry.toString());
      if (selectedBusinessSize) params.append('size', selectedBusinessSize);
      
      const response = await apiRequest('GET', `/api/global-trade/industries/${selectedIndustry}/sme-trade-data?${params.toString()}`);
      return await response.json();
    },
    enabled: !!selectedIndustry,
  });

  // Fetch SME insights when industry is selected
  const { data: smeInsights, isLoading: isLoadingSMEInsights } = useQuery({
    queryKey: ['/api/global-trade/industries/sme-insights', selectedIndustry, selectedBusinessSize],
    queryFn: async () => {
      if (!selectedIndustry) return null;
      
      const params = new URLSearchParams();
      params.append('size', selectedBusinessSize);
      
      const response = await apiRequest('GET', `/api/global-trade/industries/${selectedIndustry}/sme-insights?${params.toString()}`);
      return await response.json();
    },
    enabled: !!selectedIndustry,
  });

  // Export data function
  const exportData = () => {
    if (!smeTradeData) {
      toast({
        title: "No data to export",
        description: "Please select an industry to generate data first.",
        variant: "destructive",
      });
      return;
    }

    // Prepare data for export
    const exportObj = {
      tradeData: smeTradeData,
      insights: smeInsights,
      opportunities: opportunities,
      generatedAt: new Date().toISOString(),
      filters: {
        industry: selectedIndustry ? industries?.find(i => i.id === selectedIndustry)?.name : 'All Industries',
        country: selectedCountry ? countries?.find(c => c.id === selectedCountry)?.name : 'Global',
        businessSize: selectedBusinessSize,
        opportunityType: selectedOpportunityType || 'All Types'
      }
    };

    // Convert to JSON and create download link
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `global-trade-insights_${new Date().toISOString()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast({
      title: "Export successful",
      description: "Your trade insights data has been exported.",
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Global Trade Insights</h1>
          <p className="text-muted-foreground">
            Comprehensive import/export data with SME-specific insights
          </p>
        </div>
        <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
          <Download size={16} />
          Export Data
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filters</CardTitle>
            <Filter size={18} />
          </div>
          <CardDescription>Customize your trade insights view</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Industry</label>
              <Select
                value={selectedIndustry?.toString() || ""}
                onValueChange={(value) => setSelectedIndustry(value ? parseInt(value) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Industries</SelectItem>
                  {!isLoadingIndustries &&
                    industries?.map((industry: Industry) => (
                      <SelectItem key={industry.id} value={industry.id.toString()}>
                        {industry.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Country</label>
              <Select
                value={selectedCountry?.toString() || ""}
                onValueChange={(value) => setSelectedCountry(value ? parseInt(value) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Global</SelectItem>
                  {!isLoadingCountries &&
                    countries?.map((country: Country) => (
                      <SelectItem key={country.id} value={country.id.toString()}>
                        {country.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Business Size</label>
              <Select
                value={selectedBusinessSize}
                onValueChange={(value: 'micro' | 'small' | 'medium') => setSelectedBusinessSize(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="micro">Micro Enterprise</SelectItem>
                  <SelectItem value="small">Small Enterprise</SelectItem>
                  <SelectItem value="medium">Medium Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Opportunity Type</label>
              <Select
                value={selectedOpportunityType || ""}
                onValueChange={(value) => setSelectedOpportunityType(value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                  <SelectItem value="import">Import</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="sme-opportunities">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 mb-6">
          <TabsTrigger value="sme-opportunities">SME Opportunities</TabsTrigger>
          <TabsTrigger value="market-analysis">Market Analysis</TabsTrigger>
          <TabsTrigger value="trade-strategies">Trade Strategies</TabsTrigger>
        </TabsList>

        {/* SME Opportunities Tab */}
        <TabsContent value="sme-opportunities">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp size={20} />
                  Trade Opportunities
                </CardTitle>
                <CardDescription>
                  Matching opportunities for {selectedBusinessSize} businesses
                  {selectedIndustry ? ` in ${industries?.find((i: Industry) => i.id === selectedIndustry)?.name}` : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingOpportunities ? (
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : opportunities?.length > 0 ? (
                  <div className="space-y-4">
                    {opportunities.map((opportunity: TradeOpportunity, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">
                            {opportunity.title || `${opportunity.opportunityType.charAt(0).toUpperCase() + opportunity.opportunityType.slice(1)} Opportunity in ${opportunity.country}`}
                          </h3>
                          <Badge variant={
                            opportunity.opportunityType === 'export' ? 'default' : 
                            opportunity.opportunityType === 'import' ? 'secondary' : 'outline'
                          }>
                            {opportunity.opportunityType}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-3">
                          {opportunity.description || `${opportunity.industry} opportunity in ${opportunity.country} with ${opportunity.growthPotential} growth potential`}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                          <div>
                            <span className="font-medium">Industry:</span> {opportunity.industry}
                          </div>
                          <div>
                            <span className="font-medium">Country:</span> {opportunity.country}
                          </div>
                          <div>
                            <span className="font-medium">Potential Value:</span> ${opportunity.potentialValue.toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Growth:</span> {opportunity.growthPotential}
                          </div>
                        </div>
                        
                        {opportunity.entryBarriers && opportunity.entryBarriers.length > 0 && (
                          <div className="mb-2">
                            <span className="font-medium">Entry Barriers:</span> {opportunity.entryBarriers.join(', ')}
                          </div>
                        )}
                        
                        {opportunity.competitiveAdvantage && (
                          <div className="mb-2">
                            <span className="font-medium">Competitive Advantage:</span> {opportunity.competitiveAdvantage}
                          </div>
                        )}
                        
                        {opportunity.recommendedApproach && (
                          <div>
                            <span className="font-medium">Recommended Approach:</span> {opportunity.recommendedApproach}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No trade opportunities found for the selected filters.</p>
                    <p className="text-sm">Try adjusting your filters to see more results.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 size={20} />
                  Import/Export Summary
                </CardTitle>
                <CardDescription>
                  Key trade metrics for {selectedBusinessSize} businesses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSMEData ? (
                  <div className="space-y-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : smeTradeData ? (
                  <div className="space-y-4">
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            {
                              name: 'Exports',
                              value: smeTradeData[0].exportValue
                            },
                            {
                              name: 'Imports',
                              value: smeTradeData[0].importValue
                            }
                          ]}
                          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
                          <Bar dataKey="value" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Market Size</h4>
                      <p className="text-2xl font-bold">${smeTradeData[0].marketSize.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        Growth rate: {smeTradeData[0].growthRate >= 0 ? '+' : ''}{smeTradeData[0].growthRate}%
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Top Markets</h4>
                      {smeTradeData[0].topMarkets.length > 0 ? (
                        <ul className="space-y-1">
                          {smeTradeData[0].topMarkets.slice(0, 3).map((market, index) => (
                            <li key={index} className="flex justify-between">
                              <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {market.market}
                              </span>
                              <span className="text-muted-foreground">${market.potential.toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No market data available</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">Select an industry to see import/export data</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* SWOT Analysis */}
          {smeTradeData && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>SWOT Analysis</CardTitle>
                <CardDescription>
                  Competitive position analysis for {selectedBusinessSize} businesses in {selectedIndustry ? industries?.find((i: Industry) => i.id === selectedIndustry)?.name : 'selected industry'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
                    <h3 className="font-semibold text-lg mb-2">Strengths</h3>
                    {smeTradeData[0].competitivePosition.strengths.length > 0 ? (
                      <ul className="space-y-1 list-disc list-inside">
                        {smeTradeData[0].competitivePosition.strengths.map((strength, index) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No strengths identified</p>
                    )}
                  </div>

                  <div className="border rounded-lg p-4 bg-red-50 dark:bg-red-950/20">
                    <h3 className="font-semibold text-lg mb-2">Weaknesses</h3>
                    {smeTradeData[0].competitivePosition.weaknesses.length > 0 ? (
                      <ul className="space-y-1 list-disc list-inside">
                        {smeTradeData[0].competitivePosition.weaknesses.map((weakness, index) => (
                          <li key={index}>{weakness}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No weaknesses identified</p>
                    )}
                  </div>

                  <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20">
                    <h3 className="font-semibold text-lg mb-2">Opportunities</h3>
                    {smeTradeData[0].competitivePosition.opportunities.length > 0 ? (
                      <ul className="space-y-1 list-disc list-inside">
                        {smeTradeData[0].competitivePosition.opportunities.map((opportunity, index) => (
                          <li key={index}>{opportunity}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No opportunities identified</p>
                    )}
                  </div>

                  <div className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-950/20">
                    <h3 className="font-semibold text-lg mb-2">Threats</h3>
                    {smeTradeData[0].competitivePosition.threats.length > 0 ? (
                      <ul className="space-y-1 list-disc list-inside">
                        {smeTradeData[0].competitivePosition.threats.map((threat, index) => (
                          <li key={index}>{threat}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No threats identified</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Market Analysis Tab */}
        <TabsContent value="market-analysis">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package size={20} />
                  Trade Barriers
                </CardTitle>
                <CardDescription>
                  Import and export barriers for SMEs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSMEData ? (
                  <div className="space-y-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                  </div>
                ) : smeTradeData ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Export Barriers</h3>
                      {smeTradeData[0].exportBarriers.length > 0 ? (
                        <ul className="space-y-1 list-disc list-inside">
                          {smeTradeData[0].exportBarriers.map((barrier, index) => (
                            <li key={index}>{barrier}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground">No significant export barriers identified</p>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold text-lg mb-2">Import Barriers</h3>
                      {smeTradeData[0].importBarriers.length > 0 ? (
                        <ul className="space-y-1 list-disc list-inside">
                          {smeTradeData[0].importBarriers.map((barrier, index) => (
                            <li key={index}>{barrier}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground">No significant import barriers identified</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">Select an industry to see trade barriers</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={20} />
                  Market Applicability
                </CardTitle>
                <CardDescription>
                  Regulatory and business size considerations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSMEData ? (
                  <div className="space-y-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                  </div>
                ) : smeTradeData ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Regulatory Requirements</h3>
                      {smeTradeData[0].regulatoryInfo.requirements.length > 0 ? (
                        <ul className="space-y-1 list-disc list-inside">
                          {smeTradeData[0].regulatoryInfo.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground">No specific regulatory requirements</p>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold text-lg mb-2">Required Certifications</h3>
                      {smeTradeData[0].regulatoryInfo.certifications.length > 0 ? (
                        <ul className="space-y-1 list-disc list-inside">
                          {smeTradeData[0].regulatoryInfo.certifications.map((cert, index) => (
                            <li key={index}>{cert}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground">No specific certifications required</p>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold text-lg mb-2">Business Size Applicability</h3>
                      <div className="flex gap-2 flex-wrap">
                        {smeTradeData[0].businessSizeApplicability.map((size, index) => (
                          <Badge key={index} variant={size === selectedBusinessSize ? 'default' : 'outline'}>
                            {size.charAt(0).toUpperCase() + size.slice(1)} Enterprise
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">Select an industry to see market applicability</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Markets Analysis */}
          {smeTradeData && smeTradeData[0].topMarkets.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Top Markets Analysis</CardTitle>
                <CardDescription>
                  Most promising markets for {selectedBusinessSize} businesses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={smeTradeData[0].topMarkets}
                        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="market" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Market Potential']} />
                        <Legend />
                        <Bar dataKey="potential" name="Market Potential" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-4">Market Analysis</h3>
                    <div className="space-y-4">
                      {smeTradeData[0].topMarkets.map((market, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex justify-between mb-1">
                            <h4 className="font-medium">{market.market}</h4>
                            <span className="font-semibold">${market.potential.toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {index === 0 
                              ? `Primary target market with highest potential for ${selectedBusinessSize} enterprises.`
                              : index === 1
                              ? `Secondary market with good growth prospects for ${selectedIndustry ? industries?.find((i: Industry) => i.id === selectedIndustry)?.name : 'this industry'}.`
                              : `Emerging opportunity with developing potential.`
                            }
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Trade Strategies Tab */}
        <TabsContent value="trade-strategies">
          {isLoadingSMEInsights ? (
            <div className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : smeInsights ? (
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Market Entry Strategies</CardTitle>
                  <CardDescription>
                    Recommended approaches for {smeInsights.businessSize} businesses in {smeInsights.industry}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {smeInsights.marketEntryStrategies.length > 0 ? (
                      <ul className="space-y-2 list-disc list-inside">
                        {smeInsights.marketEntryStrategies.map((strategy, index) => (
                          <li key={index}>{strategy}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No specific strategies recommended</p>
                    )}
                    
                    <Separator />
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Recommended Approach</h3>
                      <p>{smeInsights.recommendedApproach}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Financing Options</CardTitle>
                    <CardDescription>
                      Available funding sources for international trade
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {smeInsights.financingOptions.length > 0 ? (
                      <ul className="space-y-2 list-disc list-inside">
                        {smeInsights.financingOptions.map((option, index) => (
                          <li key={index}>{option}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No specific financing options available</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Logistics Considerations</CardTitle>
                    <CardDescription>
                      Key supply chain and logistics factors
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {smeInsights.logisticsConsiderations.length > 0 ? (
                      <ul className="space-y-2 list-disc list-inside">
                        {smeInsights.logisticsConsiderations.map((consideration, index) => (
                          <li key={index}>{consideration}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No specific logistics considerations identified</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Common Pitfalls</CardTitle>
                    <CardDescription>
                      Mistakes to avoid when entering international markets
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {smeInsights.commonPitfalls.length > 0 ? (
                      <ul className="space-y-2 list-disc list-inside">
                        {smeInsights.commonPitfalls.map((pitfall, index) => (
                          <li key={index}>{pitfall}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No specific pitfalls identified</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Success Factors</CardTitle>
                    <CardDescription>
                      Critical elements for trade success
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {smeInsights.successFactors.length > 0 ? (
                      <ul className="space-y-2 list-disc list-inside">
                        {smeInsights.successFactors.map((factor, index) => (
                          <li key={index}>{factor}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No specific success factors identified</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {smeInsights.caseStudies && smeInsights.caseStudies.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Case Studies</CardTitle>
                    <CardDescription>
                      Real-world examples of successful market entry
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {smeInsights.caseStudies.map((caseStudy, index) => (
                        <li key={index} className="border rounded-lg p-3">
                          <h4 className="font-medium mb-1">Case Study {index + 1}</h4>
                          <p>{caseStudy}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Select an industry to view trade strategies</p>
              <p className="text-sm">Strategies will be tailored to your selected business size and industry</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}