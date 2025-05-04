import React from 'react';
import { Card } from '../ui/card';
import { Table } from '../ui/table';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';

interface RFQ {
  id: string;
  title: string;
  status: 'open' | 'closed' | 'in_progress';
  createdAt: string;
  quotesCount: number;
}

export const RfqOverviewDashboard: React.FC = () => {
  const [rfqs, setRfqs] = React.useState<RFQ[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    fetchRfqs();
  }, []);

  const fetchRfqs = async () => {
    try {
      const response = await fetch('/api/rfqs');
      const data = await response.json();
      setRfqs(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch RFQs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">RFQ Overview</h2>
      <div className="overflow-x-auto">
        <Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Created</th>
              <th>Quotes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-4">Loading...</td>
              </tr>
            ) : rfqs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4">No RFQs found</td>
              </tr>
            ) : (
              rfqs.map((rfq) => (
                <tr key={rfq.id}>
                  <td>{rfq.id}</td>
                  <td>{rfq.title}</td>
                  <td>
                    <Badge className={getStatusColor(rfq.status)}>
                      {rfq.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </td>
                  <td>{new Date(rfq.createdAt).toLocaleDateString()}</td>
                  <td>{rfq.quotesCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </Card>
  );
};