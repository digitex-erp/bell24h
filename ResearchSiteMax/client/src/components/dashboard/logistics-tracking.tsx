import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";
import { Link } from "wouter";
import { getStatusBadgeClass } from "@/lib/utils";
import { LogisticsTrackingItem } from "@/types";

interface LogisticsTrackingProps {
  shipments: LogisticsTrackingItem[];
}

export function LogisticsTracking({ shipments }: LogisticsTrackingProps) {
  return (
    <Card>
      <CardHeader className="px-6 py-5 border-b border-gray-200">
        <CardTitle className="text-lg font-medium leading-6 text-gray-900">
          Logistics Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-5">
        <div className="flow-root">
          <ul role="list" className="-my-5 divide-y divide-gray-200">
            {shipments.map((shipment) => (
              <li key={shipment.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-blue-50 text-blue-500">
                      <Truck className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      Tracking #{shipment.trackingNumber}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      Order #{shipment.orderNumber} • {shipment.description}
                    </p>
                  </div>
                  <div>
                    <span className={getStatusBadgeClass(shipment.status)}>
                      {shipment.status}
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="relative">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                      <div
                        style={{ width: `${shipment.progress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                      ></div>
                    </div>
                    <div className="flex text-xs justify-between mt-1">
                      <span className={shipment.origin === shipment.current ? "text-blue-500 font-medium" : ""}>
                        {shipment.origin}
                      </span>
                      <span className={
                        shipment.current !== shipment.origin && 
                        shipment.current !== shipment.destination 
                          ? "text-blue-500 font-medium" 
                          : ""
                      }>
                        {shipment.current !== shipment.origin && 
                         shipment.current !== shipment.destination 
                          ? shipment.current 
                          : "In Transit"}
                      </span>
                      <span className={shipment.destination === shipment.current ? "text-blue-500 font-medium" : ""}>
                        {shipment.destination}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="px-6 py-3 bg-gray-50 text-right">
        <Link href="/logistics">
          <Button variant="link" className="text-sm font-medium text-primary-500 p-0">
            View all shipments →
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
