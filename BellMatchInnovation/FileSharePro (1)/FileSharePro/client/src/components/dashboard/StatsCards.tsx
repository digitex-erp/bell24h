import { Link } from "wouter";
import { FileText, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { DashboardStats, StatsCardProps } from "@/types";

interface StatsCardsProps {
  stats: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const statsData: StatsCardProps[] = [
    {
      title: "Active RFQs",
      value: stats.activeRfqs,
      icon: <FileText className="h-6 w-6 text-primary-600" />,
      color: "bg-primary-100",
      link: "/my-rfqs",
      linkText: "View all",
    },
    {
      title: "Quotes Received",
      value: stats.quotesReceived,
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      color: "bg-green-100",
      link: "/my-rfqs",
      linkText: "View all",
    },
    {
      title: "Pending Responses",
      value: stats.pendingResponses,
      icon: <Clock className="h-6 w-6 text-amber-600" />,
      color: "bg-amber-100",
      link: "/my-rfqs",
      linkText: "View all",
    },
    {
      title: "AI Match Score",
      value: stats.aiMatchScore,
      icon: <TrendingUp className="h-6 w-6 text-indigo-600" />,
      color: "bg-indigo-100",
      link: "/analytics",
      linkText: "View details",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {statsData.map((stat, index) => (
        <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                {stat.icon}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-neutral-500 truncate">
                    {stat.title}
                  </dt>
                  <dd>
                    <div className="text-lg font-semibold text-neutral-900">
                      {stat.value}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link href={stat.link}>
                <a className="font-medium text-primary-600 hover:text-primary-500">
                  {stat.linkText}
                  <span className="sr-only"> {stat.title}</span>
                </a>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
