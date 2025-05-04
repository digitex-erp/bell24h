import { useState, useEffect } from "react";
import { User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Payment } from "@/types";
import { 
  DollarSign, 
  CreditCard, 
  Wallet, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  FileText, 
  Download, 
  Filter,
  ChevronDown,
  Plus
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface PaymentsProps {
  user: User;
}

export default function Payments({ user }: PaymentsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  
  // Fetch payments data
  const { data: payments, isLoading } = useQuery({
    queryKey: ["/api/payments"],
  });
  
  // Mock payments data - in a real implementation, this would come from the API
  useEffect(() => {
    const mockPayments: Payment[] = [
      {
        id: 1,
        quoteId: 101,
        buyerId: 201,
        supplierId: 301,
        amount: 5000,
        currency: "USD",
        status: "completed",
        transactionId: "TRX12345",
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        supplierName: "TechSupply Solutions",
        rfqTitle: "Industrial Sensors and Control Systems"
      },
      {
        id: 2,
        quoteId: 102,
        buyerId: 201,
        supplierId: 302,
        amount: 3500,
        currency: "USD",
        status: "pending",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        supplierName: "GlobalSemi Inc.",
        rfqTitle: "Custom PCB Manufacturing (10,000 units)"
      },
      {
        id: 3,
        quoteId: 103,
        buyerId: 201,
        supplierId: 303,
        amount: 2000,
        currency: "USD",
        status: "processing",
        transactionId: "TRX12346",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        supplierName: "ElectroTech",
        rfqTitle: "Automation Components"
      },
      {
        id: 4,
        quoteId: 104,
        buyerId: 201,
        supplierId: 304,
        amount: 7500,
        currency: "USD",
        status: "completed",
        transactionId: "TRX12347",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
        supplierName: "MetalWorks",
        rfqTitle: "CNC Machined Parts"
      },
      {
        id: 5,
        quoteId: 105,
        buyerId: 201,
        supplierId: 305,
        amount: 1200,
        currency: "USD",
        status: "failed",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        supplierName: "EcoPackaging",
        rfqTitle: "Sustainable Packaging Materials"
      }
    ];
    
    setFilteredPayments(mockPayments);
  }, []);
  
  // Apply filters when search or status changes
  useEffect(() => {
    if (filteredPayments.length === 0) return;
    
    let filtered = [...filteredPayments];
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((payment) => 
        payment.supplierName?.toLowerCase().includes(query) || 
        payment.rfqTitle?.toLowerCase().includes(query) ||
        payment.transactionId?.toLowerCase().includes(query)
      );
    }
    
    setFilteredPayments(filtered);
  }, [statusFilter, searchQuery]);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Payments</h1>
          <p className="text-neutral-500 mt-1">
            Manage and track all your payment transactions
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Funds
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-primary-500 mr-3" />
              <div className="text-3xl font-bold text-neutral-900">$12,500</div>
            </div>
            <p className="text-sm text-neutral-500 mt-2">
              Available for payments and escrow
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="text-xs">
              View Transactions
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Escrow Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-500 mr-3" />
              <div className="text-3xl font-bold text-neutral-900">$7,850</div>
            </div>
            <p className="text-sm text-neutral-500 mt-2">
              Currently in escrow for active deals
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="text-xs">
              Manage Escrow
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-500 mr-3" />
              <div className="text-xl font-medium text-neutral-900">3 Methods</div>
            </div>
            <p className="text-sm text-neutral-500 mt-2">
              Credit cards, bank accounts, and more
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="text-xs">
              Manage Methods
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="incoming">Incoming</TabsTrigger>
            <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col sm:flex-row gap-2 mt-2 md:mt-0">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-56"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                  Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("processing")}>
                  Processing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("failed")}>
                  Failed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        <TabsContent value="all">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                  <div className="h-20 bg-gray-200 rounded w-full"></div>
                  <div className="h-20 bg-gray-200 rounded w-full"></div>
                  <div className="h-20 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ) : filteredPayments.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>RFQ / Quote</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">#{payment.id}</TableCell>
                        <TableCell>{formatDate(payment.createdAt)}</TableCell>
                        <TableCell>{payment.supplierName}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={payment.rfqTitle}>
                          {payment.rfqTitle}
                        </TableCell>
                        <TableCell>{formatCurrency(payment.amount, payment.currency)}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || statusFilter !== "all"
                    ? "No transactions match your search criteria. Try adjusting your filters."
                    : "You haven't made any payments yet."}
                </p>
                <Button>Create Your First Payment</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="incoming">
          <Card>
            <CardContent className="p-8 text-center">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Incoming Payments</h3>
              <p className="text-gray-500 mb-4">
                You don't have any incoming payments at the moment.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="outgoing">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>RFQ / Quote</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">#{payment.id}</TableCell>
                      <TableCell>{formatDate(payment.createdAt)}</TableCell>
                      <TableCell>{payment.supplierName}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={payment.rfqTitle}>
                        {payment.rfqTitle}
                      </TableCell>
                      <TableCell>{formatCurrency(payment.amount, payment.currency)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">View Details</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
