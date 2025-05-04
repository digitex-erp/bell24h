import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2, Download, Headphones, MicVocal, Languages, AlertCircle } from 'lucide-react';
import MainLayout from '@/components/layout/main-layout';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2'];

// TypeScript interface for VoiceRFQ type
interface VoiceRFQ {
  id: number;
  title: string;
  description: string;
  status: string;
  created_at: string;
  user_id: number;
  metadata: {
    detected_language: string;
    has_translation: boolean;
    original_text: string;
  };
}

// Language name mapping
const languageNames: Record<string, string> = {
  'en': 'English',
  'hi': 'Hindi',
  'bn': 'Bengali',
  'ta': 'Tamil',
  'te': 'Telugu',
  'mr': 'Marathi',
  'gu': 'Gujarati',
  'kn': 'Kannada',
  'ml': 'Malayalam',
  'pa': 'Punjabi'
};

function VoiceAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, all
  const [selectedLanguage, setSelectedLanguage] = useState('all');

  // Fetch voice RFQ data with query parameters
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/voice-rfq/analytics', timeRange, selectedLanguage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (timeRange !== 'all') params.append('timeRange', timeRange);
      if (selectedLanguage !== 'all') params.append('language', selectedLanguage);
      
      const response = await fetch(`/api/voice-rfq/analytics?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch voice analytics data');
      return await response.json();
    }
  });

  // Mock data if real data isn't available yet
  const languageDistribution = data?.languageDistribution || [
    { name: 'English', value: 65 },
    { name: 'Hindi', value: 25 },
    { name: 'Bengali', value: 5 },
    { name: 'Tamil', value: 3 },
    { name: 'Others', value: 2 },
  ];
  
  const voiceRfqTrend = data?.voiceRfqTrend || [
    { date: '2025-04-01', count: 5 },
    { date: '2025-04-02', count: 8 },
    { date: '2025-04-03', count: 12 },
    { date: '2025-04-04', count: 10 },
    { date: '2025-04-05', count: 15 },
    { date: '2025-04-06', count: 20 },
    { date: '2025-04-07', count: 25 },
  ];
  
  const qualityMetrics = data?.qualityMetrics || {
    averageConfidence: 0.87,
    enhancementRate: 0.35,
    translationRate: 0.27,
    successRate: 0.92,
  };
  
  const latestRfqs = data?.latestRfqs || [];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading voice analytics data...</span>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Unable to load voice analytics</h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Voice RFQ Analytics</h1>
            <p className="text-muted-foreground">
              Insights and trends from voice-based RFQ submissions
            </p>
          </div>
          <div className="flex space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All languages</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
                <SelectItem value="bn">Bengali</SelectItem>
                <SelectItem value="ta">Tamil</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Submissions
              </CardTitle>
              <MicVocal className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.totalRfqs || 0}</div>
              <p className="text-xs text-muted-foreground">
                {data?.trend?.totalGrowth > 0 ? '+' : ''}{data?.trend?.totalGrowth || 0}% from previous period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Languages Detected
              </CardTitle>
              <Languages className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.uniqueLanguages || 0}</div>
              <p className="text-xs text-muted-foreground">
                Most common: {data?.mostUsedLanguage ? languageNames[data.mostUsedLanguage] || data.mostUsedLanguage : 'English'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Average Quality Score
              </CardTitle>
              <Headphones className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round((qualityMetrics.averageConfidence || 0) * 100)}%</div>
              <p className="text-xs text-muted-foreground">
                Based on transcription confidence
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Translation Rate
              </CardTitle>
              <Languages className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round((qualityMetrics.translationRate || 0) * 100)}%</div>
              <p className="text-xs text-muted-foreground">
                Submissions requiring translation
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="language">Language Analysis</TabsTrigger>
            <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
            <TabsTrigger value="submissions">Recent Submissions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Voice RFQ Submissions Over Time</CardTitle>
                <CardDescription>
                  Number of voice-based RFQs submitted in the selected time period
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={voiceRfqTrend}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Submissions" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Language Distribution</CardTitle>
                  <CardDescription>
                    Distribution of languages in voice RFQ submissions
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={languageDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {languageDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Audio Quality Metrics</CardTitle>
                  <CardDescription>
                    Quality and processing metrics for voice submissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Transcription Confidence</span>
                        <span className="text-sm font-medium">{Math.round((qualityMetrics.averageConfidence || 0) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${Math.round((qualityMetrics.averageConfidence || 0) * 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Enhancement Rate</span>
                        <span className="text-sm font-medium">{Math.round((qualityMetrics.enhancementRate || 0) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${Math.round((qualityMetrics.enhancementRate || 0) * 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Translation Rate</span>
                        <span className="text-sm font-medium">{Math.round((qualityMetrics.translationRate || 0) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-500" 
                          style={{ width: `${Math.round((qualityMetrics.translationRate || 0) * 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Successful Processing</span>
                        <span className="text-sm font-medium">{Math.round((qualityMetrics.successRate || 0) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500" 
                          style={{ width: `${Math.round((qualityMetrics.successRate || 0) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="language" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Language Analysis</CardTitle>
                <CardDescription>
                  Breakdown of language usage in voice RFQ submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* More detailed language analysis would go here */}
                <p className="text-center text-muted-foreground py-8">
                  Detailed language analysis will be available soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="quality" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Quality Metrics</CardTitle>
                <CardDescription>
                  Detailed audio quality and processing metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* More detailed quality metrics would go here */}
                <p className="text-center text-muted-foreground py-8">
                  Advanced quality metrics will be available soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="submissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Voice RFQ Submissions</CardTitle>
                <CardDescription>
                  Latest voice-based RFQs with transcription and metadata
                </CardDescription>
              </CardHeader>
              <CardContent>
                {latestRfqs.length > 0 ? (
                  <div className="space-y-4">
                    {latestRfqs.map((rfq: VoiceRFQ) => (
                      <div key={rfq.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{rfq.title}</h3>
                          <Badge variant={rfq.status === 'draft' ? 'outline' : 'default'}>
                            {rfq.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {rfq.description}
                        </p>
                        <div className="flex gap-2 items-center text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Languages className="h-3 w-3 mr-1" />
                            {languageNames[rfq.metadata?.detected_language] || rfq.metadata?.detected_language || 'Unknown'}
                          </div>
                          {rfq.metadata?.has_translation && (
                            <Badge variant="secondary" className="text-xs">Translated</Badge>
                          )}
                          <div>
                            {new Date(rfq.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No recent voice RFQ submissions found
                  </p>
                )}
              </CardContent>
              {latestRfqs.length > 0 && (
                <CardFooter>
                  <Button variant="outline" className="w-full">View All Submissions</Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

export default VoiceAnalyticsPage;