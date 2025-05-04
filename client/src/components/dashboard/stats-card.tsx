import { ReactNode } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  linkText?: string;
  linkHref?: string;
  className?: string;
  onClick?: () => void;
}

export function StatsCard({
  title,
  value,
  icon,
  linkText,
  linkHref,
  className,
  onClick,
}: StatsCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      
      {(linkText && linkHref) && (
        <CardFooter className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <a 
              href={linkHref} 
              className="font-medium text-primary-700 hover:text-primary-900"
              onClick={(e) => {
                if (onClick) {
                  e.preventDefault();
                  onClick();
                }
              }}
            >
              {linkText}
            </a>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
