import { useState } from "react";
import { Rfq } from "@shared/schema";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ExternalLink, MessageSquare } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface RfqListProps {
  rfqs: Rfq[];
  isLoading: boolean;
  isSupplier: boolean;
}

export default function RfqList({ rfqs, isLoading, isSupplier }: RfqListProps) {
  const [expandedRfqId, setExpandedRfqId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedRfqId(expandedRfqId === id ? null : id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800 border-green-200";
      case "matched":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-gray-500">Loading RFQs...</p>
      </div>
    );
  }

  if (!rfqs.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isSupplier
            ? "No RFQs available at the moment"
            : "You haven't submitted any RFQs yet"}
        </h3>
        <p className="text-gray-500 mb-6">
          {isSupplier
            ? "Check back later for new opportunities"
            : "Submit your first RFQ to get matched with suppliers"}
        </p>

        {!isSupplier && (
          <Link href="/rfq">
            <Button asChild>
              <a>Submit an RFQ</a>
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {rfqs.map((rfq) => (
        <Card key={rfq.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{rfq.title}</h3>
                <Badge variant="outline" className={getStatusColor(rfq.status)}>
                  {rfq.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <p className="text-sm text-gray-900">{rfq.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Budget</p>
                  <p className="text-sm text-gray-900">
                    {rfq.budget
                      ? `₹${parseFloat(rfq.budget.toString()).toLocaleString('en-IN')}`
                      : 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-sm text-gray-900">{rfq.location}</p>
                </div>
              </div>

              {expandedRfqId === rfq.id && (
                <>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                    <p className="text-sm text-gray-900">{rfq.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Quantity</p>
                      <p className="text-sm text-gray-900">{rfq.quantity.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Deadline</p>
                      <p className="text-sm text-gray-900">
                        {new Date(rfq.deadline).toLocaleDateString()}
                        <span className="text-gray-500 ml-1">
                          ({formatDistanceToNow(new Date(rfq.deadline), { addSuffix: true })})
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">GST Required</p>
                      <p className="text-sm text-gray-900">{rfq.gstRequired ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleExpand(rfq.id)}
                >
                  {expandedRfqId === rfq.id ? 'Show Less' : 'Show More'}
                </Button>

                {isSupplier && rfq.status === 'open' && (
                  <Link href={`/rfq/${rfq.id}/quote`}>
                    <Button size="sm" asChild>
                      <a>Submit Quote</a>
                    </Button>
                  </Link>
                )}

                {!isSupplier && (
                  <Link href={`/rfq/${rfq.id}/quotes`}>
                    <Button size="sm" variant="outline" asChild>
                      <a>
                        <MessageSquare className="h-4 w-4 mr-1" />
                        View Quotes
                      </a>
                    </Button>
                  </Link>
                )}

                <Link href={`/rfq/${rfq.id}`}>
                  <Button size="sm" variant="ghost" asChild>
                    <a>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Details
                    </a>
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


interface RFQ {
  id: string;
  title: string;
  status: "pending" | "active" | "completed";
  suppliers: number;
  date: string;
}

const rfqs: RFQ[] = [
  {
    id: "RFQ-001",
    title: "Industrial Equipment Supply",
    status: "active",
    suppliers: 5,
    date: "2024-02-20"
  },
  {
    id: "RFQ-002",
    title: "Raw Materials Procurement",
    status: "pending",
    suppliers: 3,
    date: "2024-02-19"
  },
  {
    id: "RFQ-003",
    title: "Logistics Services",
    status: "completed",
    suppliers: 4,
    date: "2024-02-18"
  }
];

export function RFQList() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Recent RFQs</h2>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Suppliers</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rfqs.map((rfq) => (
              <TableRow key={rfq.id}>
                <TableCell className="font-medium">{rfq.id}</TableCell>
                <TableCell>{rfq.title}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      rfq.status === "active" ? "default" :
                        rfq.status === "pending" ? "secondary" : "outline"
                    }
                  >
                    {rfq.status}
                  </Badge>
                </TableCell>
                <TableCell>{rfq.suppliers}</TableCell>
                <TableCell>{rfq.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}