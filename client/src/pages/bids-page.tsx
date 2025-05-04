import { useState } from 'react';
import { useBids } from '@/hooks/use-bids';
import { useRFQs } from '@/hooks/use-rfqs';
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
import { formatDistanceToNow } from 'date-fns';

export default function BidsPage() {
  const { getBids } = useBids();
  const { rfqs } = useRFQs();
  const [activeTab, setActiveTab] = useState('received');
  
  // Get bids - in a real app, you would filter based on user role and tab
  const { data: allBids = [], isLoading } = getBids();
  
  // Sample data - in a real app, you would filter from actual bids
  // For demonstration, we'll assume some bids are sent by the current user
  // and others are received
  const receivedBids = allBids.filter((_, index) => index % 2 === 0);
  const sentBids = allBids.filter((_, index) => index % 2 === 1);
  
  // Function to get RFQ title by ID
  const getRFQTitle = (rfqId: number) => {
    const rfq = rfqs.find(r => r.id === rfqId);
    return rfq ? rfq.title : 'Unknown RFQ';
  };
  
  // Function to determine badge color based on bid status
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "under_review":
        return "warning";
      case "accepted":
        return "success";
      case "rejected":
        return "destructive";
      case "withdrawn":
        return "outline";
      default:
        return "secondary";
    }
  };
  
  // Function to format date relative to now
  const formatDate = (date: string | Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };
  
  return (
    <MainLayout
      title="Bids"
      description="Manage your bids and proposals for RFQs."
    >
      <Tabs 
        defaultValue="received" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="received">Bids Received</TabsTrigger>
          <TabsTrigger value="sent">Bids Sent</TabsTrigger>
        </TabsList>
        
        <TabsContent value="received">
          <Card>
            <CardHeader>
              <CardTitle>Bids Received</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>RFQ</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Delivery Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">Loading bids...</TableCell>
                      </TableRow>
                    ) : receivedBids.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">No bids received yet.</TableCell>
                      </TableRow>
                    ) : (
                      receivedBids.map(bid => (
                        <TableRow key={bid.id}>
                          <TableCell>{getRFQTitle(bid.rfq_id)}</TableCell>
                          <TableCell>Supplier {bid.supplier_id}</TableCell>
                          <TableCell>₹{bid.price}</TableCell>
                          <TableCell>{bid.delivery_time}</TableCell>
                          <TableCell>
                            <Badge variant={getBadgeVariant(bid.status)}>
                              {bid.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(bid.created_at)}</TableCell>
                          <TableCell>
                            <div className="space-x-2">
                              <Button variant="outline" size="sm">View</Button>
                              {bid.status === 'pending' && (
                                <>
                                  <Button variant="success" size="sm">Accept</Button>
                                  <Button variant="destructive" size="sm">Reject</Button>
                                </>
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
        
        <TabsContent value="sent">
          <Card>
            <CardHeader>
              <CardTitle>Bids Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>RFQ</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Delivery Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">Loading bids...</TableCell>
                      </TableRow>
                    ) : sentBids.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">You haven't submitted any bids yet.</TableCell>
                      </TableRow>
                    ) : (
                      sentBids.map(bid => (
                        <TableRow key={bid.id}>
                          <TableCell>{getRFQTitle(bid.rfq_id)}</TableCell>
                          <TableCell>₹{bid.price}</TableCell>
                          <TableCell>{bid.delivery_time}</TableCell>
                          <TableCell>
                            <Badge variant={getBadgeVariant(bid.status)}>
                              {bid.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(bid.created_at)}</TableCell>
                          <TableCell>
                            <div className="space-x-2">
                              <Button variant="outline" size="sm">View</Button>
                              {bid.status === 'pending' && (
                                <Button variant="outline" size="sm">Edit</Button>
                              )}
                              {bid.status !== 'withdrawn' && bid.status !== 'rejected' && bid.status !== 'accepted' && (
                                <Button variant="destructive" size="sm">Withdraw</Button>
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
    </MainLayout>
  );
}
