import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Rfq } from '@shared/schema';

const MyRFQs: React.FC = () => {
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<string>('all');

  // Fetch RFQs from API
  const { data: rfqs, isLoading, error } = useQuery<Rfq[]>({ queryKey: ['/api/rfqs'] });

  // Filter RFQs based on status
  const filteredRfqs = React.useMemo(() => {
    if (!rfqs) return [];
    if (filter === 'all') return rfqs;
    return rfqs.filter((rfq) => rfq.status === filter);
  }, [rfqs, filter]);

  // Handle creating a new RFQ
  const handleCreateRFQ = () => {
    setLocation('/create-rfq');
  };

  // Handle viewing a specific RFQ
  const handleViewRFQ = (id: number) => {
    setLocation(`/rfq/${id}`);
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const getStatusProps = (status: string) => {
      switch (status) {
        case 'open':
          return { variant: 'success' as const, label: 'Open' };
        case 'closed':
          return { variant: 'destructive' as const, label: 'Closed' };
        case 'awarded':
          return { variant: 'default' as const, label: 'Awarded' };
        case 'expired':
          return { variant: 'outline' as const, label: 'Expired' };
        default:
          return { variant: 'secondary' as const, label: status.charAt(0).toUpperCase() + status.slice(1) };
      }
    };

    const { variant, label } = getStatusProps(status);
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">My RFQs</h1>
          <Button onClick={handleCreateRFQ}>
            <i className="fas fa-plus mr-2"></i>
            Create New RFQ
          </Button>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <Tabs defaultValue={filter} onValueChange={setFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="open">Open</TabsTrigger>
                <TabsTrigger value="closed">Closed</TabsTrigger>
                <TabsTrigger value="awarded">Awarded</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              // Loading states
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="ml-4">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32 mt-1" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <div className="mt-4">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full mt-2" />
                    </div>
                    <div className="mt-4 flex justify-between">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              // Error state
              <div className="p-10 text-center">
                <p className="text-red-500">Failed to load RFQs. Please try again.</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : filteredRfqs.length === 0 ? (
              // Empty state
              <div className="p-10 text-center">
                <i className="fas fa-file-alt text-gray-300 text-5xl"></i>
                <p className="text-gray-500 mt-4">No RFQs found</p>
                <Button className="mt-4" onClick={handleCreateRFQ}>
                  Create Your First RFQ
                </Button>
              </div>
            ) : (
              // RFQ list
              <div className="space-y-4">
                {filteredRfqs.map((rfq) => (
                  <div
                    key={rfq.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleViewRFQ(rfq.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <i className={`fas fa-${
                            rfq.rfqType === 'voice' 
                              ? 'microphone' 
                              : rfq.rfqType === 'video' 
                                ? 'video' 
                                : 'file-alt'
                          } text-primary-800`}></i>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-primary-800">{rfq.title}</div>
                          <div className="text-sm text-gray-500">
                            {rfq.referenceNumber}
                            {rfq.rfqType !== 'text' && (
                              <span className="text-accent-500 ml-1">
                                ({rfq.rfqType.charAt(0).toUpperCase() + rfq.rfqType.slice(1)})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={rfq.status} />
                    </div>
                    <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {rfq.description}
                    </div>
                    <div className="mt-4 flex justify-between text-xs text-gray-500">
                      <div>
                        <i className="fas fa-calendar-alt mr-1"></i>
                        Deadline: {new Date(rfq.deadline).toLocaleDateString()}
                      </div>
                      <div>
                        <i className="fas fa-chart-line mr-1"></i>
                        {rfq.matchSuccessRate || 0}% match success
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyRFQs;
