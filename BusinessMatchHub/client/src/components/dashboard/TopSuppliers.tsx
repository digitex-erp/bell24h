import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';

interface Supplier {
  id: number;
  userId: number;
  industry: string;
  riskScore: number;
  complianceScore: number;
  lateDeliveryRate: number;
}

interface TopSuppliersProps {
  suppliers?: Supplier[];
  isLoading: boolean;
}

const TopSuppliers: React.FC<TopSuppliersProps> = ({ suppliers, isLoading }) => {
  // Helper function to get risk category
  const getRiskCategory = (score: number) => {
    if (score < 25) return { text: 'Low', color: 'bg-success-500' };
    if (score < 50) return { text: 'Medium', color: 'bg-warning-500' };
    return { text: 'High', color: 'bg-danger-500' };
  };

  // Helper function to get match rate based on risk score
  const getMatchRate = (score: number) => {
    return Math.round(100 - score * 0.8);
  };

  return (
    <div className="mt-8 mb-12">
      <Card>
        <CardHeader className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Top Suppliers</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Highest rated suppliers matching your industry
            </p>
          </div>
          <div>
            <Link href="/suppliers">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Industry
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Match Rate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GST Verified
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  Array(3)
                    .fill(0)
                    .map((_, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="ml-4">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24 mt-1" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-32" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-4 w-10" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Skeleton className="h-4 w-8 ml-auto" />
                        </td>
                      </tr>
                    ))
                ) : suppliers && suppliers.length > 0 ? (
                  suppliers.map((supplier, index) => {
                    const risk = getRiskCategory(supplier.riskScore);
                    const matchRate = getMatchRate(supplier.riskScore);
                    const initials = `${supplier.industry.charAt(0)}${supplier.industry.charAt(1)}`.toUpperCase();

                    return (
                      <tr key={supplier.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                              <span className="text-sm font-medium">{initials}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {['Alpha Bearings Ltd', 'Tech Electronics', 'Metal Solutions'][index % 3]}
                              </div>
                              <div className="text-sm text-gray-500">
                                {['Pune, Maharashtra', 'Bangalore, Karnataka', 'Chennai, Tamil Nadu'][index % 3]}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{supplier.industry}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-2 w-24 bg-gray-200 rounded overflow-hidden">
                              <div
                                className={`h-full ${risk.color}`}
                                style={{ width: `${100 - supplier.riskScore}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm text-gray-700">{risk.text}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {matchRate}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Verified
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href={`/suppliers/${supplier.id}`}>
                            <a className="text-primary-600 hover:text-primary-900">View</a>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      No suppliers found. Check back later.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TopSuppliers;
