import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartData, IndustryTrend } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, ChevronDown } from "lucide-react";

interface AnalyticsChartProps {
  title: string;
  description?: string;
  chartData: ChartData[];
  industryTrends: IndustryTrend[];
  metrics: {
    name: string;
    value: string;
  }[];
  period: string;
  onPeriodChange: (period: string) => void;
}

export function AnalyticsChart({
  title,
  description,
  chartData,
  industryTrends,
  metrics,
  period,
  onPeriodChange,
}: AnalyticsChartProps) {
  const chartContainer = useRef<HTMLDivElement>(null);
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);

  // In a real implementation, this would use a charting library like recharts
  // For now, we'll just render a simplified version

  const renderBarChart = () => {
    return (
      <div className="h-40 w-full bg-gradient-to-r from-primary-100 to-primary-50 rounded-lg relative">
        <div className="absolute bottom-0 w-full">
          <div className="flex items-end justify-between h-32 px-6">
            {chartData.map((item, index) => (
              <div
                key={index}
                className={`w-2 bg-primary-${item.value > 20 ? "500" : "400"} rounded-t-sm`}
                style={{ height: `${Math.min(32, item.value)}px` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-medium text-gray-900">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex">
            <Button
              variant="outline"
              size="sm"
              className="ml-3 inline-flex items-center"
            >
              <Filter className="h-5 w-5 mr-2 text-gray-400" />
              Filter
            </Button>
            <DropdownMenu open={isPeriodOpen} onOpenChange={setIsPeriodOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-3 inline-flex items-center">
                  {period}
                  <ChevronDown className="ml-2 h-5 w-5 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onPeriodChange("Last 7 days")}>
                  Last 7 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPeriodChange("Last 30 days")}>
                  Last 30 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPeriodChange("Last 90 days")}>
                  Last 90 days
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPeriodChange("Custom range")}>
                  Custom range
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 py-4">
        <div className="flex flex-wrap -mx-3">
          <div className="w-full px-3 lg:w-2/3 lg:border-r border-gray-200 pr-4">
            {/* Chart Visualization */}
            <div className="rounded-lg bg-gray-50 p-4 h-64 flex items-center justify-center">
              <div className="text-center">
                {renderBarChart()}
                <p className="mt-2 text-sm text-gray-500">Chart: Monthly RFQ Activity</p>
              </div>
            </div>
            <div className="mt-4 flex justify-between">
              {metrics.map((metric, index) => (
                <div key={index} className="text-center">
                  <p className="text-lg font-bold text-gray-900">{metric.value}</p>
                  <p className="text-sm text-gray-500">{metric.name}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full px-3 lg:w-1/3">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Industry Trend Analysis
            </h4>
            <ul className="space-y-3">
              {industryTrends.map((trend, index) => (
                <li key={index} className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`bg-${trend.color} h-2.5 rounded-full`}
                      style={{ width: `${trend.value}%` }}
                    ></div>
                  </div>
                  <span className="ml-4 text-sm text-gray-600 w-28">{trend.category}</span>
                  <span className="ml-auto text-sm font-medium text-gray-900">
                    {trend.percentageText}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Button variant="link" className="text-sm font-medium text-primary-500 p-0">
                View detailed market analysis →
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
