import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CreateRfqForm from "@/components/rfqs/create-rfq-form";
import VideoRfqUploader from "@/components/rfqs/video-rfq-uploader";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Plus, CheckCircle2 } from "lucide-react";

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

export default function RFQsAndQuotes() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Fetch RFQs
  const { data: rfqs, isLoading } = useQuery({ 
    queryKey: ['/api/rfqs']
  });

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-dark-800">Recent RFQs</h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary-600 hover:bg-primary-700">
                <Plus className="w-4 h-4 mr-1" />
                New RFQ
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

        {/* RFQ List */}
        <div className="mt-4">
          {isLoading ? (
            <p>Loading RFQs...</p>
          ) : rfqs?.length ? (
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
                  {rfqs.slice(0, 3).map(rfq => (
                    <tr key={rfq.id} className="hover:bg-dark-50">
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
                        <a href="#" className="text-primary-600 hover:text-primary-900">View</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-dark-50 rounded-lg">
              <CheckCircle2 className="mx-auto h-12 w-12 text-dark-300" />
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
        </div>
      </CardContent>
    </Card>
  );
}
