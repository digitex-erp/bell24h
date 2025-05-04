import { cn } from "@/lib/utils";
import { StatsCardProps } from "@/types";

export function StatsCard({
  icon,
  iconClass,
  title,
  value,
  trend,
  subtitle
}: StatsCardProps) {
  return (
    <div className="stats-card">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={cn("stats-icon", iconClass)}>{icon}</div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-bold text-gray-900">{value}</div>
              </dd>
              {trend && (
                <dd className={cn(
                  "flex items-center text-sm mt-1",
                  {
                    "text-green-600": trend.direction === "up",
                    "text-red-600": trend.direction === "down",
                    "text-yellow-600": trend.direction === "stable"
                  }
                )}>
                  {trend.direction === "up" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  )}
                  {trend.direction === "down" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  )}
                  {trend.direction === "stable" && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6" />
                    </svg>
                  )}
                  <span className="ml-1">{trend.value}</span>
                </dd>
              )}
              {subtitle && (
                <dd className="text-sm text-gray-600 mt-1">{subtitle}</dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
