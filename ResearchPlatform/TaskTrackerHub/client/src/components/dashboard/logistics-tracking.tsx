import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TrackingStep {
  date: string;
  status: string;
  activity: string;
  location?: string;
}

interface ShipmentTrackingResponse {
  shipmentId: string;
  currentStatus: string;
  expectedDelivery: string;
  steps: TrackingStep[];
  trackingUrl: string;
  progressPercent: number;
}

interface Shipment {
  id: number;
  shipmentNumber: string;
  supplierId: number;
  status: string;
  expectedDelivery: Date | string;
  origin: string;
  destination: string;
  trackingProgress: number;
  tracking?: ShipmentTrackingResponse;
}

export default function LogisticsTracking() {
  // Fetch shipments
  const { data: shipments, isLoading } = useQuery<Shipment[]>({ 
    queryKey: ['/api/shipments']
  });

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-dark-800">Logistics Tracking</h2>
          <a href="#" className="text-sm text-primary-600 hover:text-primary-700">View All Shipments</a>
        </div>

        <div className="border border-dark-200 rounded-lg">
          {isLoading ? (
            <div className="p-8 text-center text-dark-500">
              Loading shipments...
            </div>
          ) : shipments?.length ? (
            <>
              {shipments.slice(0, 2).map((shipment, index) => (
                <div 
                  key={shipment.id} 
                  className={cn(
                    "p-4", 
                    index < shipments.length - 1 && "border-b border-dark-200"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <h4 className="text-md font-medium text-dark-800">Shipment #{shipment.shipmentNumber}</h4>
                        <span className={cn(
                          "ml-2 px-2 py-1 text-xs font-medium rounded-full",
                          shipment.status.toLowerCase() === "in transit" && "bg-blue-100 text-blue-800",
                          shipment.status.toLowerCase() === "delivered" && "bg-green-100 text-green-800"
                        )}>
                          {shipment.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-dark-500">
                        <span className="font-medium">From:</span> {shipment.origin}
                        <span className="mx-2">|</span>
                        <span className="font-medium">To:</span> {shipment.destination}
                      </p>
                    </div>
                    <div className="flex items-center text-sm text-dark-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {shipment.status.toLowerCase() === "delivered" 
                          ? `Delivered: ${new Date(shipment.expectedDelivery).toLocaleDateString()}` 
                          : `Expected: ${new Date(shipment.expectedDelivery).toLocaleDateString()}`
                        }
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="relative">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-dark-100">
                        <div 
                          style={{ width: `${shipment.trackingProgress}%` }} 
                          className={cn(
                            "shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center",
                            shipment.status.toLowerCase() === "delivered" ? "bg-green-500" : "bg-primary-500"
                          )}
                        ></div>
                      </div>
                      
                      {/* Steps */}
                      <div className="flex justify-between mt-2">
                        {/* Generate 5 tracking steps */}
                        {[
                          { name: "Shipped", date: "May 10" },
                          { name: "In Transit", date: "May 12" },
                          { name: "Hub Arrival", date: "May 14" },
                          { name: "Out for Delivery", date: "May 15" },
                          { name: "Delivered", date: "May 15" }
                        ].map((step, idx) => {
                          // Calculate if this step is completed based on tracking progress
                          const stepPosition = (idx + 1) * 20; // 5 steps, each represents 20%
                          const isCompleted = shipment.trackingProgress >= stepPosition;
                          
                          return (
                            <div key={idx} className="text-center">
                              <div 
                                className={cn(
                                  "w-5 h-5 mx-auto mb-1 rounded-full",
                                  isCompleted 
                                    ? (shipment.status.toLowerCase() === "delivered" ? "bg-green-500" : "bg-primary-500") 
                                    : "bg-dark-300"
                                )}
                              ></div>
                              <p className="text-xs text-dark-600">{step.name}</p>
                              <p className="text-xs text-dark-400">{step.date}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="p-8 text-center text-dark-500">
              No shipments found. Your shipment tracking will appear here once available.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
