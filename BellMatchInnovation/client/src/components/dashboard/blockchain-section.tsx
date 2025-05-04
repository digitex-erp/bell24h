import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowRight, Info, ZapIcon } from 'lucide-react';
import { OneClickSimulator } from '../blockchain/one-click-simulator';

/**
 * Blockchain integration section for the wallet page
 */
export const BlockchainSection: React.FC = () => {
  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-800 text-white">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>One-Click Blockchain</CardTitle>
            <CardDescription className="text-blue-100">Instant demo without real crypto</CardDescription>
          </div>
          <div className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded text-xs">
            <ZapIcon className="h-3 w-3 mr-1" />
            <span>Lightning Fast</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 pb-0">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Experience secure escrow payments, milestone-based releases, and dispute resolution with our blockchain integration.
          </p>
          
          <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-sm text-blue-700">
            <div className="flex">
              <Info className="h-5 w-5 mr-2 flex-shrink-0 text-blue-500" />
              <span>
                Try our one-click blockchain simulator to experience how blockchain 
                payments work without requiring any cryptocurrency.
              </span>
            </div>
          </div>
          
          <OneClickSimulator />
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2 pb-4">
        <div className="text-xs text-gray-500">
          <span className="font-semibold">Benefits:</span> Secure, Immutable, Transparent
        </div>
        <Link href="/blockchain-payment">
          <a>
            <Button variant="outline" size="sm" className="text-xs">
              Make A Payment
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </a>
        </Link>
      </CardFooter>
    </Card>
  );
};