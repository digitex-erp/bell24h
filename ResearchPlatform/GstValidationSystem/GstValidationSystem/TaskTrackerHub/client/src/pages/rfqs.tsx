import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  ChevronRight, 
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CreateRfqForm from "@/components/rfqs/create-rfq-form";
import QuoteSubmissionForm from "@/components/rfqs/quote-submission-form";
import VideoRfqUploader from "@/components/rfqs/video-rfq-uploader";

// Badge component for RFQ status
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    active: { bgColor: "bg-green-100", textColor: "text-green-800" },
    pending: { bgColor: "bg-yellow-100", textColor: "text-yellow-800" },
    completed: { bgColor: "bg-blue-100", textColor: "text-blue-800" },
    expired: { bgColor: "bg-red-100", textColor: "text-red-800" },
    "quotes received": { bgColor: "bg-blue-100", textColor: "text-blue-800" },
    "pending quotes": { bgColor: "bg-yellow-100", textColor: "text-yellow-800" }
  };

  const config = statusConfig[status.toLowerCase()] || statusConfig.pending;

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.bgColor} ${config.textColor}`}>
      {status}
    </span>
  );
};

export default function RFQs() {
  const [activeTab, setActiveTab] = useState("active");
  const [selectedRfqId, setSelectedRfqId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  
  // Fetch RFQs
  const { data: rfqs, isLoading } = useQuery({ 
    queryKey: ['/api/rfqs']
  });

  // Filter RFQs by status
  const filteredRfqs = rfqs?.filter(rfq => {
    if (activeTab === "active") return rfq.status.toLowerCase() === "active";
    if (activeTab === "pending") return rfq.status.toLowerCase() === "pending" || rfq.status.toLowerCase() === "pending quotes";
    if (activeTab === "completed") return rfq.status.toLowerCase() === "completed";
    return true; // All tab
  });

  // Get selected RFQ details
  const selectedRfq = rfqs?.find(rfq => rfq.id === selectedRfqId);

  // Get quotes for selected RFQ
  const { data: quotes } = useQuery({ 
    queryKey: ['/api/quotes/rfq', selectedRfqId],
    enabled: !!selectedRfqId
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-heading text-dark-800">Request for Quotes</h1>
          <p className="mt-1 text-dark-500">Create and manage your RFQs, review supplier quotes</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary-600 hover:bg-primary-700">
              <Plus className="mr-2 h-4 w-4" /> Create RFQ
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New RFQ</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="form">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="form">Text Form</TabsTrigger>
                <TabsTrigger value="video">Video RFQ</TabsTrigger>
              </TabsList>
              <TabsContent value="form">
                <CreateRfqForm onSuccess={() => setIsCreateDialogOpen(false)} />
              </TabsContent>
              <TabsContent value="video">
                <VideoRfqUploader onSuccess={() => setIsCreateDialogOpen(false)} />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All RFQs</TabsTrigger>
          </TabsList>
          
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="success-rate">Success Rate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* RFQs List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>RFQ List</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p>Loading RFQs...</p>
                  ) : filteredRfqs?.length ? (
                    <div className="overflow-hidden border border-dark-200 rounded-lg">
                      <table className="min-w-full divide-y divide-dark-200">
                        <thead className="bg-dark-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-dark-500 uppercase">
                              RFQ Number
                            </th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-dark-500 uppercase">
                              Product
                            </th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-dark-500 uppercase">
                              Quantity
                            </th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-dark-500 uppercase">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-dark-500 uppercase">
                              Success Rate
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-dark-200">
                          {filteredRfqs.map(rfq => (
                            <tr 
                              key={rfq.id} 
                              className={`hover:bg-dark-50 cursor-pointer ${selectedRfqId === rfq.id ? 'bg-primary-50' : ''}`}
                              onClick={() => setSelectedRfqId(rfq.id)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-dark-800">{rfq.rfqNumber}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-dark-600">{rfq.product}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-dark-600">{rfq.quantity}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <StatusBadge status={rfq.status} />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <svg className={`w-4 h-4 ${
                                    (rfq.successRate || 0) >= 75 ? 'text-green-500' :
                                    (rfq.successRate || 0) >= 50 ? 'text-yellow-500' : 'text-red-500'
                                  }`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                  </svg>
                                  <span className="ml-1 text-sm text-dark-600">{rfq.successRate || 0}%</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-900">
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="mx-auto h-12 w-12 text-dark-300" />
                      <h3 className="mt-2 text-sm font-medium text-dark-700">No RFQs Found</h3>
                      <p className="mt-1 text-sm text-dark-500">Get started by creating a new RFQ.</p>
                      <div className="mt-6">
                        <Button 
                          onClick={() => setIsCreateDialogOpen(true)}
                          className="bg-primary-600 hover:bg-primary-700"
                        >
                          <Plus className="mr-2 h-4 w-4" /> New RFQ
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* RFQ Details */}
            <div>
              {selectedRfq ? (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>RFQ Details</CardTitle>
                    <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">Submit Quote</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Submit Quote for {selectedRfq.rfqNumber}</DialogTitle>
                        </DialogHeader>
                        <QuoteSubmissionForm 
                          rfqId={selectedRfq.id} 
                          onSuccess={() => setIsQuoteDialogOpen(false)} 
                        />
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">{selectedRfq.product}</h3>
                        <StatusBadge status={selectedRfq.status} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-dark-500">RFQ Number</p>
                          <p className="font-medium">{selectedRfq.rfqNumber}</p>
                        </div>
                        <div>
                          <p className="text-dark-500">Quantity</p>
                          <p className="font-medium">{selectedRfq.quantity}</p>
                        </div>
                        <div>
                          <p className="text-dark-500">Created Date</p>
                          <p className="font-medium">
                            {new Date(selectedRfq.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-dark-500">Due Date</p>
                          <p className="font-medium">
                            {selectedRfq.dueDate ? new Date(selectedRfq.dueDate).toLocaleDateString() : 'Not specified'}
                          </p>
                        </div>
                      </div>
                      
                      {selectedRfq.description && (
                        <div>
                          <p className="text-dark-500 text-sm">Description</p>
                          <p className="text-sm mt-1">{selectedRfq.description}</p>
                        </div>
                      )}
                      
                      {selectedRfq.videoUrl && (
                        <div>
                          <p className="text-dark-500 text-sm">Video RFQ</p>
                          <div className="mt-2 rounded-md overflow-hidden">
                            <video 
                              controls 
                              className="w-full h-auto"
                              src={selectedRfq.videoUrl}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Quotes Section */}
                      <div className="mt-6">
                        <h4 className="text-sm font-medium mb-2">Quotes Received</h4>
                        {quotes?.length ? (
                          <div className="space-y-2">
                            {quotes.map(quote => (
                              <div key={quote.id} className="p-3 border rounded-md">
                                <div className="flex justify-between">
                                  <div>
                                    <p className="font-medium">₹{quote.price}</p>
                                    <p className="text-xs text-dark-500">Delivery: {quote.deliveryTime}</p>
                                  </div>
                                  <StatusBadge status={quote.status} />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-dark-500">No quotes received yet.</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-10 text-center text-dark-500">
                    <p>Select an RFQ to view details</p>
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
