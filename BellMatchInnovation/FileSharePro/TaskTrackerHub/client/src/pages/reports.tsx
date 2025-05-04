import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Download, 
  FileText, 
  BarChart2, 
  PieChart, 
  TrendingUp,
  Calendar,
  Share2
} from "lucide-react";

// Sample report types
const reportTypes = [
  { id: 1, name: "Supplier Performance Report", icon: <BarChart2 className="h-8 w-8 text-blue-500" />, description: "Analyze supplier performance metrics including delivery times, quality ratings, and price competitiveness." },
  { id: 2, name: "Procurement Spend Analysis", icon: <PieChart className="h-8 w-8 text-purple-500" />, description: "Break down your procurement spending by category, supplier, and time period." },
  { id: 3, name: "RFQ Success Rate Report", icon: <TrendingUp className="h-8 w-8 text-green-500" />, description: "Track the success rates of your RFQs and identify improvement opportunities." },
  { id: 4, name: "Risk Assessment Summary", icon: <FileText className="h-8 w-8 text-orange-500" />, description: "Comprehensive analysis of supplier risk profiles and potential supply chain issues." },
  { id: 5, name: "Financial Savings Report", icon: <FileText className="h-8 w-8 text-emerald-500" />, description: "Calculate cost savings achieved through efficient procurement and negotiation." },
];

// Sample generated reports
const generatedReports = [
  { id: 101, name: "Q2 2023 Supplier Performance", type: "Supplier Performance", date: "2023-07-01", format: "PDF" },
  { id: 102, name: "Electronics Category Spend Analysis", type: "Spend Analysis", date: "2023-06-15", format: "XLSX" },
  { id: 103, name: "May 2023 RFQ Success Metrics", type: "RFQ Analysis", date: "2023-06-03", format: "PDF" },
];

export default function Reports() {
  const [selectedReportType, setSelectedReportType] = useState<number | null>(null);
  const [reportTimeframe, setReportTimeframe] = useState("last-3-months");
  
  // For a real implementation, we'd fetch report data from the API
  const { data: reports } = useQuery({ 
    queryKey: ['/api/reports'],
    enabled: false // Disable this query until API endpoint is available
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-dark-800">Reports</h1>
        <p className="mt-1 text-dark-500">Generate and view automated reports for your procurement activities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Report Generator */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Report</CardTitle>
              <CardDescription>Select a report type to generate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportTypes.map(reportType => (
                  <div
                    key={reportType.id}
                    className={`p-4 border rounded-lg cursor-pointer hover:bg-dark-50 transition-colors ${
                      selectedReportType === reportType.id ? 'border-primary-500 bg-primary-50' : 'border-dark-200'
                    }`}
                    onClick={() => setSelectedReportType(reportType.id)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {reportType.icon}
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium text-dark-800">{reportType.name}</h3>
                        <p className="text-sm text-dark-500 mt-1">{reportType.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedReportType && (
                <div className="mt-6 p-4 border border-dark-200 rounded-lg bg-dark-50">
                  <h3 className="font-medium text-dark-800 mb-4">Report Options</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Time Period</label>
                      <Select value={reportTimeframe} onValueChange={setReportTimeframe}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="last-month">Last Month</SelectItem>
                          <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                          <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                          <SelectItem value="year-to-date">Year to Date</SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-dark-700 mb-1">Format</label>
                      <Select defaultValue="pdf">
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF Document</SelectItem>
                          <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                          <SelectItem value="csv">CSV File</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="pt-2">
                      <Button className="bg-primary-600 hover:bg-primary-700 w-full">
                        Generate Report
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {generatedReports.length ? (
                <div className="space-y-4">
                  {generatedReports.map(report => (
                    <div key={report.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-dark-400" />
                        <div className="ml-4">
                          <h3 className="font-medium text-dark-800">{report.name}</h3>
                          <p className="text-sm text-dark-500">{report.type} • {new Date(report.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Share2 className="h-4 w-4 mr-1" /> Share
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" /> Download {report.format}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-dark-500">
                  <p>No reports generated yet. Create your first report above.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Scheduled Reports & Templates */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-dark-800">Monthly Supplier Performance</h3>
                    <div className="flex items-center text-primary-600 text-sm">
                      <Calendar className="h-4 w-4 mr-1" /> Monthly
                    </div>
                  </div>
                  <p className="text-sm text-dark-500 mt-1">Automatic report on the 1st of every month</p>
                  <div className="mt-3 flex justify-end">
                    <Button size="sm" variant="outline">Edit Schedule</Button>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-dark-800">Weekly RFQ Summary</h3>
                    <div className="flex items-center text-primary-600 text-sm">
                      <Calendar className="h-4 w-4 mr-1" /> Weekly
                    </div>
                  </div>
                  <p className="text-sm text-dark-500 mt-1">Sent every Monday at 9:00 AM</p>
                  <div className="mt-3 flex justify-end">
                    <Button size="sm" variant="outline">Edit Schedule</Button>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" /> Schedule New Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border rounded-lg hover:bg-dark-50 cursor-pointer">
                  <h3 className="font-medium text-dark-800">Executive Procurement Summary</h3>
                  <p className="text-xs text-dark-500 mt-1">High-level overview for management</p>
                </div>
                
                <div className="p-3 border rounded-lg hover:bg-dark-50 cursor-pointer">
                  <h3 className="font-medium text-dark-800">Detailed Supplier Analysis</h3>
                  <p className="text-xs text-dark-500 mt-1">In-depth supplier performance metrics</p>
                </div>
                
                <div className="p-3 border rounded-lg hover:bg-dark-50 cursor-pointer">
                  <h3 className="font-medium text-dark-800">Cost Savings Report</h3>
                  <p className="text-xs text-dark-500 mt-1">Financial impact of procurement activities</p>
                </div>
                
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm">
                    Create Custom Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
