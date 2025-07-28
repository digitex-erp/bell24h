import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuickAction {
  title: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
}

interface QuickActionsProps {
  title?: string;
  actions: QuickAction[];
}

export function QuickActions({ title = "Quick Actions", actions }: QuickActionsProps) {
  return (
    <Card className="bg-white shadow rounded-lg">
      <CardHeader className="p-6">
        <CardTitle className="text-lg font-medium text-gray-900">{title}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 pt-0">
        <div className="grid gap-3">
          {actions.map((action, index) => (
            <a
              key={index}
              href={action.href || "#"}
              className="group flex items-center p-3 text-base font-medium text-gray-900 rounded-md bg-gray-50 hover:bg-primary-50 hover:text-primary-700"
              onClick={(e) => {
                if (action.onClick) {
                  e.preventDefault();
                  action.onClick();
                }
              }}
            >
              <div className={cn(
                "h-6 w-6 text-gray-500 group-hover:text-primary-600 mr-3",
                "flex items-center justify-center"
              )}>
                {action.icon}
              </div>
              {action.title}
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
