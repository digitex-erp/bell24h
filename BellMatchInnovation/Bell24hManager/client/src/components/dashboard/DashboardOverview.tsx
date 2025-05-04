import { Card, CardContent } from "@/components/ui/card";
import { ChevronUp, ChevronDown, FileText, Clock, Users, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface DashboardStat {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
}

export default function DashboardOverview() {
  // Fetch analytics data
  const { data, isLoading } = useQuery({
    queryKey: ['/api/analytics/trading?days=30'],
  });

  const stats: DashboardStat[] = [
    {
      title: "Active RFQs",
      value: isLoading ? "-" : data?.summary?.rfqCount || 0,
      change: 14.6,
      changeLabel: "from last month",
      icon: <FileText className="h-6 w-6" />,
      iconBgColor: "bg-primary-light/10",
      iconColor: "text-primary-DEFAULT"
    },
    {
      title: "Pending Quotes",
      value: isLoading ? "-" : data?.summary?.quoteCount || 0,
      change: -3.2,
      changeLabel: "from last month",
      icon: <Clock className="h-6 w-6" />,
      iconBgColor: "bg-warning/10",
      iconColor: "text-warning"
    },
    {
      title: "Matched Suppliers",
      value: isLoading ? "-" : 128,
      change: 28.4,
      changeLabel: "from last month",
      icon: <Users className="h-6 w-6" />,
      iconBgColor: "bg-secondary-DEFAULT/10",
      iconColor: "text-secondary-DEFAULT"
    },
    {
      title: "Avg. Response Time",
      value: isLoading ? "-" : `${data?.summary?.avgResponseTime || 0}h`,
      change: 12.1,
      changeLabel: "faster than last month",
      icon: <Zap className="h-6 w-6" />,
      iconBgColor: "bg-info/10",
      iconColor: "text-info"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-5">
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-medium text-neutral-700">{stat.title}</h3>
                <p className="text-3xl font-bold text-neutral-900">{stat.value}</p>
              </div>
              <div className={`h-12 w-12 flex items-center justify-center rounded-full ${stat.iconBgColor}`}>
                <div className={stat.iconColor}>
                  {stat.icon}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {stat.change > 0 ? (
                <span className="text-success font-medium flex items-center">
                  <ChevronUp className="h-4 w-4 mr-1" />
                  {Math.abs(stat.change)}%
                </span>
              ) : (
                <span className="text-error font-medium flex items-center">
                  <ChevronDown className="h-4 w-4 mr-1" />
                  {Math.abs(stat.change)}%
                </span>
              )}
              <span className="text-neutral-500 ml-2">{stat.changeLabel}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
