import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { Invoice } from '@shared/schema';

interface KredXSectionProps {
  userId: number;
}

const KredXSection: React.FC<KredXSectionProps> = ({ userId }) => {
  // Fetch invoices where user is seller
  const { 
    data: sellerInvoices = [], 
    isLoading: isLoadingSellerInvoices 
  } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices/seller'],
    enabled: !!userId,
  });

  // Calculate eligible invoices for discounting
  const eligibleInvoices = sellerInvoices.filter(
    invoice => invoice.status === 'pending' && 
    invoice.amount >= 10000 && 
    !invoice.discountRequested
  );

  // Get statistics
  const totalEligibleAmount = eligibleInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const potentialAdvance = Math.floor(totalEligibleAmount * 0.85);
  const totalDiscountedInvoices = sellerInvoices.filter(
    inv => inv.status === 'discounted' || inv.discountRequested
  ).length;

  // Helper functions
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  if (isLoadingSellerInvoices) {
    return <KredXSkeletonCard />;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-white flex items-center">
              <i className="fas fa-bolt mr-2"></i> KredX Invoice Discounting
            </CardTitle>
            <CardDescription className="text-blue-100 mt-1">
              Get paid faster on your pending invoices
            </CardDescription>
          </div>
          <div>
            <img 
              src="https://kredx.com/wp-content/uploads/2023/02/Logo-1.png" 
              alt="KredX Logo" 
              className="h-8 invert opacity-90" 
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <StatCard 
            title="Eligible for Discounting"
            value={eligibleInvoices.length} 
            label="Invoices"
          />
          <StatCard 
            title="Potential Immediate Payment"
            value={formatCurrency(potentialAdvance)} 
            label="85% Advance"
            highlighted={true}
          />
          <StatCard 
            title="Already Discounted"
            value={totalDiscountedInvoices} 
            label="Invoices"
          />
        </div>

        {eligibleInvoices.length > 0 ? (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-blue-800 mb-2">
              <i className="fas fa-info-circle mr-2"></i>
              Instant Payment Opportunity
            </h3>
            <p className="text-blue-700 text-sm mb-3">
              You have {eligibleInvoices.length} pending invoice{eligibleInvoices.length !== 1 ? 's' : ''} eligible for immediate
              payment through KredX. Get up to 85% of your invoice value instantly.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {eligibleInvoices.slice(0, 2).map(invoice => (
                <div key={invoice.id} className="bg-white rounded border p-3 text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{invoice.invoiceNumber}</span>
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                      Pending
                    </Badge>
                  </div>
                  <div className="font-bold text-lg mb-1">
                    {formatCurrency(invoice.amount)}
                  </div>
                  <div className="text-gray-500 text-xs">
                    Due on {new Date(invoice.dueDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
            {eligibleInvoices.length > 2 && (
              <div className="text-blue-600 text-sm font-medium mt-2">
                + {eligibleInvoices.length - 2} more eligible invoices
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-search text-gray-400"></i>
            </div>
            <h3 className="font-medium text-gray-800 mb-1">No Eligible Invoices</h3>
            <p className="text-gray-500 text-sm">
              You don't have any invoices eligible for discounting at this time.
              Create invoices over ₹10,000 to use this feature.
            </p>
          </div>
        )}

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
          <h3 className="font-medium mb-2">How KredX Invoice Discounting Works</h3>
          <ol className="text-sm space-y-2">
            <li className="flex items-start">
              <span className="flex-shrink-0 flex items-center justify-center rounded-full bg-blue-200 text-blue-700 w-5 h-5 mr-2 text-xs font-bold">1</span>
              <span>Submit your invoice for discounting</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 flex items-center justify-center rounded-full bg-blue-200 text-blue-700 w-5 h-5 mr-2 text-xs font-bold">2</span>
              <span>KredX verifies and approves your request</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 flex items-center justify-center rounded-full bg-blue-200 text-blue-700 w-5 h-5 mr-2 text-xs font-bold">3</span>
              <span>Receive 85% of invoice value immediately</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 flex items-center justify-center rounded-full bg-blue-200 text-blue-700 w-5 h-5 mr-2 text-xs font-bold">4</span>
              <span>Receive remaining 14.5% when buyer pays (KredX fee is 0.5%)</span>
            </li>
          </ol>
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50 flex justify-between items-center py-4">
        <div className="text-sm text-gray-500">
          <i className="fas fa-lock mr-1"></i> Secure, fast, and reliable
        </div>
        <Link href="/invoices">
          <Button>
            <i className="fas fa-file-invoice-dollar mr-2"></i>
            Manage Invoices
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  label: string;
  highlighted?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, label, highlighted = false }) => (
  <div className={`p-3 rounded-lg ${
    highlighted 
      ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200' 
      : 'bg-white border'
  }`}>
    <div className="text-sm text-gray-600 mb-1">{title}</div>
    <div className={`text-xl font-bold ${highlighted ? 'text-blue-700' : 'text-gray-800'}`}>
      {value}
    </div>
    <div className="text-xs text-gray-500">{label}</div>
  </div>
);

const KredXSkeletonCard = () => (
  <Card className="animate-pulse">
    <CardHeader className="bg-blue-100">
      <Skeleton className="h-6 w-48 bg-blue-200" />
      <Skeleton className="h-4 w-64 mt-1 bg-blue-200" />
    </CardHeader>
    <CardContent className="pt-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="p-3 rounded-lg border">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-6 w-16 mb-1" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
      <Skeleton className="h-40 w-full rounded-lg mb-4" />
      <Skeleton className="h-32 w-full rounded-lg" />
    </CardContent>
    <CardFooter className="bg-gray-50 py-4">
      <div className="flex justify-between w-full">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-36" />
      </div>
    </CardFooter>
  </Card>
);

export default KredXSection;