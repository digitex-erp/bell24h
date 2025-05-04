import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatDate, getStatusColorClass } from '@/lib/utils';
import { RFQ_STATUS, RFQ_TYPES } from '@/lib/constants';
import { Link } from 'wouter';
import { ExportActionButton } from '@/components/export/export-action-button';
import { ExportDialog } from '@/components/export/export-dialog';
import { formatRfqsForExport } from '@/lib/export-utils';

interface RFQ {
  id: number;
  title: string;
  description: string;
  status: string;
  type: string;
  category: string;
  createdAt: string;
  responseCount: number;
  deadline?: string;
}

const RFQs = () => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch RFQs from API
  const { data, isLoading } = useQuery({
    queryKey: ['/api/rfqs', { status: filter !== 'all' ? filter : undefined, page: currentPage, limit: itemsPerPage }],
    refetchOnWindowFocus: false,
  });

  const rfqs = data?.rfqs || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Filter RFQs based on search query
  const filteredRfqs = searchQuery.trim() === '' 
    ? rfqs 
    : rfqs.filter((rfq: RFQ) => 
        rfq.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        rfq.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rfq.category.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <i className="fas fa-file-alt text-primary-600"></i>;
      case 'voice':
        return <i className="fas fa-microphone text-success-600"></i>;
      case 'video':
        return <i className="fas fa-video text-warning-600"></i>;
      default:
        return <i className="fas fa-file-alt text-primary-600"></i>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Requests for Quote</h1>
            <p className="text-gray-500">Manage your RFQs and view supplier responses</p>
          </div>
          <div className="flex gap-2">
            {filteredRfqs.length > 0 && (
              <>
                <ExportActionButton
                  data={filteredRfqs}
                  exportType="rfq"
                  filename="bell24h_rfqs.csv"
                  title="Bell24h RFQs"
                  buttonText="Quick Export"
                  variant="outline"
                />
                <ExportDialog
                  data={formatRfqsForExport(filteredRfqs)}
                  columns={[
                    { header: 'ID', key: 'id' },
                    { header: 'Title', key: 'title' },
                    { header: 'Category', key: 'category' },
                    { header: 'Status', key: 'status' },
                    { header: 'Type', key: 'type' },
                    { header: 'Created Date', key: 'createdAt' },
                    { header: 'Deadline', key: 'deadline' },
                    { header: 'Responses', key: 'responseCount' },
                    { header: 'Budget', key: 'budget' },
                    { header: 'Quantity', key: 'quantity' },
                    { header: 'Description', key: 'description' },
                  ]}
                  title="Export RFQs"
                  description="Export your Request for Quotes with customizable options."
                  defaultFilename="bell24h_rfqs.csv"
                  trigger={
                    <Button variant="outline" size="sm" className="ml-2">
                      <i className="fas fa-sliders-h mr-2"></i> Advanced Export
                    </Button>
                  }
                />
              </>
            )}
            <Link href="/voice-rfq">
              <Button className="space-x-2">
                <i className="fas fa-plus"></i>
                <span>New RFQ</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg shadow">
          <div className="w-full md:w-1/3 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              <i className="fas fa-search"></i>
            </span>
            <Input
              placeholder="Search RFQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex space-x-2 w-full md:w-auto">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All RFQs</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select defaultValue="newest">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="responses">Most Responses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-4">
            {isLoading ? (
              // Loading skeleton for list view
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-white p-4 rounded-lg shadow flex animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="w-24">
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredRfqs.length > 0 ? (
              <div className="space-y-4">
                {filteredRfqs.map((rfq: RFQ) => (
                  <div key={rfq.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                    <div className="flex items-center">
                      <div className="mr-4">
                        {getTypeIcon(rfq.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-lg text-gray-800">{rfq.title}</h3>
                          <Badge className={getStatusColorClass(rfq.status)}>{rfq.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{rfq.category}</p>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{rfq.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{formatDate(rfq.createdAt)}</p>
                        <p className="text-sm text-primary-600 mt-1">
                          {rfq.responseCount} {rfq.responseCount === 1 ? 'response' : 'responses'}
                        </p>
                        {rfq.deadline && (
                          <p className="text-xs text-warning-600 mt-1">
                            Due: {formatDate(rfq.deadline)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <i className="fas fa-eye mr-1"></i> View
                      </Button>
                      {rfq.status === 'active' && (
                        <Button variant="outline" size="sm">
                          <i className="fas fa-edit mr-1"></i> Edit
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <i className="fas fa-file-alt text-4xl text-gray-300 mb-3"></i>
                <h3 className="text-lg font-medium text-gray-700">No RFQs Found</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {searchQuery ? 'Try a different search term or clear filters.' : 'Create your first RFQ to get started.'}
                </p>
                <Link href="/voice-rfq">
                  <Button className="mt-4">Create New RFQ</Button>
                </Link>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="grid" className="mt-4">
            {isLoading ? (
              // Loading skeleton for grid view
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredRfqs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRfqs.map((rfq: RFQ) => (
                  <Card key={rfq.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(rfq.type)}
                          <Badge className={getStatusColorClass(rfq.status)}>{rfq.status}</Badge>
                        </div>
                        <div className="text-xs text-gray-500">{formatDate(rfq.createdAt)}</div>
                      </div>
                      <CardTitle className="text-lg mt-2">{rfq.title}</CardTitle>
                      <CardDescription>{rfq.category}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-gray-600 line-clamp-3">{rfq.description}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center pt-2">
                      <div className="text-sm text-primary-600">
                        {rfq.responseCount} {rfq.responseCount === 1 ? 'response' : 'responses'}
                      </div>
                      <Link href={`/rfqs/${rfq.id}`}>
                        <Button size="sm">View Details</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <i className="fas fa-file-alt text-4xl text-gray-300 mb-3"></i>
                <h3 className="text-lg font-medium text-gray-700">No RFQs Found</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {searchQuery ? 'Try a different search term or clear filters.' : 'Create your first RFQ to get started.'}
                </p>
                <Link href="/voice-rfq">
                  <Button className="mt-4">Create New RFQ</Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <i className="fas fa-chevron-left"></i>
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((page, i, arr) => (
                  <React.Fragment key={page}>
                    {i > 0 && arr[i - 1] !== page - 1 && (
                      <Button variant="outline" size="sm" disabled>
                        ...
                      </Button>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                ))
              }
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <i className="fas fa-chevron-right"></i>
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RFQs;
