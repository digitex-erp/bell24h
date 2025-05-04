import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Truck, 
  Calendar, 
  Clipboard, 
  Map, 
  Package, 
  Download,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function Logistics() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  
  // Fetch shipments
  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ["/api/logistics", searchTerm],
  });

  // Filter shipments based on search term
  const filteredShipments = shipments.filter((shipment: any) => {
    if (!searchTerm) return true;
    return (
      shipment.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.destination.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  function getStatusBadge(status: string) {
    switch (status.toLowerCase()) {
      case "delivered":
        return <Badge variant="success">Delivered</Badge>;
      case "in_transit":
        return <Badge variant="default">In Transit</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "out_for_delivery":
        return <Badge variant="secondary">Out for Delivery</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  // Calculate current shipment progress
  function calculateProgress(shipment: any) {
    const trackingData = shipment.trackingData;
    if (!trackingData || !trackingData.checkpoints) return 0;
    
    const totalCheckpoints = trackingData.checkpoints.length;
    const completedCheckpoints = trackingData.checkpoints.filter(
      (checkpoint: any) => checkpoint.status === "completed"
    ).length;
    
    return Math.round((completedCheckpoints / totalCheckpoints) * 100);
  }

  return (
    <div className="px-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Logistics Tracking</h1>
          <p className="mt-1 text-sm text-gray-500">Track and manage your shipments with Shiprocket and DHL.</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="inline-flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export
          </Button>
          <Button className="inline-flex items-center">
            <Truck className="h-5 w-5 mr-2" />
            Create Shipment
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Shipment Tracking</CardTitle>
          <CardDescription>
            Enter a tracking number or search for shipments.
          </CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by tracking number, status, origin, or destination..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Shipments</TabsTrigger>
          <TabsTrigger value="in-transit">In Transit</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <p className="text-sm text-gray-500">Loading shipments...</p>
                </div>
              ) : filteredShipments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Truck className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Shipments Found</h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-md">
                    {searchTerm 
                      ? "No shipments match your search criteria. Try a different search term." 
                      : "You don't have any shipments yet. Create a shipment to get started."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tracking Number</TableHead>
                        <TableHead>Order/RFQ</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Origin</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expected Delivery</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredShipments.map((shipment: any) => (
                        <TableRow key={shipment.id}>
                          <TableCell className="font-medium">{shipment.trackingId}</TableCell>
                          <TableCell>
                            {shipment.rfq 
                              ? `RFQ #${shipment.rfq.id}` 
                              : shipment.bid 
                                ? `Bid #${shipment.bid.id}` 
                                : `Order #${shipment.id}`}
                          </TableCell>
                          <TableCell>{shipment.provider}</TableCell>
                          <TableCell>{shipment.origin}</TableCell>
                          <TableCell>{shipment.destination}</TableCell>
                          <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                          <TableCell>
                            {shipment.estimatedDelivery 
                              ? formatDate(shipment.estimatedDelivery) 
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setSelectedShipment(shipment)}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="in-transit">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredShipments
                  .filter((shipment: any) => shipment.status.toLowerCase() === "in_transit")
                  .map((shipment: any) => (
                    <Card key={shipment.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <Badge variant="default">In Transit</Badge>
                          <span className="text-sm text-gray-500">
                            {shipment.provider}
                          </span>
                        </div>
                        <CardTitle className="text-base mt-2">{shipment.trackingId}</CardTitle>
                        <CardDescription>
                          {shipment.rfq 
                            ? `RFQ #${shipment.rfq.id}` 
                            : shipment.bid 
                              ? `Bid #${shipment.bid.id}` 
                              : `Order #${shipment.id}`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mt-2 space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">From:</span>
                            <span className="font-medium">{shipment.origin}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">To:</span>
                            <span className="font-medium">{shipment.destination}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Expected Delivery:</span>
                            <span className="font-medium">
                              {shipment.estimatedDelivery 
                                ? formatDate(shipment.estimatedDelivery) 
                                : "N/A"}
                            </span>
                          </div>
                          
                          <div className="mt-4">
                            <div className="relative pt-1">
                              <div className="flex mb-2 items-center justify-between">
                                <div>
                                  <span className="text-xs font-semibold inline-block text-primary-500">
                                    {calculateProgress(shipment)}%
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-semibold inline-block text-primary-500">
                                    Progress
                                  </span>
                                </div>
                              </div>
                              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-100">
                                <div 
                                  style={{ width: `${calculateProgress(shipment)}%` }} 
                                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                                ></div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="pt-2 flex justify-between">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedShipment(shipment)}
                            >
                              View Details
                            </Button>
                            {shipment.trackingUrl && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="inline-flex items-center"
                                onClick={() => window.open(shipment.trackingUrl, "_blank")}
                              >
                                Track
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
              
              {filteredShipments.filter((shipment: any) => 
                shipment.status.toLowerCase() === "in_transit"
              ).length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Truck className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No In-Transit Shipments</h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-md">
                    You don't have any shipments currently in transit.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="delivered">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking Number</TableHead>
                    <TableHead>Order/RFQ</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Delivered Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShipments
                    .filter((shipment: any) => shipment.status.toLowerCase() === "delivered")
                    .map((shipment: any) => (
                      <TableRow key={shipment.id}>
                        <TableCell className="font-medium">{shipment.trackingId}</TableCell>
                        <TableCell>
                          {shipment.rfq 
                            ? `RFQ #${shipment.rfq.id}` 
                            : shipment.bid 
                              ? `Bid #${shipment.bid.id}` 
                              : `Order #${shipment.id}`}
                        </TableCell>
                        <TableCell>{shipment.provider}</TableCell>
                        <TableCell>{shipment.origin}</TableCell>
                        <TableCell>{shipment.destination}</TableCell>
                        <TableCell>
                          {shipment.actualDelivery 
                            ? formatDate(shipment.actualDelivery) 
                            : formatDate(shipment.estimatedDelivery)}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setSelectedShipment(shipment)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              
              {filteredShipments.filter((shipment: any) => 
                shipment.status.toLowerCase() === "delivered"
              ).length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Package className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Delivered Shipments</h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-md">
                    You don't have any delivered shipments yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tracking Number</TableHead>
                    <TableHead>Order/RFQ</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredShipments
                    .filter((shipment: any) => shipment.status.toLowerCase() === "pending")
                    .map((shipment: any) => (
                      <TableRow key={shipment.id}>
                        <TableCell className="font-medium">{shipment.trackingId}</TableCell>
                        <TableCell>
                          {shipment.rfq 
                            ? `RFQ #${shipment.rfq.id}` 
                            : shipment.bid 
                              ? `Bid #${shipment.bid.id}` 
                              : `Order #${shipment.id}`}
                        </TableCell>
                        <TableCell>{shipment.provider}</TableCell>
                        <TableCell>{shipment.origin}</TableCell>
                        <TableCell>{shipment.destination}</TableCell>
                        <TableCell>{formatDate(shipment.createdAt)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setSelectedShipment(shipment)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              
              {filteredShipments.filter((shipment: any) => 
                shipment.status.toLowerCase() === "pending"
              ).length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Pending Shipments</h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-md">
                    You don't have any pending shipments.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Shipment Details Dialog */}
      <Dialog open={!!selectedShipment} onOpenChange={() => setSelectedShipment(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Shipment Details</DialogTitle>
            <DialogDescription>
              Tracking ID: {selectedShipment?.trackingId}
            </DialogDescription>
          </DialogHeader>
          
          {selectedShipment && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Shipment Information</h3>
                <div className="bg-gray-50 p-4 rounded-md space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Provider:</span>
                    <span className="text-sm font-medium">{selectedShipment.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Status:</span>
                    <span className="text-sm font-medium">{getStatusBadge(selectedShipment.status)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Weight:</span>
                    <span className="text-sm font-medium">
                      {selectedShipment.weight ? `${selectedShipment.weight} kg` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Created:</span>
                    <span className="text-sm font-medium">{formatDate(selectedShipment.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Expected Delivery:</span>
                    <span className="text-sm font-medium">
                      {selectedShipment.estimatedDelivery 
                        ? formatDate(selectedShipment.estimatedDelivery) 
                        : "N/A"}
                    </span>
                  </div>
                  {selectedShipment.actualDelivery && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Actual Delivery:</span>
                      <span className="text-sm font-medium">{formatDate(selectedShipment.actualDelivery)}</span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-sm font-medium text-gray-500 mt-4 mb-2">From</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm font-medium">{selectedShipment.origin}</p>
                  {selectedShipment.senderAddress && (
                    <p className="text-sm text-gray-500 mt-1">{selectedShipment.senderAddress}</p>
                  )}
                </div>
                
                <h3 className="text-sm font-medium text-gray-500 mt-4 mb-2">To</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm font-medium">{selectedShipment.destination}</p>
                  {selectedShipment.receiverAddress && (
                    <p className="text-sm text-gray-500 mt-1">{selectedShipment.receiverAddress}</p>
                  )}
                </div>
                
                {selectedShipment.trackingUrl && (
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      className="w-full inline-flex items-center justify-center"
                      onClick={() => window.open(selectedShipment.trackingUrl, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Track on {selectedShipment.provider}
                    </Button>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Tracking Timeline</h3>
                {selectedShipment.trackingData?.checkpoints ? (
                  <div className="space-y-4">
                    {selectedShipment.trackingData.checkpoints.map((checkpoint: any, index: number) => (
                      <div key={index} className="relative pl-6 pb-4">
                        <div className="absolute left-0 top-0 h-full">
                          <div className="h-full w-0.5 bg-gray-200"></div>
                        </div>
                        <div className="absolute left-0 top-1 -ml-px">
                          <div className={`h-4 w-4 rounded-full ${
                            checkpoint.status === 'completed' 
                              ? 'bg-primary-500' 
                              : 'bg-gray-200 border-2 border-white'
                          }`}></div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <p className="text-sm font-medium">{checkpoint.description}</p>
                          <p className="text-xs text-gray-500">
                            {checkpoint.date && formatDate(checkpoint.date)}
                            {checkpoint.date && checkpoint.time && ' - '}
                            {checkpoint.time}
                          </p>
                          {checkpoint.location && (
                            <p className="text-xs text-gray-500 mt-1">{checkpoint.location}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-md text-center">
                    <Clipboard className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No tracking details available yet.</p>
                  </div>
                )}
                
                {selectedShipment.customsDocuments && Object.keys(selectedShipment.customsDocuments).length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Customs Documents</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      {Object.entries(selectedShipment.customsDocuments).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex justify-between py-1">
                          <span className="text-sm text-gray-500 capitalize">{key.replace('_', ' ')}:</span>
                          <span className="text-sm font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedShipment.dimensions && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Package Dimensions</h3>
                    <div className="bg-gray-50 p-4 rounded-md grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Length</p>
                        <p className="text-sm font-medium">{selectedShipment.dimensions.length} cm</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Width</p>
                        <p className="text-sm font-medium">{selectedShipment.dimensions.width} cm</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Height</p>
                        <p className="text-sm font-medium">{selectedShipment.dimensions.height} cm</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
