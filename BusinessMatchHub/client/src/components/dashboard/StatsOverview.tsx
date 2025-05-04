import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';

interface StatsOverviewProps {
  stats?: {
    activeRfqs: number;
    receivedBids: number;
    awardedContracts: number;
    walletBalance: number;
  };
  isLoading: boolean;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, isLoading }) => {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-medium text-gray-900">Overview</h2>
      <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <i className="fas fa-file-alt text-primary-800 text-xl"></i>
              </div>
              <div className="ml-5 w-0 flex-1">
                <div className="text-sm font-medium text-gray-500 truncate">Active RFQs</div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-6 w-12" />
                  ) : (
                    <div className="text-lg font-semibold text-gray-900">{stats?.activeRfqs || 0}</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link href="/my-rfqs">
                <a className="font-medium text-primary-700 hover:text-primary-900">View all</a>
              </Link>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardContent className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <i className="fas fa-gavel text-primary-800 text-xl"></i>
              </div>
              <div className="ml-5 w-0 flex-1">
                <div className="text-sm font-medium text-gray-500 truncate">Received Bids</div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-6 w-12" />
                  ) : (
                    <div className="text-lg font-semibold text-gray-900">{stats?.receivedBids || 0}</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link href="/my-bids">
                <a className="font-medium text-primary-700 hover:text-primary-900">View all</a>
              </Link>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardContent className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <i className="fas fa-check-circle text-primary-800 text-xl"></i>
              </div>
              <div className="ml-5 w-0 flex-1">
                <div className="text-sm font-medium text-gray-500 truncate">Awarded Contracts</div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-6 w-12" />
                  ) : (
                    <div className="text-lg font-semibold text-gray-900">{stats?.awardedContracts || 0}</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link href="/my-contracts">
                <a className="font-medium text-primary-700 hover:text-primary-900">View all</a>
              </Link>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardContent className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <i className="fas fa-wallet text-primary-800 text-xl"></i>
              </div>
              <div className="ml-5 w-0 flex-1">
                <div className="text-sm font-medium text-gray-500 truncate">Wallet Balance</div>
                <div>
                  {isLoading ? (
                    <Skeleton className="h-6 w-24" />
                  ) : (
                    <div className="text-lg font-semibold text-gray-900">₹{stats?.walletBalance?.toLocaleString() || 0}</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link href="/wallet">
                <a className="font-medium text-primary-700 hover:text-primary-900">Top up</a>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default StatsOverview;
