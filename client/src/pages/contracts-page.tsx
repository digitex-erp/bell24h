import { useState } from 'react';
import { useContracts } from '@/hooks/use-contracts';
import { MainLayout } from '@/components/layout/main-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { FileCheck, File, Calendar, AlertTriangle } from 'lucide-react';

export default function ContractsPage() {
  const { contracts, isLoadingContracts, updateContractStatusMutation } = useContracts();
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter contracts based on active tab
  const getFilteredContracts = () => {
    switch (activeTab) {
      case 'draft':
        return contracts.filter(contract => contract.status === 'draft');
      case 'pending':
        return contracts.filter(contract => contract.status === 'pending_approval');
      case 'active':
        return contracts.filter(contract => contract.status === 'active');
      case 'completed':
        return contracts.filter(contract => contract.status === 'completed');
      case 'terminated':
        return contracts.filter(contract => contract.status === 'terminated');
      default:
        return contracts;
    }
  };
  
  // Function to determine badge color based on contract status
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "draft":
        return "secondary";
      case "pending_approval":
        return "warning";
      case "active":
        return "success";
      case "completed":
        return "info";
      case "terminated":
        return "destructive";
      default:
        return "secondary";
    }
  };
  
  // Function to format date
  const formatDate = (date: string | Date | null) => {
    if (!date) return 'Not set';
    return format(new Date(date), 'MMM dd, yyyy');
  };
  
  // Handle status change
  const handleStatusChange = (id: number, newStatus: string) => {
    updateContractStatusMutation.mutate({ id, status: newStatus });
  };
  
  return (
    <MainLayout
      title="Contracts"
      description="Manage your active and past contracts."
    >
      <Tabs 
        defaultValue="all" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="all">All Contracts</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="terminated">Terminated</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Contracts</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Counterparty</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingContracts ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">Loading contracts...</TableCell>
                      </TableRow>
                    ) : getFilteredContracts().length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">No contracts found.</TableCell>
                      </TableRow>
                    ) : (
                      getFilteredContracts().map(contract => (
                        <TableRow key={contract.id}>
                          <TableCell className="font-medium">{contract.title}</TableCell>
                          <TableCell>₹{contract.value}</TableCell>
                          <TableCell>{formatDate(contract.start_date)}</TableCell>
                          <TableCell>{formatDate(contract.end_date)}</TableCell>
                          <TableCell>
                            <Badge variant={getBadgeVariant(contract.status)}>
                              {contract.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {contract.buyer_id === 1 ? `Supplier ${contract.supplier_id}` : `Buyer ${contract.buyer_id}`}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">View</Button>
                              
                              {contract.status === 'draft' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleStatusChange(contract.id, 'pending_approval')}
                                >
                                  Send for Approval
                                </Button>
                              )}
                              
                              {contract.status === 'pending_approval' && (
                                <Button 
                                  variant="success" 
                                  size="sm"
                                  onClick={() => handleStatusChange(contract.id, 'active')}
                                >
                                  Approve
                                </Button>
                              )}
                              
                              {contract.status === 'active' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleStatusChange(contract.id, 'completed')}
                                >
                                  Mark Complete
                                </Button>
                              )}
                              
                              {(contract.status === 'pending_approval' || contract.status === 'active') && (
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleStatusChange(contract.id, 'terminated')}
                                >
                                  Terminate
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Contract Stats */}
      <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="rounded-full p-3 bg-primary-100">
              <FileCheck className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Contracts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {contracts.filter(c => c.status === 'active').length}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="rounded-full p-3 bg-yellow-100">
              <File className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Approval</p>
              <p className="text-2xl font-semibold text-gray-900">
                {contracts.filter(c => c.status === 'pending_approval').length}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="rounded-full p-3 bg-green-100">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {contracts.filter(c => c.status === 'completed').length}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="rounded-full p-3 bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Terminated</p>
              <p className="text-2xl font-semibold text-gray-900">
                {contracts.filter(c => c.status === 'terminated').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
