import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';

const QuickActions: React.FC = () => {
  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/voice-rfq">
          <Card className="hover:shadow-md transition-shadow duration-300 border-2 border-accent-500 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-accent-500 rounded-md p-3">
                  <i className="fas fa-microphone text-white text-xl"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-gray-500 truncate">Voice RFQ</div>
                  <div className="text-lg font-semibold text-gray-900">Create New</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/create-rfq">
          <Card className="hover:shadow-md transition-shadow duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-800 rounded-md p-3">
                  <i className="fas fa-file-alt text-white text-xl"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-gray-500 truncate">Text RFQ</div>
                  <div className="text-lg font-semibold text-gray-900">Create New</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/create-rfq?type=video">
          <Card className="hover:shadow-md transition-shadow duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-800 rounded-md p-3">
                  <i className="fas fa-video text-white text-xl"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-gray-500 truncate">Video RFQ</div>
                  <div className="text-lg font-semibold text-gray-900">Create New</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/suppliers">
          <Card className="hover:shadow-md transition-shadow duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-800 rounded-md p-3">
                  <i className="fas fa-search text-white text-xl"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-gray-500 truncate">Find Suppliers</div>
                  <div className="text-lg font-semibold text-gray-900">Search Now</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default QuickActions;
