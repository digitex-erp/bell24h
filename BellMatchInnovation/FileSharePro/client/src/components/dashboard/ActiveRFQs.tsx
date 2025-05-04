import { useState, useEffect } from "react";
import { Filter, ListOrdered, Package, MapPin, Calendar, User } from "lucide-react";
import { formatDate, getStatusColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { RfqWithStats } from "@/types";
import { RFQ } from "@shared/schema";

export default function ActiveRFQs() {
  const [rfqs, setRfqs] = useState<RfqWithStats[]>([]);
  
  const { data: rfqsData, isLoading } = useQuery({
    queryKey: ["/api/rfqs?status=active"],
  });

  useEffect(() => {
    if (rfqsData) {
      // Transform RFQs with additional stats
      const transformedRfqs: RfqWithStats[] = rfqsData.map((rfq: RFQ) => ({
        ...rfq,
        // In a real implementation, these would come from the API
        quoteCount: Math.floor(Math.random() * 8),
        supplierCount: Math.floor(Math.random() * 5) + 1,
        suppliers: Array(Math.floor(Math.random() * 5) + 1).fill(null).map((_, i) => ({
          id: i + 1,
          avatar: `https://ui-avatars.com/api/?name=Supplier+${i+1}&background=random`
        }))
      }));
      
      setRfqs(transformedRfqs);
    }
  }, [rfqsData]);

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-full"></div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg leading-6 font-medium text-neutral-900">Your Active RFQs</h3>
        <div className="flex items-center">
          <Button variant="outline" size="sm" className="mr-2">
            <Filter className="h-3 w-3 mr-1" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <ListOrdered className="h-3 w-3 mr-1" />
            ListOrdered
          </Button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {rfqs.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-neutral-500">No active RFQs found</p>
            <Button className="mt-4">Create your first RFQ</Button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {rfqs.map((rfq) => (
              <li key={rfq.id}>
                <div className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-primary-600 truncate">
                          {rfq.title}
                        </p>
                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(rfq.status)}`}>
                          {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
                        </span>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          <span>{rfq.quoteCount}</span> quotes received
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <Package className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <span>{rfq.categoryId ? `Category ${rfq.categoryId}` : 'Uncategorized'}</span>
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <span>{rfq.location || 'No location specified'}</span>
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <p>
                          Closing on <time>{formatDate(rfq.closingDate)}</time>
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between items-center">
                      <div className="flex items-center">
                        <div className="flex -space-x-1 relative z-0 overflow-hidden">
                          {rfq.suppliers && rfq.suppliers.slice(0, 3).map((supplier, index) => (
                            <img 
                              key={index}
                              className="relative z-30 inline-block h-6 w-6 rounded-full ring-2 ring-white" 
                              src={supplier.avatar} 
                              alt="Supplier avatar" 
                            />
                          ))}
                          {rfq.suppliers && rfq.suppliers.length > 3 && (
                            <div className="h-6 w-6 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                              +{rfq.suppliers.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 ml-2">
                          {rfq.supplierCount} suppliers responded
                        </span>
                      </div>
                      <div>
                        <Button size="sm" className="mr-2">
                          View Quotes
                        </Button>
                        <Button size="sm" variant="outline">
                          Edit RFQ
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
