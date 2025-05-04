import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { generateRealisticShapValues } from "@/lib/shap-explainer";
import { generateSupplierRiskScore } from "@/lib/risk-scoring";

export default function AIFeatures() {
  const [activeTab, setActiveTab] = useState("supplier-insights");
  
  // In a real implementation, these would be fetched from the API
  const { data: suppliers } = useQuery({ 
    queryKey: ['/api/suppliers'],
  });

  // Generate SHAP explanation for recommendations
  const shapExplanation = generateRealisticShapValues(94);
  
  // Generate risk scores for sample suppliers
  const techLabsRiskScore = generateSupplierRiskScore("TechLabs India", 89);
  const electroMartRiskScore = generateSupplierRiskScore("ElectroMart Ltd", 72);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-dark-800">AI-Powered Features</h2>
          <a href="#" className="text-sm text-primary-600 hover:text-primary-700">View All</a>
        </div>

        {/* AI Insights Tabs */}
        <div className="border-b border-dark-200">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent border-b-0 -mb-px space-x-8">
              <TabsTrigger 
                value="supplier-insights"
                className="data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 border-b-2 border-transparent px-1 py-4"
              >
                Supplier Insights
              </TabsTrigger>
              <TabsTrigger 
                value="risk-scoring"
                className="data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 border-b-2 border-transparent px-1 py-4"
              >
                Risk Scoring
              </TabsTrigger>
              <TabsTrigger 
                value="predictive"
                className="data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 border-b-2 border-transparent px-1 py-4"
              >
                Predictive Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="market-trends"
                className="data-[state=active]:border-primary-600 data-[state=active]:text-primary-600 border-b-2 border-transparent px-1 py-4"
              >
                Market Trends
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="supplier-insights" className="mt-6">
              <h3 className="mb-4 text-md font-semibold text-dark-700">SHAP/LIME Explainability for Recommendations</h3>
              <div className="p-4 border border-dark-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-10 h-10 bg-dark-100 rounded-full">
                      <span className="text-lg font-semibold text-dark-600">ST</span>
                    </div>
                  </div>
                  <div className="flex-1 ml-4">
                    <div className="flex items-center">
                      <h4 className="text-lg font-medium text-dark-800">Supertronics Ltd</h4>
                      <span className="ml-2 px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                        {shapExplanation.outputValue.toFixed(0)}% Match
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-dark-500">Electronics Component Supplier, Mumbai</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium text-dark-700">Top factors influencing this recommendation:</p>
                  <div className="space-y-3">
                    {shapExplanation.features.slice(0, 4).map((feature, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-dark-600">{feature.displayName}</span>
                          <span className="text-sm font-medium text-dark-700">+{Math.abs(feature.value).toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-2 bg-dark-100 rounded-full">
                          <div 
                            className="h-2 bg-green-500 rounded-full" 
                            style={{ width: `${Math.abs(feature.value)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end mt-4 space-x-2">
                  <Button variant="outline" size="sm" className="text-dark-500 border-dark-300 hover:bg-dark-50">
                    View Profile
                  </Button>
                  <Button size="sm" className="text-white bg-primary-600 hover:bg-primary-700">
                    Send RFQ
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="risk-scoring" className="mt-8">
              <h3 className="mb-4 text-md font-semibold text-dark-700">Supplier Risk Scoring (Aladin Algorithm)</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Supplier 1 */}
                <div className="p-4 border border-dark-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 mr-2 text-sm font-medium text-white bg-dark-800 rounded-full">TL</span>
                      <h4 className="text-md font-medium text-dark-800">TechLabs India</h4>
                    </div>
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-50">
                      <span className="text-xl font-bold text-green-600">{techLabsRiskScore.overallScore}</span>
                    </div>
                  </div>
                  <div className="flex mt-3 text-sm text-dark-600">
                    <div className="w-1/2">
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Financial Stability
                      </p>
                      <p className="flex items-center mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Quality Control
                      </p>
                    </div>
                    <div className="w-1/2">
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Delivery Record
                      </p>
                      <p className="flex items-center mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Compliance Risk
                      </p>
                    </div>
                  </div>
                </div>

                {/* Supplier 2 */}
                <div className="p-4 border border-dark-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 mr-2 text-sm font-medium text-white bg-dark-800 rounded-full">EM</span>
                      <h4 className="text-md font-medium text-dark-800">ElectroMart Ltd</h4>
                    </div>
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-50">
                      <span className="text-xl font-bold text-yellow-600">{electroMartRiskScore.overallScore}</span>
                    </div>
                  </div>
                  <div className="flex mt-3 text-sm text-dark-600">
                    <div className="w-1/2">
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Financial Stability
                      </p>
                      <p className="flex items-center mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Quality Control
                      </p>
                    </div>
                    <div className="w-1/2">
                      <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Delivery Record
                      </p>
                      <p className="flex items-center mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Compliance Risk
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="predictive" className="mt-6">
              <h3 className="mb-4 text-md font-semibold text-dark-700">Predictive Analytics for RFQ Success</h3>
              <div className="space-y-4">
                <div className="p-4 border border-dark-200 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <div>
                      <h4 className="font-medium">RFQ-2023-8721</h4>
                      <p className="text-sm text-dark-500">PCB Boards - 4 Layer</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        87% Success
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-dark-100 rounded-full">
                    <div className="h-2 bg-green-500 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                  <div className="mt-2 text-xs text-dark-500">
                    Key factors: High supplier availability, competitive pricing, standard specs
                  </div>
                </div>
                
                <div className="p-4 border border-dark-200 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <div>
                      <h4 className="font-medium">RFQ-2023-8720</h4>
                      <p className="text-sm text-dark-500">Resistor Kit - 5000pcs</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        72% Success
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-dark-100 rounded-full">
                    <div className="h-2 bg-yellow-500 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                  <div className="mt-2 text-xs text-dark-500">
                    Key factors: Medium supplier competition, standard delivery timeline
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="market-trends" className="mt-6">
              <h3 className="mb-4 text-md font-semibold text-dark-700">Market Trend Analysis</h3>
              <div className="space-y-4">
                <div className="flex items-center p-3 rounded-md bg-dark-50">
                  <div className="w-8 h-8 flex items-center justify-center bg-green-100 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-dark-800">Semiconductor Shortage Easing</p>
                    <p className="text-xs text-dark-500">Expected 12% increase in supply over next quarter</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 rounded-md bg-dark-50">
                  <div className="w-8 h-8 flex items-center justify-center bg-red-100 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-dark-800">Copper Prices Increasing</p>
                    <p className="text-xs text-dark-500">8% price increase over last month</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
