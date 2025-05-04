import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { getStatusBadgeClass } from "@/lib/utils";
import { Link } from "wouter";
import { Rfq } from "@shared/schema";

interface RecentRfqsProps {
  rfqs: Rfq[];
}

export function RecentRfqs({ rfqs }: RecentRfqsProps) {
  return (
    <Card>
      <CardHeader className="px-6 py-5 border-b border-gray-200">
        <CardTitle className="text-lg font-medium leading-6 text-gray-900">
          Recent RFQs
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-5">
        <div className="flow-root">
          <ul role="list" className="-my-5 divide-y divide-gray-200">
            {rfqs.map((rfq) => (
              <li key={rfq.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary-50 text-primary-500">
                      <FileText className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {rfq.title}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      RFQ #{rfq.id} • {rfq.bidCount} responses
                    </p>
                  </div>
                  <div>
                    <span className={getStatusBadgeClass(rfq.status)}>
                      {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="px-6 py-3 bg-gray-50 text-right">
        <Link href="/rfqs">
          <Button variant="link" className="text-sm font-medium text-primary-500 p-0">
            View all RFQs →
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
