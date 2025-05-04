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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { RfqForm } from "@/components/rfq/rfq-form";
import { calculateDaysLeft, formatDate, getStatusBadgeClass } from "@/lib/utils";
import { Plus, Filter, Search, FileText, ChevronRight } from "lucide-react";
import { Link } from "wouter";

export default function Rfqs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all_statuses");
  const [categoryFilter, setCategoryFilter] = useState("all_categories");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("my_rfqs");

  // Fetch RFQs
  const { data: rfqs = [], isLoading } = useQuery({
    queryKey: ["/api/rfqs", activeTab, statusFilter, categoryFilter, searchTerm],
  });

  // Fetch categories for filter
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const filteredRfqs = rfqs;

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="px-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">RFQ Management</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage your Requests for Quotation.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="inline-flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Create RFQ
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <RfqForm onClose={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="my_rfqs" onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="my_rfqs">My RFQs</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Manage RFQs</CardTitle>
            <CardDescription>
              Browse, filter, and manage your RFQ listings.
            </CardDescription>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search RFQs..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_statuses">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-review">In Review</SelectItem>
                    <SelectItem value="awarded">Awarded</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={handleCategoryFilter}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_categories">All Categories</SelectItem>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TabsContent value="my_rfqs" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-sm text-gray-500">Loading RFQs...</p>
                </div>
              ) : filteredRfqs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <FileText className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No RFQs Found</h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-md">
                    Create your first RFQ by clicking the "Create RFQ" button above.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>RFQ Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Responses</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRfqs.map((rfq: any) => {
                        const daysLeft = calculateDaysLeft(rfq.deadline);
                        return (
                          <TableRow key={rfq.id}>
                            <TableCell className="font-medium">{rfq.title}</TableCell>
                            <TableCell>{rfq.category?.name || "Unknown"}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{formatDate(rfq.deadline)}</span>
                                <span className="text-xs text-gray-500">
                                  {daysLeft > 0
                                    ? `${daysLeft} days left`
                                    : "Expired"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{rfq.bidCount || 0}</TableCell>
                            <TableCell>
                              <span className={getStatusBadgeClass(rfq.status)}>
                                {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Link href={`/rfqs/${rfq.id}`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <ChevronRight className="h-4 w-4" />
                                  <span className="sr-only">View</span>
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="marketplace" className="mt-0">
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <h3 className="text-lg font-medium text-gray-900">Marketplace RFQs</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-md">
                  Browse and respond to RFQs from other businesses.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="draft" className="mt-0">
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <h3 className="text-lg font-medium text-gray-900">Draft RFQs</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-md">
                  You have no draft RFQs. Drafts are saved automatically when creating an RFQ.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="archived" className="mt-0">
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <h3 className="text-lg font-medium text-gray-900">Archived RFQs</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-md">
                  You have no archived RFQs. Completed RFQs can be archived for future reference.
                </p>
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
