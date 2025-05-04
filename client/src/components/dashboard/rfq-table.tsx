import { RFQ } from "@shared/schema";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface RFQTableProps {
  rfqs: RFQ[];
  title?: string;
  onCreateNew?: () => void;
  onViewAll?: () => void;
}

export function RFQTable({ rfqs, title = "Recent RFQs", onCreateNew, onViewAll }: RFQTableProps) {
  // Function to determine badge color based on RFQ status
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "open":
        return "success";
      case "in_review":
        return "warning";
      case "awarded":
        return "info";
      case "closed":
        return "destructive";
      case "draft":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };
  
  // Function to format the deadline relative to now
  const formatDeadline = (deadline: Date | string) => {
    const date = new Date(deadline);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <Card className="bg-white shadow rounded-lg">
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-gray-900">{title}</CardTitle>
          {onCreateNew && (
            <Button variant="link" className="text-sm font-medium text-primary-600 hover:text-primary-500" onClick={onCreateNew}>
              Create new RFQ
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</TableHead>
                <TableHead className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</TableHead>
                <TableHead className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</TableHead>
                <TableHead className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
                <TableHead className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</TableHead>
                <TableHead className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {rfqs.map((rfq) => (
                <TableRow key={rfq.id}>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {rfq.reference_number}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rfq.title}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rfq.category}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getBadgeVariant(rfq.status)}>
                      {rfq.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDeadline(rfq.deadline)}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/rfqs/${rfq.id}`}>
                      <a className="text-primary-600 hover:text-primary-900">View</a>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              
              {rfqs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No RFQs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      {onViewAll && (
        <CardFooter className="p-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onViewAll}
          >
            View all RFQs
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
