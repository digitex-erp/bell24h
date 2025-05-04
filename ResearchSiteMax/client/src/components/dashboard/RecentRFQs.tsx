import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Rfq } from '@shared/schema';

interface RecentRFQsProps {
  rfqs?: Rfq[];
  isLoading: boolean;
}

const RecentRFQs: React.FC<RecentRFQsProps> = ({ rfqs, isLoading }) => {
  return (
    <div className="mt-8">
      <Card>
        <CardHeader className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent RFQs</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Latest requests for quotations</p>
          </div>
          <div>
            <Link href="/my-rfqs">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="border-t border-gray-200">
          <div className="divide-y divide-gray-200">
            {isLoading ? (
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="ml-4">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-24 mt-1" />
                        </div>
                      </div>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-32 mt-2 sm:mt-0 sm:ml-6" />
                      </div>
                      <Skeleton className="h-3 w-28 mt-2 sm:mt-0" />
                    </div>
                  </div>
                ))
            ) : rfqs && rfqs.length > 0 ? (
              rfqs.map((rfq) => (
                <div key={rfq.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
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
                            <span className="text-accent-500">
                              {` (${rfq.rfqType.charAt(0).toUpperCase() + rfq.rfqType.slice(1)} RFQ)`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        rfq.status === 'open' 
                          ? 'bg-green-100 text-green-800' 
                          : rfq.status === 'closed' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <div className="flex items-center text-sm text-gray-500">
                        <i className="fas fa-calendar-alt flex-shrink-0 mr-1.5 text-gray-400"></i>
                        <p>Expires: {new Date(rfq.deadline).toLocaleDateString()}</p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <i className="fas fa-building flex-shrink-0 mr-1.5 text-gray-400"></i>
                        <p>Suppliers matching</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <i className="fas fa-chart-line flex-shrink-0 mr-1.5 text-gray-400"></i>
                      <p>{rfq.matchSuccessRate}% match success</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-10 sm:px-6 text-center text-gray-500">
                No RFQs found. Create your first RFQ to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecentRFQs;
