import React, { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { createCharts, createSupplyChainChart, createRfqSuccessPredictionChart, createVolatilityChart } from '@/lib/charts';
import { 
  ChevronRightIcon, 
  BarChart3Icon, 
  TrendingUpIcon, 
  BoxesIcon, 
  ArrowDownIcon, 
  ArrowUpIcon, 
  InfoIcon, 
  FilePieChartIcon,
  BoxIcon
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface IndustryTrend {
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  score: number;
}

interface MarketInsight {
  industry: string;
  trend: IndustryTrend;
  volatility: string;
  forecast: string;
  priceLevel: string;
}

const AnalyticsDashboard: React.FC = () => {
  const [selectedIndustry, setSelectedIndustry] = useState('Electronics');
  const [activeTab, setActiveTab] = useState('market');
  
  // Chart refs
  const rfqSuccessChartRef = useRef<HTMLCanvasElement>(null);
  const supplierRiskChartRef = useRef<HTMLCanvasElement>(null);
  const marketTrendsChartRef = useRef<HTMLCanvasElement>(null);
  const supplyChainChartRef = useRef<HTMLCanvasElement>(null);
  const rfqPredictionChartRef = useRef<HTMLCanvasElement>(null);
  const volatilityChartRef = useRef<HTMLCanvasElement>(null);

  // Get market trends for Electronics industry
  const { data: electronicsTrends, isLoading: isLoadingElectronics } = useQuery({
    queryKey: ['/api/market/trends/Electronics'],
  });

  // Get market trends for selected industry
  const { data: selectedIndustryTrends, isLoading: isLoadingSelectedIndustry } = useQuery({
    queryKey: [`/api/market/trends/${selectedIndustry}`],
    enabled: selectedIndustry !== 'Electronics',
  });

  // Get supply chain forecasting data
  const { data: supplyChainData, isLoading: isLoadingSupplyChain } = useQuery({
    queryKey: [`/api/analytics/supply-chain-forecast/${selectedIndustry}`],
  });

  // Get RFQ success prediction data
  const { data: rfqSuccessPredictionData, isLoading: isLoadingRfqPrediction } = useQuery({
    queryKey: ['/api/analytics/rfq-success-prediction', { industry: selectedIndustry }],
  });

  // Get market volatility data
  const { data: marketVolatilityData, isLoading: isLoadingVolatility } = useQuery({
    queryKey: ['/api/analytics/market-volatility'],
  });

  // Get enhanced stock trends
  const { data: stockTrendsData, isLoading: isLoadingStockTrends } = useQuery({
    queryKey: [`/api/analytics/stock-trends/${selectedIndustry}`],
  });

  // Get Indian sector indices
  const { data: indianSectorsData, isLoading: isLoadingIndianSectors } = useQuery({
    queryKey: ['/api/analytics/indian-sectors'],
  });

  // Create main charts when data is available
  useEffect(() => {
    if (rfqSuccessChartRef.current && supplierRiskChartRef.current && marketTrendsChartRef.current) {
      createCharts({
        rfqSuccessChartRef: rfqSuccessChartRef.current,
        supplierRiskChartRef: supplierRiskChartRef.current,
        marketTrendsChartRef: marketTrendsChartRef.current,
        marketTrendsData: {
          electronics: electronicsTrends?.data || null,
          industrial: selectedIndustryTrends?.data || null,
        },
      });
    }
  }, [electronicsTrends, selectedIndustryTrends]);

  // Create supply chain chart
  useEffect(() => {
    if (supplyChainChartRef.current && supplyChainData && !isLoadingSupplyChain) {
      createSupplyChainChart(supplyChainChartRef.current, supplyChainData);
    }
  }, [supplyChainData, isLoadingSupplyChain]);

  // Create RFQ success prediction chart
  useEffect(() => {
    if (rfqPredictionChartRef.current && rfqSuccessPredictionData && !isLoadingRfqPrediction) {
      createRfqSuccessPredictionChart(rfqPredictionChartRef.current, rfqSuccessPredictionData);
    }
  }, [rfqSuccessPredictionData, isLoadingRfqPrediction]);

  // Create volatility chart
  useEffect(() => {
    if (volatilityChartRef.current && marketVolatilityData && !isLoadingVolatility) {
      createVolatilityChart(volatilityChartRef.current, marketVolatilityData);
    }
  }, [marketVolatilityData, isLoadingVolatility]);

  // Industry options
  const industries = [
    'Electronics',
    'Manufacturing',
    'Chemicals',
    'Textiles',
    'Auto',
    'Pharmaceuticals',
    'Energy',
    'Finance',
    'Technology',
    'Retail',
  ];

  // Helper function to render trend indicator
  const renderTrendIndicator = (trend: string, value: number) => {
    if (trend === 'up') {
      return (
        <div className="flex items-center text-green-600">
          <ArrowUpIcon className="h-4 w-4 mr-1" />
          <span>{value}%</span>
        </div>
      );
    } else if (trend === 'down') {
      return (
        <div className="flex items-center text-red-600">
          <ArrowDownIcon className="h-4 w-4 mr-1" />
          <span>{value}%</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-gray-600">
          <span>→ {value}%</span>
        </div>
      );
    }
  };

  // Market insights from stock data
  const marketInsights: Record<string, MarketInsight> = {
    'Electronics': {
      industry: 'Electronics',
      trend: { trend: 'up', percentage: 3.2, score: 78 },
      volatility: 'Low',
      forecast: 'Positive',
      priceLevel: 'High',
    },
    'Manufacturing': {
      industry: 'Manufacturing',
      trend: { trend: 'down', percentage: 1.7, score: 42 },
      volatility: 'Medium',
      forecast: 'Neutral',
      priceLevel: 'Medium',
    },
    'Chemicals': {
      industry: 'Chemicals',
      trend: { trend: 'stable', percentage: 0.3, score: 50 },
      volatility: 'Medium',
      forecast: 'Neutral',
      priceLevel: 'Medium',
    },
    'Textiles': {
      industry: 'Textiles',
      trend: { trend: 'down', percentage: 2.1, score: 38 },
      volatility: 'Medium',
      forecast: 'Cautious',
      priceLevel: 'Low',
    },
    'Auto': {
      industry: 'Auto',
      trend: { trend: 'up', percentage: 1.8, score: 65 },
      volatility: 'High',
      forecast: 'Positive',
      priceLevel: 'Medium',
    },
    'Pharmaceuticals': {
      industry: 'Pharmaceuticals',
      trend: { trend: 'up', percentage: 4.1, score: 82 },
      volatility: 'Low',
      forecast: 'Strong Positive',
      priceLevel: 'High',
    },
  };

  // Get insight data for selected industry
  const currentInsight = stockTrendsData?.metrics || marketInsights[selectedIndustry] || {
    industry: selectedIndustry,
    trend: { trend: 'stable', percentage: 0, score: 50 },
    volatility: 'Medium',
    forecast: 'Neutral',
    priceLevel: 'Medium',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Market Analytics</h2>
          <p className="text-gray-500">Comprehensive market intelligence for strategic decision-making</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
          >
            {industries.map((industry) => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
          <Button variant="outline" size="sm">
            <FilePieChartIcon className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="market" onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="market">
            <TrendingUpIcon className="h-4 w-4 mr-2" />
            Market Trends
          </TabsTrigger>
          <TabsTrigger value="supply">
            <BoxesIcon className="h-4 w-4 mr-2" />
            Supply Chain
          </TabsTrigger>
          <TabsTrigger value="rfq">
            <BarChart3Icon className="h-4 w-4 mr-2" />
            RFQ Analytics
          </TabsTrigger>
          <TabsTrigger value="volatility">
            <BoxIcon className="h-4 w-4 mr-2" />
            Market Volatility
          </TabsTrigger>
        </TabsList>

        {/* Market Trends Tab */}
        <TabsContent value="market" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Industry Price Trends</h3>
                    <Badge variant={currentInsight.trend?.trend === 'up' ? 'success' : currentInsight.trend?.trend === 'down' ? 'destructive' : 'outline'}>
                      {currentInsight.trend?.trend === 'up' ? 'Bullish' : currentInsight.trend?.trend === 'down' ? 'Bearish' : 'Neutral'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingElectronics || isLoadingSelectedIndustry ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <div className="h-[300px]">
                      <canvas ref={marketTrendsChartRef}></canvas>
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500 border-t pt-3">
                    <div>Data source: Yahoo Finance API (updated daily)</div>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Confidence Score:</span>
                      <div className="bg-gray-200 h-2 w-24 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            currentInsight.trend?.score > 70 ? 'bg-green-500' : 
                            currentInsight.trend?.score > 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${currentInsight.trend?.score || 50}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-medium">Market Insights</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500 flex items-center">
                          <span>Price Trend</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InfoIcon className="h-4 w-4 ml-1 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Price trend based on last 30 days of market data</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {isLoadingStockTrends ? (
                          <Skeleton className="h-6 w-16" />
                        ) : (
                          renderTrendIndicator(currentInsight.trend?.trend || 'stable', currentInsight.trend?.percentage || 0)
                        )}
                      </div>
                      <div className="h-1 bg-gray-100 mt-2">
                        <div 
                          className={
                            currentInsight.trend?.trend === 'up' ? 'bg-green-500' : 
                            currentInsight.trend?.trend === 'down' ? 'bg-red-500' : 'bg-yellow-400'
                          }
                          style={{ width: `${Math.abs(currentInsight.trend?.percentage || 0) * 10}%`, minWidth: '10%', height: '100%' }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500 flex items-center">
                          <span>Market Volatility</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InfoIcon className="h-4 w-4 ml-1 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Price volatility measured from historical standard deviation</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {isLoadingStockTrends ? (
                          <Skeleton className="h-6 w-16" />
                        ) : (
                          <Badge variant={
                            stockTrendsData?.metrics?.volatility === 'High' ? 'destructive' : 
                            stockTrendsData?.metrics?.volatility === 'Low' ? 'success' : 'outline'
                          }>
                            {stockTrendsData?.metrics?.volatility || currentInsight.volatility}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500 flex items-center">
                          <span>Forecast (30-day)</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InfoIcon className="h-4 w-4 ml-1 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Price forecast based on technical indicators and market trends</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {isLoadingStockTrends ? (
                          <Skeleton className="h-6 w-16" />
                        ) : (
                          <Badge variant={
                            stockTrendsData?.metrics?.trend === 'bullish' || currentInsight.forecast.includes('Positive') ? 'success' : 
                            stockTrendsData?.metrics?.trend === 'bearish' || currentInsight.forecast.includes('Cautious') ? 'destructive' : 'outline'
                          }>
                            {stockTrendsData?.metrics?.trend === 'bullish' ? 'Positive' : 
                             stockTrendsData?.metrics?.trend === 'bearish' ? 'Cautious' : 
                             stockTrendsData?.metrics?.trend || currentInsight.forecast}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500 flex items-center">
                          <span>Price Support Level</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InfoIcon className="h-4 w-4 ml-1 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Price level where downward trend is expected to pause</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {isLoadingStockTrends ? (
                          <Skeleton className="h-6 w-16" />
                        ) : (
                          <div className="font-medium">
                            {stockTrendsData?.metrics?.support ? `₹${stockTrendsData.metrics.support.toFixed(2)}` : 'N/A'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500 flex items-center">
                          <span>Resistance Level</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <InfoIcon className="h-4 w-4 ml-1 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Price level where upward trend is expected to pause</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {isLoadingStockTrends ? (
                          <Skeleton className="h-6 w-16" />
                        ) : (
                          <div className="font-medium">
                            {stockTrendsData?.metrics?.resistance ? `₹${stockTrendsData.metrics.resistance.toFixed(2)}` : 'N/A'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <h3 className="text-lg font-medium">Indian Sector Overview</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[200px] overflow-y-auto">
                      {isLoadingIndianSectors ? (
                        Array(5).fill(0).map((_, i) => (
                          <div key={i} className="flex justify-between items-center py-1 border-b border-gray-100">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        ))
                      ) : (
                        indianSectorsData?.data?.map((sector: any, index: number) => (
                          <div key={index} className="flex justify-between items-center py-1 border-b border-gray-100">
                            <div className="font-medium text-sm">{sector.sector}</div>
                            <div className={`text-sm ${
                              sector.metrics?.changePercent > 0 ? 'text-green-600' : 
                              sector.metrics?.changePercent < 0 ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              {sector.metrics?.changePercent > 0 ? '+' : ''}{sector.metrics?.changePercent?.toFixed(2)}%
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Supply Chain Tab */}
        <TabsContent value="supply" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-medium">Supply Chain Forecast</h3>
                </CardHeader>
                <CardContent>
                  {isLoadingSupplyChain ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <div className="h-[300px]">
                      <canvas ref={supplyChainChartRef}></canvas>
                    </div>
                  )}
                  <div className="mt-4 text-sm text-gray-500 border-t pt-3">
                    Forecast data includes price trends, demand patterns, and supply constraints
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-medium">Supply Chain Metrics</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    {isLoadingSupplyChain ? (
                      Array(5).fill(0).map((_, i) => (
                        <div key={i}>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-6 w-full" />
                        </div>
                      ))
                    ) : (
                      <>
                        <div>
                          <div className="text-sm text-gray-500 mb-1 flex items-center">
                            <span>Risk Level</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InfoIcon className="h-4 w-4 ml-1 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Overall risk level in the supply chain</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Badge variant={
                            supplyChainData?.supplyChainMetrics?.riskLevel === 'High' ? 'destructive' : 
                            supplyChainData?.supplyChainMetrics?.riskLevel === 'Low' ? 'success' : 'outline'
                          }>
                            {supplyChainData?.supplyChainMetrics?.riskLevel || 'Medium'}
                          </Badge>
                          <div className="h-1 bg-gray-100 mt-2">
                            <div 
                              className={
                                supplyChainData?.supplyChainMetrics?.riskLevel === 'High' ? 'bg-red-500' : 
                                supplyChainData?.supplyChainMetrics?.riskLevel === 'Low' ? 'bg-green-500' : 'bg-yellow-400'
                              }
                              style={{ 
                                width: `${(supplyChainData?.supplyChainMetrics?.riskScore || 50)}%`, 
                                height: '100%' 
                              }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-500 mb-1 flex items-center">
                            <span>Demand Forecast</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InfoIcon className="h-4 w-4 ml-1 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Expected demand trend over next quarter</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Badge variant={
                            supplyChainData?.demandForecast?.trend === 'increasing' ? 'success' : 
                            supplyChainData?.demandForecast?.trend === 'decreasing' ? 'destructive' : 'outline'
                          }>
                            {supplyChainData?.demandForecast?.trend === 'increasing' ? 'Increasing' : 
                             supplyChainData?.demandForecast?.trend === 'decreasing' ? 'Decreasing' : 
                             supplyChainData?.demandForecast?.trend || 'Stable'}
                          </Badge>
                        </div>

                        <div>
                          <div className="text-sm text-gray-500 mb-1 flex items-center">
                            <span>Lead Time Impact</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InfoIcon className="h-4 w-4 ml-1 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Expected impact on delivery lead times</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="font-medium">
                            {supplyChainData?.forecast?.leadTimeImpact || 'Minimal impact expected'}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-500 mb-1 flex items-center">
                            <span>Price Volatility</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InfoIcon className="h-4 w-4 ml-1 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Expected price fluctuations in raw materials</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="font-medium">
                            {supplyChainData?.volatility?.overall || 'Moderate'}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm text-gray-500 mb-1">Key Risk Factors</div>
                          <div className="space-y-1">
                            {supplyChainData?.supplyChainMetrics?.riskFactors?.map((factor: string, index: number) => (
                              <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                                {factor}
                              </div>
                            )) || (
                              <div className="text-xs bg-gray-50 p-2 rounded">
                                No significant risk factors identified
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* RFQ Analytics Tab */}
        <TabsContent value="rfq" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-medium">RFQ Success Prediction by Industry</h3>
                </CardHeader>
                <CardContent>
                  {isLoadingRfqPrediction ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <div className="h-[300px]">
                      <canvas ref={rfqPredictionChartRef}></canvas>
                    </div>
                  )}
                  <div className="mt-4 text-sm text-gray-500 border-t pt-3">
                    Success predictions based on historical RFQ data, market conditions, and supplier availability
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-medium">RFQ Success Factors</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    {isLoadingRfqPrediction ? (
                      Array(5).fill(0).map((_, i) => (
                        <div key={i}>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-6 w-full" />
                        </div>
                      ))
                    ) : (
                      <>
                        <div>
                          <div className="text-sm text-gray-500 mb-1 flex items-center">
                            <span>Overall Success Score</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InfoIcon className="h-4 w-4 ml-1 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Predicted success score for RFQs in this industry</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="font-medium text-lg">
                            {rfqSuccessPredictionData?.industries?.[selectedIndustry]?.successScore || '68'}/100
                          </div>
                          <div className="h-2 bg-gray-100 mt-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-primary"
                              style={{ 
                                width: `${rfqSuccessPredictionData?.industries?.[selectedIndustry]?.successScore || 68}%`, 
                                height: '100%' 
                              }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-500 mb-1 flex items-center">
                            <span>Competitive Landscape</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InfoIcon className="h-4 w-4 ml-1 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Level of supplier competition in this industry</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Badge variant={
                            rfqSuccessPredictionData?.industries?.[selectedIndustry]?.competition === 'High' ? 'destructive' : 
                            rfqSuccessPredictionData?.industries?.[selectedIndustry]?.competition === 'Low' ? 'success' : 'outline'
                          }>
                            {rfqSuccessPredictionData?.industries?.[selectedIndustry]?.competition || 'Medium'}
                          </Badge>
                        </div>

                        <div>
                          <div className="text-sm text-gray-500 mb-1 flex items-center">
                            <span>Avg. Response Time</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InfoIcon className="h-4 w-4 ml-1 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Average supplier response time for RFQs</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="font-medium">
                            {rfqSuccessPredictionData?.industries?.[selectedIndustry]?.avgResponseTime || '36'} hours
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-500 mb-1 flex items-center">
                            <span>Avg. Quotes Per RFQ</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InfoIcon className="h-4 w-4 ml-1 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Average number of supplier quotes received per RFQ</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="font-medium">
                            {rfqSuccessPredictionData?.industries?.[selectedIndustry]?.avgQuotes || '4.2'}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm text-gray-500 mb-1">Success Tips</div>
                          <div className="space-y-1">
                            {rfqSuccessPredictionData?.industries?.[selectedIndustry]?.tips?.map((tip: string, index: number) => (
                              <div key={index} className="text-xs bg-blue-50 p-2 rounded flex">
                                <ChevronRightIcon className="h-4 w-4 mr-1 text-blue-500 flex-shrink-0" />
                                <span>{tip}</span>
                              </div>
                            )) || (
                              <>
                                <div className="text-xs bg-blue-50 p-2 rounded flex">
                                  <ChevronRightIcon className="h-4 w-4 mr-1 text-blue-500 flex-shrink-0" />
                                  <span>Provide detailed specifications in your RFQ</span>
                                </div>
                                <div className="text-xs bg-blue-50 p-2 rounded flex">
                                  <ChevronRightIcon className="h-4 w-4 mr-1 text-blue-500 flex-shrink-0" />
                                  <span>Consider extending bidding deadlines by 2-3 days</span>
                                </div>
                                <div className="text-xs bg-blue-50 p-2 rounded flex">
                                  <ChevronRightIcon className="h-4 w-4 mr-1 text-blue-500 flex-shrink-0" />
                                  <span>Use voice/video RFQ for complex requirements</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Market Volatility Tab */}
        <TabsContent value="volatility" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-medium">Industry Volatility Index</h3>
                </CardHeader>
                <CardContent>
                  {isLoadingVolatility ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <div className="h-[300px]">
                      <canvas ref={volatilityChartRef}></canvas>
                    </div>
                  )}
                  <div className="mt-4 text-sm text-gray-500 border-t pt-3">
                    Volatility index measures price fluctuation and market stability
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-medium">Market Risk Analysis</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    {isLoadingVolatility ? (
                      Array(5).fill(0).map((_, i) => (
                        <div key={i}>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-6 w-full" />
                        </div>
                      ))
                    ) : (
                      <>
                        <div>
                          <div className="text-sm text-gray-500 mb-1 flex items-center">
                            <span>Global Volatility Index</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InfoIcon className="h-4 w-4 ml-1 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Overall market volatility across all sectors</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="font-medium">
                            {marketVolatilityData?.globalIndex?.score?.toFixed(1) || '24.3'} 
                            <span className="text-sm text-gray-500 ml-2">
                              {marketVolatilityData?.globalIndex?.interpretation || 'Low Volatility'}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 mt-2 rounded-full overflow-hidden">
                            <div 
                              className={
                                parseInt(marketVolatilityData?.globalIndex?.score || '24.3') > 50 ? 'bg-red-500' :
                                parseInt(marketVolatilityData?.globalIndex?.score || '24.3') > 30 ? 'bg-yellow-500' : 'bg-green-500'
                              }
                              style={{ 
                                width: `${Math.min(100, parseInt(marketVolatilityData?.globalIndex?.score || '24.3') * 1.5)}%`, 
                                height: '100%' 
                              }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-500 mb-1 flex items-center">
                            <span>{selectedIndustry} Volatility</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InfoIcon className="h-4 w-4 ml-1 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Volatility specific to the selected industry</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Badge variant={
                            marketVolatilityData?.industries?.[selectedIndustry]?.volatilityLevel === 'High' ? 'destructive' : 
                            marketVolatilityData?.industries?.[selectedIndustry]?.volatilityLevel === 'Low' ? 'success' : 'outline'
                          }>
                            {marketVolatilityData?.industries?.[selectedIndustry]?.volatilityLevel || 'Medium'}
                          </Badge>
                        </div>

                        <div>
                          <div className="text-sm text-gray-500 mb-1 flex items-center">
                            <span>Pricing Impact</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InfoIcon className="h-4 w-4 ml-1 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>How current volatility is affecting pricing</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="font-medium">
                            {marketVolatilityData?.industries?.[selectedIndustry]?.pricingImpact || 'Moderate fluctuations expected'}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-500 mb-1 flex items-center">
                            <span>Trend Analysis</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <InfoIcon className="h-4 w-4 ml-1 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>How volatility is changing over time</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="font-medium">
                            {marketVolatilityData?.industries?.[selectedIndustry]?.trend || 'Stable with occasional spikes'}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm text-gray-500 mb-1">Key Volatility Drivers</div>
                          <div className="space-y-1">
                            {marketVolatilityData?.industries?.[selectedIndustry]?.volatilityDrivers?.map((driver: string, index: number) => (
                              <div key={index} className="text-xs bg-red-50 p-2 rounded flex">
                                <ChevronRightIcon className="h-4 w-4 mr-1 text-red-500 flex-shrink-0" />
                                <span>{driver}</span>
                              </div>
                            )) || (
                              <>
                                <div className="text-xs bg-red-50 p-2 rounded flex">
                                  <ChevronRightIcon className="h-4 w-4 mr-1 text-red-500 flex-shrink-0" />
                                  <span>Supply chain disruptions in raw materials</span>
                                </div>
                                <div className="text-xs bg-red-50 p-2 rounded flex">
                                  <ChevronRightIcon className="h-4 w-4 mr-1 text-red-500 flex-shrink-0" />
                                  <span>Regulatory changes affecting manufacturing</span>
                                </div>
                                <div className="text-xs bg-red-50 p-2 rounded flex">
                                  <ChevronRightIcon className="h-4 w-4 mr-1 text-red-500 flex-shrink-0" />
                                  <span>Global economic uncertainty affecting investment</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
