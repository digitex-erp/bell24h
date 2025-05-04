import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type Integration = {
  name: string;
  description: string;
  status: string;
  lastChecked: string;
  uptime: number;
};

type IntegrationStatusProps = {
  data: {
    integrations: Integration[];
  };
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Online":
      return <CheckCircle className="h-6 w-6 text-green-600" />;
    case "Partial":
      return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
    case "Issue":
      return <AlertCircle className="h-6 w-6 text-red-600" />;
    default:
      return <AlertCircle className="h-6 w-6 text-neutral-600" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Online":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Online
        </Badge>
      );
    case "Partial":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          Partial
        </Badge>
      );
    case "Issue":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          Issue
        </Badge>
      );
    default:
      return (
        <Badge className="bg-neutral-100 text-neutral-800 hover:bg-neutral-100">
          Unknown
        </Badge>
      );
  }
};

const formatLastChecked = (lastChecked: string) => {
  const date = new Date(lastChecked);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) {
    return "Just now";
  } else if (diffMins === 1) {
    return "1 minute ago";
  } else if (diffMins < 60) {
    return `${diffMins} minutes ago`;
  } else if (diffMins < 120) {
    return "1 hour ago";
  } else {
    return `${Math.floor(diffMins / 60)} hours ago`;
  }
};

export default function IntegrationStatus({ data }: IntegrationStatusProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate API call with a timeout
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/integration-status'] });
      setIsRefreshing(false);
      
      toast({
        title: "Integration status refreshed",
        description: "The integration status has been updated.",
      });
    }, 1500);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-foreground">Integration Status</h2>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          className="flex items-center"
          variant="outline"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </div>
      
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.integrations.map((integration, index) => (
              <div key={index} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex items-center justify-center bg-primary/10 rounded-md mr-3">
                      {getStatusIcon(integration.status)}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-foreground">{integration.name}</h3>
                      <p className="text-xs text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(integration.status)}
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  <span className="font-medium">Last checked:</span> {formatLastChecked(integration.lastChecked)}
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">API health:</span> {integration.uptime}% uptime in last 24h
                </div>

                {/* Uptime indicator bar */}
                <div className="mt-3 w-full bg-muted h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      integration.uptime >= 99 ? 'bg-green-500' : 
                      integration.uptime >= 90 ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`}
                    style={{ width: `${integration.uptime}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
