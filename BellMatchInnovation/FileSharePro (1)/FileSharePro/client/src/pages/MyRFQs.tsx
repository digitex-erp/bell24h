import { useState, useEffect } from "react";
import { User, RFQ } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  FileText, 
  PlusCircle, 
  Search, 
  Filter, 
  Calendar, 
  Package, 
  MapPin,
  ShoppingCart,
  Clock
} from "lucide-react";
import { formatDate, getStatusColor } from "@/lib/utils";
import CreateRFQDialog from "@/components/rfq/CreateRFQDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MyRFQsProps {
  user: User;
}

export default function MyRFQs({ user }: MyRFQsProps) {
  const [createRFQOpen, setCreateRFQOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredRfqs, setFilteredRfqs] = useState<RFQ[]>([]);
  
  // Fetch the user's RFQs
  const { data: rfqs, isLoading, refetch } = useQuery({
    queryKey: ["/api/rfqs"],
  });

  // Apply filters when data changes
  useEffect(() => {
    if (rfqs) {
      let filtered = [...rfqs];
      
      // Apply status filter
      if (statusFilter !== "all") {
        filtered = filtered.filter((rfq) => rfq.status === statusFilter);
      }
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter((rfq) => 
          rfq.title.toLowerCase().includes(query) || 
          rfq.description.toLowerCase().includes(query)
        );
      }
      
      setFilteredRfqs(filtered);
    }
  }, [rfqs, statusFilter, searchQuery]);

  const handleRFQCreated = () => {
    refetch();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "closed":
        return <ShoppingCart className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">My RFQs</h1>
          <p className="text-neutral-500 mt-1">
            Manage and track all your Request for Quotes
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={() => setCreateRFQOpen(true)}
            className="inline-flex items-center"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New RFQ
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search RFQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All RFQs</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Card key={item} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredRfqs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRfqs.map((rfq) => (
                <Card key={rfq.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-md">{rfq.title}</CardTitle>
                        <CardDescription>
                          Created: {formatDate(rfq.createdAt)}
                        </CardDescription>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(rfq.status)}`}>
                        {getStatusIcon(rfq.status)}
                        <span className="ml-1">{rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}</span>
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {rfq.description}
                    </div>
                    <div className="flex flex-col space-y-1 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        <span>Closing: {formatDate(rfq.closingDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <Package className="h-3.5 w-3.5 mr-1" />
                        <span>Category: {rfq.categoryId || "Uncategorized"}</span>
                      </div>
                      {rfq.location && (
                        <div className="flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          <span>{rfq.location}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Link href={`/my-rfqs/${rfq.id}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                    <Link href={`/my-rfqs/${rfq.id}/quotes`}>
                      <Button size="sm">View Quotes</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No RFQs Found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery
                  ? "No RFQs match your search criteria. Try adjusting your filters."
                  : "You haven't created any RFQs yet. Create your first RFQ to get started."}
              </p>
              <Button onClick={() => setCreateRFQOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create New RFQ
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Other tab contents would follow the same pattern but with filtered data */}
        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRfqs
              .filter(rfq => rfq.status === "active")
              .map((rfq) => (
                <Card key={rfq.id} className="overflow-hidden">
                  {/* Same card content as above */}
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-md">{rfq.title}</CardTitle>
                        <CardDescription>
                          Created: {formatDate(rfq.createdAt)}
                        </CardDescription>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(rfq.status)}`}>
                        {getStatusIcon(rfq.status)}
                        <span className="ml-1">{rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}</span>
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {rfq.description}
                    </div>
                    <div className="flex flex-col space-y-1 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        <span>Closing: {formatDate(rfq.closingDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <Package className="h-3.5 w-3.5 mr-1" />
                        <span>Category: {rfq.categoryId || "Uncategorized"}</span>
                      </div>
                      {rfq.location && (
                        <div className="flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          <span>{rfq.location}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Link href={`/my-rfqs/${rfq.id}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                    <Link href={`/my-rfqs/${rfq.id}/quotes`}>
                      <Button size="sm">View Quotes</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
        
        {/* Similar TabsContent for pending and closed tabs */}
      </Tabs>

      <CreateRFQDialog 
        open={createRFQOpen} 
        onOpenChange={setCreateRFQOpen} 
        onRFQCreated={handleRFQCreated}
      />
    </div>
  );
}
