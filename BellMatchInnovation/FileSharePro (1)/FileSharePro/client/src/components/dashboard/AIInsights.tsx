import { BarChart2, Users, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { User, MarketData } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import AIExplanationDialog from "../ai/AIExplanationDialog";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  AreaChart, 
  Area, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid 
} from "recharts";

interface AIInsightsProps {
  user: User;
}

interface TopSupplier {
  id: number;
  name: string;
  company: string;
  avatar: string;
  matchScore: number;
  riskLevel: "low" | "medium" | "high";
  riskScore: string;
  rfqTitle: string;
}

export default function AIInsights({ user }: AIInsightsProps) {
  const [explanationOpen, setExplanationOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [topSuppliers, setTopSuppliers] = useState<TopSupplier[]>([]);
  
  // Fetch market data
  const { data: marketData, isLoading } = useQuery<MarketData[]>({
    queryKey: ["/api/market-data"],
    initialData: [] // Initialize with empty array to prevent TypeScript errors
  });

  useEffect(() => {
    // This would be fetched from the API in a real implementation
    setTopSuppliers([
      {
        id: 1,
        name: "TechSupply Solutions",
        company: "TechSupply Solutions Ltd.",
        avatar: "https://ui-avatars.com/api/?name=TechSupply+Solutions&background=random",
        matchScore: 92,
        riskLevel: "low",
        riskScore: "Low",
        rfqTitle: "Electronic Components"
      },
      {
        id: 2,
        name: "GlobalSemi Inc.",
        company: "GlobalSemi Incorporated",
        avatar: "https://ui-avatars.com/api/?name=GlobalSemi+Inc&background=random",
        matchScore: 87,
        riskLevel: "medium",
        riskScore: "Medium",
        rfqTitle: "PCB Manufacturing"
      },
      {
        id: 3,
        name: "ElectroTech",
        company: "ElectroTech Solutions",
        avatar: "https://ui-avatars.com/api/?name=ElectroTech&background=random",
        matchScore: 84,
        riskLevel: "low",
        riskScore: "Low",
        rfqTitle: "Automation Components"
      }
    ]);
  }, []);

  const prepareChartData = (data: MarketData[] | undefined) => {
    if (!data || data.length === 0) return [];
    
    // Group by category to get cleaner visualization
    const categoryGroups: Record<string, MarketData[]> = {};
    
    data.forEach(item => {
      const category = item.category || 'Unknown';
      if (!categoryGroups[category]) {
        categoryGroups[category] = [];
      }
      categoryGroups[category].push(item);
    });
    
    // Create a unified dataset with recent price changes
    return Object.keys(categoryGroups).map(category => {
      const items = categoryGroups[category];
      const avgChange = items.reduce((sum, item) => sum + (item.changePercent || 0), 0) / items.length;
      
      return {
        name: category,
        value: avgChange * 100, // Convert to percentage
        fill: avgChange >= 0 ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
        stroke: avgChange >= 0 ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)",
      };
    });
  };

  const handleExplainMatch = (supplierId: number) => {
    setSelectedSupplierId(supplierId);
    setExplanationOpen(true);
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg leading-6 font-medium text-neutral-900 mb-4">AI Market Insights</h3>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="bg-primary-100 p-2 rounded-md">
                  <BarChart2 className="h-5 w-5 text-primary-700" />
                </div>
                <h4 className="ml-3 text-lg font-medium text-neutral-800">Market Price Trends</h4>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 h-64">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : marketData && marketData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={prepareChartData(marketData)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis
                        tickFormatter={(value) => `${value.toFixed(1)}%`}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value: number) => [`${value.toFixed(2)}%`, 'Price Change']}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#3B82F6"
                        fill="rgba(59, 130, 246, 0.2)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-neutral-500">
                    <p>No market data available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="bg-primary-100 p-2 rounded-md">
                  <Users className="h-5 w-5 text-primary-700" />
                </div>
                <h4 className="ml-3 text-lg font-medium text-neutral-800">Top Supplier Matches</h4>
              </div>
              
              {topSuppliers.map((supplier, index) => (
                <div key={supplier.id} className={`border-b border-gray-200 pb-4 mb-4 ${index === topSuppliers.length - 1 ? 'last:border-0 last:pb-0 last:mb-0' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <img 
                        src={supplier.avatar} 
                        alt={`${supplier.name} logo`} 
                        className="h-10 w-10 rounded-full mr-3"
                      />
                      <div>
                        <p className="text-sm font-medium text-neutral-800">{supplier.name}</p>
                        <div className="flex items-center mt-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className="h-4 w-4 text-amber-400"
                                fill={i < Math.floor(supplier.matchScore / 20) ? "currentColor" : "none"}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-neutral-500 ml-1">{supplier.matchScore}% match</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                        supplier.riskLevel === 'low' 
                          ? 'bg-green-100 text-green-800' 
                          : supplier.riskLevel === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        Verified
                      </span>
                      <p className="text-xs text-neutral-500 mt-1">
                        Risk score: <span className={
                          supplier.riskLevel === 'low' 
                            ? 'text-green-600 font-medium' 
                            : supplier.riskLevel === 'medium'
                            ? 'text-yellow-600 font-medium'
                            : 'text-red-600 font-medium'
                        }>{supplier.riskScore}</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <p className="text-xs text-neutral-500">Based on your RFQ for {supplier.rfqTitle}</p>
                    <button 
                      onClick={() => handleExplainMatch(supplier.id)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View match explanation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <AIExplanationDialog 
        open={explanationOpen} 
        onOpenChange={setExplanationOpen} 
        supplierId={selectedSupplierId} 
      />
    </div>
  );
}
