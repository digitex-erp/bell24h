import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IndustryBadge } from "@/components/ui/industry-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { useNavigate } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function RFQTable() {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  const { data: rfqs, isLoading } = useQuery({
    queryKey: ['/api/rfqs'],
  });

  // Show only the first 5 RFQs unless showAll is true
  const displayRfqs = showAll ? rfqs : rfqs?.slice(0, 5);

  const handleViewRFQ = (id: number) => {
    navigate(`/rfq/${id}`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold text-neutral-900">Recent RFQs</h2>
        <Button 
          variant="ghost" 
          className="flex items-center text-sm font-medium text-primary-DEFAULT hover:text-primary-dark"
          onClick={() => navigate('/rfq/list')}
        >
          <span>View All</span>
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="flex flex-col">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="overflow-hidden border-b border-neutral-200">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        RFQ ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Product/Service
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Industry
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Published
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Quotes
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {isLoading ? (
                      // Loading skeleton
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="hover:bg-neutral-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Skeleton className="h-6 w-24" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Skeleton className="h-6 w-32 mb-1" />
                            <Skeleton className="h-4 w-16" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Skeleton className="h-6 w-24 rounded-full" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Skeleton className="h-6 w-20 rounded-full" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Skeleton className="h-6 w-24" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Skeleton className="h-6 w-12" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Skeleton className="h-6 w-10 ml-auto" />
                          </td>
                        </tr>
                      ))
                    ) : displayRfqs?.length > 0 ? (
                      displayRfqs.map((rfq) => (
                        <tr key={rfq.id} className="hover:bg-neutral-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-primary-DEFAULT">#{`RFQ-${new Date(rfq.createdAt).getFullYear()}-${rfq.id.toString().padStart(3, '0')}`}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-neutral-900">{rfq.title}</div>
                            <div className="text-xs text-neutral-500">{rfq.quantity} units</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <IndustryBadge industry={rfq.industry} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={rfq.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                            {rfq.status === 'published' ? formatDate(rfq.updatedAt) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                            {/* This would come from a separate query in a real app */}
                            {rfq.status === 'published' ? '0 / 0' : '0 / 0'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button 
                              variant="ghost" 
                              className="text-primary-DEFAULT hover:text-primary-dark"
                              onClick={() => handleViewRFQ(rfq.id)}
                            >
                              {rfq.status === 'draft' ? 'Edit' : 'View'}
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-sm text-neutral-500">
                          No RFQs found. <Button variant="link" onClick={() => navigate('/rfq/create')}>Create your first RFQ</Button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
