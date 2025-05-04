import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { CheckIcon, AlertCircle, Info } from "lucide-react";

type StepStatus = "pending" | "active" | "completed" | "error";

interface StepCardProps {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  status: StepStatus;
  active?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  successMessage?: string;
  errorMessage?: string;
}

export function StepCard({
  id,
  title,
  description,
  icon,
  status,
  active = false,
  disabled = false,
  children,
  successMessage,
  errorMessage,
}: StepCardProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return (
          <div className="flex-shrink-0 bg-success-50 rounded-full p-1">
            <CheckIcon className="h-5 w-5 text-success-500" />
          </div>
        );
      case "active":
        return (
          <div className="flex-shrink-0 bg-primary-50 rounded-full p-1">
            {icon}
          </div>
        );
      case "error":
        return (
          <div className="flex-shrink-0 bg-error-50 rounded-full p-1">
            <AlertCircle className="h-5 w-5 text-error-500" />
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 bg-secondary-100 rounded-full p-1">
            {icon}
          </div>
        );
    }
  };

  return (
    <Card
      id={id}
      className={cn(
        "overflow-hidden shadow",
        disabled ? "opacity-50" : ""
      )}
    >
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          {getStatusIcon()}
          <div className="ml-4">
            <h3 className="text-lg font-medium text-secondary-900">{title}</h3>
            <p className="text-sm text-secondary-500">{description}</p>
          </div>
        </div>

        {status === "completed" && successMessage && (
          <div className="mt-4">
            <Alert variant="default" className="bg-success-50 text-success-700 border-success-200">
              <Info className="h-4 w-4 text-success-500" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          </div>
        )}

        {status === "error" && errorMessage && (
          <div className="mt-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          </div>
        )}

        {(active || status === "completed") && children ? (
          <div className="mt-4">{children}</div>
        ) : null}
      </div>
    </Card>
  );
}
