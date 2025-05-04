import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { IndustryBadge } from "@/components/ui/industry-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Plus, Search, Filter } from "lucide-react";
import CreateRFQModal from "@/components/modals/CreateRFQModal";

export default function RFQList() {
  const [location, navigate] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [industryFilter, setIndustryFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch RFQs with filters
  const { data: rfqs, isLoading } = useQuery({
    queryKey: ['/api/rfqs', statusFilter],
    queryFn: async () => {
      const url = statusFilter ? `/api/rfqs?status=${statusFilter}` : '/api/rfqs';
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch RFQs');
      return response.json();
    }
  });

  // Apply client-side filters
  const filteredRfqs = rfqs?.filter((rfq: any) => {
    const matchesIndustry = industryFilter ? rfq.industry === industryFilter : true;
    const matchesSearch = searchTerm 
      ? rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        rfq.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesIndustry && matchesSearch;
  });

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
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 md:ml-64 min-h-screen">
        <Header title="My RFQs" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>RFQ Management</CardTitle>
                  <CardDescription>
                    View and manage all your requests for quotation
                  </CardDescription>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New RFQ
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex-1 w-full md:max-w-sm">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                    <Input
                      placeholder="Search RFQs..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-neutral-400" />
                    <Select 
                      value={statusFilter} 
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending_approval">Pending Approval</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="canceled">Canceled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Select 
                    value={industryFilter} 
                    onValueChange={setIndustryFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Industries</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="chemicals">Chemicals</SelectItem>
                      <SelectItem value="automotive">Automotive</SelectItem>
                      <SelectItem value="textiles">Textiles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>RFQ ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Quotes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      // Loading skeleton
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredRfqs?.length > 0 ? (
                      filteredRfqs.map((rfq: any) => (
                        <TableRow key={rfq.id} className="hover:bg-neutral-50">
                          <TableCell className="font-medium text-primary-DEFAULT">
                            #{`RFQ-${new Date(rfq.createdAt).getFullYear()}-${rfq.id.toString().padStart(3, '0')}`}
                          </TableCell>
                          <TableCell>{rfq.title}</TableCell>
                          <TableCell>
                            <IndustryBadge industry={rfq.industry} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={rfq.status} />
                          </TableCell>
                          <TableCell className="text-neutral-500">
                            {formatDate(rfq.createdAt)}
                          </TableCell>
                          <TableCell>
                            {/* This would come from a separate query in a real app */}
                            {rfq.status === 'published' ? '0 / 0' : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              onClick={() => handleViewRFQ(rfq.id)}
                              className="text-primary-DEFAULT hover:text-primary-dark"
                            >
                              {rfq.status === 'draft' ? 'Edit' : 'View'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No RFQs found.
                          <Button 
                            variant="link" 
                            onClick={() => setShowCreateModal(true)}
                            className="px-2"
                          >
                            Create your first RFQ
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {filteredRfqs && filteredRfqs.length > 0 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#" isActive>1</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext href="#" />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Create RFQ Modal */}
      <CreateRFQModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
    </div>
  );
}
