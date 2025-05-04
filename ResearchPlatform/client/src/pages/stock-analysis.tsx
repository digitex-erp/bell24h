import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarIcon, TrendingUp, TrendingDown, BarChart3, PieChart } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import IndustryStockChart from '@/components/stock-analysis/IndustryStockChart';
import PriceHistoryChart from '@/components/stock-analysis/PriceHistoryChart';
import MarketTrendsTable from '@/components/stock-analysis/MarketTrendsTable';
import IndustryComparisonChart from '@/components/stock-analysis/IndustryComparisonChart';

// Sample industry data
const INDUSTRIES = [
  { id: 1, name: 'Technology' },
  { id: 2, name: 'Healthcare' },
  { id: 3, name: 'Finance' },
  { id: 4, name: 'Energy' },
  { id: 5, name: 'Consumer Goods' },
  { id: 6, name: 'Manufacturing' },
  { id: 7, name: 'Telecommunications' },
  { id: 8, name: 'Materials' },
  { id: 9, name: 'Utilities' },
  { id: 10, name: 'Real Estate' }
];

export default function StockAnalysisPage() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('1');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [timeframe, setTimeframe] = useState('weekly');
  
  // Fetch industry stock analysis data
  const { data: industryData, isLoading: industryLoading } = useQuery({
    queryKey: ['/api/stock-analysis/industry', selectedIndustry, timeframe],
    enabled: !!selectedIndustry
  });
  
  // Fetch industry symbols
  const { data: symbolsData, isLoading: symbolsLoading } = useQuery({
    queryKey: ['/api/stock-analysis/industry', selectedIndustry, 'symbols'],
    enabled: !!selectedIndustry
  });
  
  // Fetch price history data
  const { data: priceHistoryData, isLoading: priceHistoryLoading } = useQuery({
    queryKey: ['/api/stock-analysis/symbol', selectedSymbol, 'price-history', timeframe],
    enabled: !!selectedSymbol
  });
  
  // Fetch market trends
  const { data: marketTrendsData, isLoading: marketTrendsLoading } = useQuery({
    queryKey: ['/api/stock-analysis/market-trends'],
  });
  
  // Fetch industry comparison
  const { data: industryComparisonData, isLoading: industryComparisonLoading } = useQuery({
    queryKey: ['/api/stock-analysis/compare', [1, 2, 3, 4, 5].join(',')],
  });
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Industry Stock Analysis</h1>
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            calendarIcon={<CalendarIcon className="h-4 w-4" />}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
          <SelectTrigger>
            <SelectValue placeholder="Select Industry" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRIES.map(industry => (
              <SelectItem key={industry.id} value={industry.id.toString()}>
                {industry.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select 
          value={selectedSymbol} 
          onValueChange={setSelectedSymbol}
          disabled={symbolsLoading || !symbolsData}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Stock Symbol" />
          </SelectTrigger>
          <SelectContent>
            {symbolsData?.map((symbol: any) => (
              <SelectItem key={symbol.id} value={symbol.id.toString()}>
                {symbol.symbol} - {symbol.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview">Industry Overview</TabsTrigger>
          <TabsTrigger value="price-history">Price History</TabsTrigger>
          <TabsTrigger value="market-trends">Market Trends</TabsTrigger>
          <TabsTrigger value="comparison">Industry Comparison</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {industryLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Skeleton className="h-full w-full" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {industryData && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Market Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {industryData.marketTrend === 'bullish' ? (
                              <TrendingUp className="h-10 w-10 text-green-500 mr-2" />
                            ) : industryData.marketTrend === 'bearish' ? (
                              <TrendingDown className="h-10 w-10 text-red-500 mr-2" />
                            ) : (
                              <BarChart3 className="h-10 w-10 text-yellow-500 mr-2" />
                            )}
                            <span className="text-2xl font-bold capitalize">
                              {industryData.marketTrend}
                            </span>
                          </div>
                          <div>
                            <Badge className={
                              industryData.marketTrend === 'bullish' 
                                ? 'bg-green-100 text-green-800'
                                : industryData.marketTrend === 'bearish'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }>
                              {industryData.sector}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Average Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <span className={`text-3xl font-bold ${
                            industryData.averagePerformance > 0 
                              ? 'text-green-500' 
                              : industryData.averagePerformance < 0
                              ? 'text-red-500'
                              : ''
                          }`}>
                            {industryData.averagePerformance > 0 ? '+' : ''}
                            {industryData.averagePerformance.toFixed(2)}%
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {timeframe} change for {industryData.industry}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Volatility</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center">
                          <span className="text-3xl font-bold">
                            {industryData.volatility.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Relative volatility (1.0 = market average)
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>{industryData.industry} Industry Analysis</CardTitle>
                      <CardDescription>
                        {industryData.date} | {industryData.symbols.length} active symbols
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <IndustryStockChart data={industryData} />
                    </CardContent>
                  </Card>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Top Performers</CardTitle>
                        <CardDescription>
                          Best performing stocks in this industry
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {industryData.topPerformers.map((performer: any) => (
                            <li key={performer.symbolId} className="flex justify-between items-center p-2 hover:bg-secondary rounded">
                              <div>
                                <span className="font-medium">{performer.symbol}</span>
                                <span className="text-sm text-muted-foreground ml-2">{performer.name}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-green-500 font-bold">
                                  +{performer.changePercent.toFixed(2)}%
                                </span>
                                <span className="text-sm ml-2">
                                  ${performer.price.toFixed(2)}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Worst Performers</CardTitle>
                        <CardDescription>
                          Stocks with declining performance
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {industryData.worstPerformers.map((performer: any) => (
                            <li key={performer.symbolId} className="flex justify-between items-center p-2 hover:bg-secondary rounded">
                              <div>
                                <span className="font-medium">{performer.symbol}</span>
                                <span className="text-sm text-muted-foreground ml-2">{performer.name}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-red-500 font-bold">
                                  {performer.changePercent.toFixed(2)}%
                                </span>
                                <span className="text-sm ml-2">
                                  ${performer.price.toFixed(2)}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Events</CardTitle>
                      <CardDescription>
                        Recent events affecting this industry
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {industryData.keyEvents.map((event: any) => (
                          <li key={event.id} className="border-l-4 border-primary pl-4 py-2">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold">{event.title}</h4>
                              <Badge className={
                                event.impactLevel === 'high' 
                                  ? 'bg-red-100 text-red-800'
                                  : event.impactLevel === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                              }>
                                {event.impactLevel} impact
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {event.description}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(event.date).toLocaleDateString()}
                              </span>
                              {event.source && (
                                <a href={event.source} target="_blank" rel="noreferrer" className="text-xs text-primary">
                                  Source
                                </a>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="price-history" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Price History</CardTitle>
                <CardDescription>
                  {selectedSymbol 
                    ? priceHistoryData 
                      ? `${priceHistoryData.symbol} - ${priceHistoryData.name}`
                      : 'Loading price data...'
                    : 'Select a stock symbol to view price history'
                  }
                </CardDescription>
              </div>
              
              <Select value={timeframe} onValueChange={setTimeframe} disabled={!selectedSymbol}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {selectedSymbol ? (
                priceHistoryLoading ? (
                  <Skeleton className="h-96 w-full" />
                ) : priceHistoryData ? (
                  <div className="h-96">
                    <PriceHistoryChart data={priceHistoryData} />
                    <div className="mt-4 flex justify-between items-center">
                      <div>
                        <span className="text-sm text-muted-foreground">Overall Change:</span>
                        <span className={`ml-2 font-bold ${
                          priceHistoryData.overallChangePercent > 0 
                            ? 'text-green-500' 
                            : priceHistoryData.overallChangePercent < 0
                            ? 'text-red-500'
                            : ''
                        }`}>
                          {priceHistoryData.overallChangePercent > 0 ? '+' : ''}
                          {priceHistoryData.overallChangePercent.toFixed(2)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Period:</span>
                        <span className="ml-2 font-medium">
                          {new Date(priceHistoryData.startDate).toLocaleDateString()} - {new Date(priceHistoryData.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-96 text-muted-foreground">
                    No price history data available
                  </div>
                )
              ) : (
                <div className="flex flex-col justify-center items-center h-96 text-muted-foreground">
                  <PieChart className="h-16 w-16 mb-4 opacity-30" />
                  <p>Select a stock symbol to view price history</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="market-trends" className="space-y-6">
          {marketTrendsLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : marketTrendsData ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Market Trend Analysis</CardTitle>
                  <CardDescription>
                    {marketTrendsData.startDate} to {marketTrendsData.endDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center mb-6">
                    <Badge 
                      className={
                        marketTrendsData.overallTrend === 'bullish' 
                          ? 'bg-green-100 text-green-800 text-lg py-2 px-4'
                          : marketTrendsData.overallTrend === 'bearish'
                          ? 'bg-red-100 text-red-800 text-lg py-2 px-4'
                          : 'bg-yellow-100 text-yellow-800 text-lg py-2 px-4'
                      }
                    >
                      {marketTrendsData.overallTrend.toUpperCase()} MARKET
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Key Market Insights</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {marketTrendsData.keyInsights.map((insight: string, index: number) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Industries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MarketTrendsTable industries={marketTrendsData.topIndustries} />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Underperforming Industries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MarketTrendsTable industries={marketTrendsData.worstIndustries} />
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Market Movers</CardTitle>
                  <CardDescription>Stocks with significant price movements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {marketTrendsData.marketMovers.map((mover: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold">{mover.symbol}</span>
                            <p className="text-sm text-muted-foreground truncate max-w-full">{mover.name}</p>
                          </div>
                          <Badge>{mover.industry}</Badge>
                        </div>
                        <div className="mt-3">
                          <span className={`text-xl font-bold ${
                            mover.change > 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {mover.change > 0 ? '+' : ''}{mover.change.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex justify-center items-center h-96 text-muted-foreground">
              No market trend data available
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="comparison" className="space-y-6">
          {industryComparisonLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : industryComparisonData ? (
            <Card>
              <CardHeader>
                <CardTitle>Industry Comparison</CardTitle>
                <CardDescription>
                  Performance comparison across major industries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <IndustryComparisonChart data={industryComparisonData} />
                </div>
                
                <div className="mt-8 space-y-6">
                  <h3 className="text-lg font-medium">Performance Metrics by Industry</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Industry</th>
                          <th className="text-right p-2">Performance</th>
                          <th className="text-right p-2">Volatility</th>
                          <th className="text-right p-2">Market Cap ($B)</th>
                          <th className="text-right p-2">Top Symbol</th>
                        </tr>
                      </thead>
                      <tbody>
                        {industryComparisonData.map((industry: any) => (
                          <tr key={industry.industryId} className="border-b hover:bg-secondary">
                            <td className="p-2 font-medium">{industry.industry}</td>
                            <td className={`p-2 text-right font-medium ${
                              industry.performance > 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {industry.performance > 0 ? '+' : ''}
                              {industry.performance.toFixed(2)}%
                            </td>
                            <td className="p-2 text-right">{industry.volatility.toFixed(2)}</td>
                            <td className="p-2 text-right">{(industry.marketCap / 1000000000).toFixed(1)}</td>
                            <td className="p-2 text-right">
                              <div className="flex items-center justify-end">
                                <span className="font-medium">{industry.topSymbol.symbol}</span>
                                <span className={`ml-2 ${
                                  industry.topSymbol.performance > 0 ? 'text-green-500' : 'text-red-500'
                                }`}>
                                  ({industry.topSymbol.performance > 0 ? '+' : ''}
                                  {industry.topSymbol.performance.toFixed(2)}%)
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex justify-center items-center h-96 text-muted-foreground">
              No industry comparison data available
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}