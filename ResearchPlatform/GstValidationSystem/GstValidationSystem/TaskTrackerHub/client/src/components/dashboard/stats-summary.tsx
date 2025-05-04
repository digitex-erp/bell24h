import { ArrowUp, ArrowDown, FileText, Users, DollarSign, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  changeText: string;
  icon: React.ReactNode;
  iconBgClass: string;
  iconColorClass: string;
}

function StatCard({ title, value, change, changeText, icon, iconBgClass, iconColorClass }: StatCardProps) {
  const isPositive = change >= 0;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${iconBgClass}`}>
            {icon}
          </div>
          <div className="ml-4">
            <h2 className="text-sm font-medium text-dark-500">{title}</h2>
            <p className="text-2xl font-semibold text-dark-800">{value}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center">
            <span className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? (
                <ArrowUp className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(change)}%
            </span>
            <span className="ml-2 text-sm text-dark-500">{changeText}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StatsSummary() {
  // In a real app, these would be fetched from the API
  // This simulates a query that will be implemented with real data later
  const { data, isLoading } = useQuery({ 
    queryKey: ['/api/dashboard/stats'],
    enabled: false, // Disable this query until API endpoint is available
  });
  
  // Static demo data
  const stats = {
    activeRfqs: 27,
    activeRfqsChange: 12,
    newSuppliers: 42,
    newSuppliersChange: 18,
    escrowValue: "₹4.2M",
    escrowValueChange: 24,
    completedDeals: 18,
    completedDealsChange: -5
  };
  
  return (
    <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Active RFQs"
        value={stats.activeRfqs}
        change={stats.activeRfqsChange}
        changeText="from last month"
        icon={<FileText className="w-6 h-6 text-primary-600" />}
        iconBgClass="bg-primary-100"
        iconColorClass="text-primary-600"
      />
      
      <StatCard
        title="New Suppliers"
        value={stats.newSuppliers}
        change={stats.newSuppliersChange}
        changeText="from last month"
        icon={<Users className="w-6 h-6 text-secondary-600" />}
        iconBgClass="bg-secondary-100"
        iconColorClass="text-secondary-600"
      />
      
      <StatCard
        title="Escrow Value"
        value={stats.escrowValue}
        change={stats.escrowValueChange}
        changeText="from last month"
        icon={<DollarSign className="w-6 h-6 text-accent-600" />}
        iconBgClass="bg-accent-100"
        iconColorClass="text-accent-600"
      />
      
      <StatCard
        title="Completed Deals"
        value={stats.completedDeals}
        change={stats.completedDealsChange}
        changeText="from last month"
        icon={<Check className="w-6 h-6 text-green-600" />}
        iconBgClass="bg-green-100"
        iconColorClass="text-green-600"
      />
    </div>
  );
}
