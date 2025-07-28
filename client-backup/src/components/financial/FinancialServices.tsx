import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import KredXService from './KredXService';
import M1ExchangeService from './M1ExchangeService';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';

interface ServiceComparisonItem {
  name: string;
  description: string;
  bestFor: string;
  feeStructure: string;
  advantages: string[];
}

interface ServiceComparison {
  kredx: ServiceComparisonItem;
  m1Exchange: ServiceComparisonItem;
  recommendations: {
    useKredxWhen: string[];
    useM1When: string[];
  };
}

const FinancialServices: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch service comparison data
  const { data: comparisonData, isLoading } = useQuery<ServiceComparison>({
    queryKey: ['/api/financial/compare'],
    staleTime: 300000, // 5 minutes
  });

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Financial Services</h1>
          <Button variant="outline" asChild>
            <a href="/wallet" className="flex items-center">
              <i className="fas fa-wallet mr-2"></i>
              Back to Wallet
            </a>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border-b w-full justify-start p-0 rounded-none">
            <TabsTrigger 
              value="overview" 
              className="py-3 px-6 data-[state=active]:border-b-2 data-[state=active]:border-primary-600 data-[state=inactive]:border-b-0 rounded-none"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="kredx" 
              className="py-3 px-6 data-[state=active]:border-b-2 data-[state=active]:border-primary-600 data-[state=inactive]:border-b-0 rounded-none"
            >
              KredX Invoice Financing
            </TabsTrigger>
            <TabsTrigger 
              value="m1exchange" 
              className="py-3 px-6 data-[state=active]:border-b-2 data-[state=active]:border-primary-600 data-[state=inactive]:border-b-0 rounded-none"
            >
              M1 Exchange Early Payments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bell24H Financial Services</CardTitle>
                  <CardDescription>
                    Choose the right financial service for your business needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p>
                      Bell24H Marketplace offers two complementary financial service providers to help suppliers 
                      manage cash flow and buyers optimize payment terms.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                      <Button 
                        variant="outline" 
                        className="h-auto py-6 flex flex-col items-center justify-center gap-2 hover:bg-gray-50" 
                        onClick={() => setActiveTab('kredx')}
                      >
                        <i className="fas fa-file-invoice-dollar text-3xl text-primary-600 mb-2"></i>
                        <span className="font-medium">KredX Invoice Financing</span>
                        <span className="text-sm text-gray-500">Convert unpaid invoices to cash</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-auto py-6 flex flex-col items-center justify-center gap-2 hover:bg-gray-50" 
                        onClick={() => setActiveTab('m1exchange')}
                      >
                        <i className="fas fa-tasks text-3xl text-primary-600 mb-2"></i>
                        <span className="font-medium">M1 Exchange Early Payments</span>
                        <span className="text-sm text-gray-500">Get paid as soon as milestones are approved</span>
                      </Button>
                    </div>
                    
                    <h3 className="text-lg font-medium mt-8 mb-4">Which service should I use?</h3>
                    
                    {isLoading ? (
                      <p>Loading recommendations...</p>
                    ) : comparisonData ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-primary-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Choose KredX When:</h4>
                          <ul className="list-disc ml-5 space-y-1 text-sm">
                            {comparisonData.recommendations.useKredxWhen.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="bg-primary-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Choose M1 Exchange When:</h4>
                          <ul className="list-disc ml-5 space-y-1 text-sm">
                            {comparisonData.recommendations.useM1When.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <p>Unable to load service comparison. Please try again later.</p>
                    )}
                    
                    <div className="bg-yellow-50 p-4 rounded-lg mt-6">
                      <h4 className="font-medium flex items-center">
                        <i className="fas fa-lightbulb text-yellow-600 mr-2"></i>
                        Pro Tip
                      </h4>
                      <p className="text-sm mt-2">
                        For maximum financial flexibility, you can use both services strategically:
                        Use M1 Exchange for immediate cash flow needs tied to completed milestones,
                        and KredX for longer-term financing needs and larger invoice amounts.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Service Comparison</CardTitle>
                  <CardDescription>
                    Side-by-side comparison of our financial services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p>Loading comparison data...</p>
                  ) : comparisonData ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr>
                            <th className="text-left font-medium text-gray-500 pb-3"></th>
                            <th className="text-left font-medium text-gray-500 pb-3">KredX</th>
                            <th className="text-left font-medium text-gray-500 pb-3">M1 Exchange</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          <tr>
                            <td className="py-3 font-medium">Primary Focus</td>
                            <td className="py-3">Invoice financing</td>
                            <td className="py-3">Milestone payments</td>
                          </tr>
                          <tr>
                            <td className="py-3 font-medium">Payment Trigger</td>
                            <td className="py-3">Invoice upload</td>
                            <td className="py-3">Milestone approval</td>
                          </tr>
                          <tr>
                            <td className="py-3 font-medium">Funding Source</td>
                            <td className="py-3">External investors</td>
                            <td className="py-3">Escrow account</td>
                          </tr>
                          <tr>
                            <td className="py-3 font-medium">Fee Structure</td>
                            <td className="py-3">{comparisonData.kredx.feeStructure}</td>
                            <td className="py-3">{comparisonData.m1Exchange.feeStructure}</td>
                          </tr>
                          <tr>
                            <td className="py-3 font-medium">Best For</td>
                            <td className="py-3">{comparisonData.kredx.bestFor}</td>
                            <td className="py-3">{comparisonData.m1Exchange.bestFor}</td>
                          </tr>
                          <tr>
                            <td className="py-3 font-medium">Availability</td>
                            <td className="py-3">Dependent on investor interest</td>
                            <td className="py-3">Immediate on approval</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>Unable to load comparison data. Please try again later.</p>
                  )}
                  
                  <div className="mt-6 flex justify-end space-x-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveTab('kredx')}
                    >
                      Try KredX
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('m1exchange')}
                    >
                      Try M1 Exchange
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="kredx">
            <KredXService />
          </TabsContent>

          <TabsContent value="m1exchange">
            <M1ExchangeService />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FinancialServices;
