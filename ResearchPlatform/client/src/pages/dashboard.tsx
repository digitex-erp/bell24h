import { useQuery } from "@tanstack/react-query";
import { getProjectCompletion, getPriorityTasks, getIntegrationStatus, getSystemHealth } from "@/lib/api";
import ProjectCompletion from "@/components/dashboard/ProjectCompletion";
import PriorityTasks from "@/components/dashboard/PriorityTasks";
import IntegrationStatus from "@/components/dashboard/IntegrationStatus";
import SystemHealth from "@/components/dashboard/SystemHealth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { webSocketService } from "@/lib/websocket";

export default function Dashboard() {
  const { toast } = useToast();

  // Fetch project completion data
  const completionQuery = useQuery({
    queryKey: ['/api/dashboard/completion'],
    staleTime: 60000, // 1 minute
  });

  // Fetch priority tasks
  const tasksQuery = useQuery({
    queryKey: ['/api/dashboard/priority-tasks'],
    staleTime: 60000, // 1 minute
  });

  // Fetch integration status
  const integrationQuery = useQuery({
    queryKey: ['/api/dashboard/integration-status'],
    staleTime: 60000, // 1 minute
  });

  // Fetch system health
  const healthQuery = useQuery({
    queryKey: ['/api/dashboard/system-health'],
    staleTime: 60000, // 1 minute
  });

  // Listen for WebSocket updates
  useEffect(() => {
    const handleIncident = (data: any) => {
      toast({
        title: "New Incident Reported",
        description: data.incident.title,
        variant: "destructive",
      });
      
      // Refresh system health data
      healthQuery.refetch();
    };
    
    const handleIntegrationChange = (data: any) => {
      toast({
        title: "Integration Status Changed",
        description: `${data.integration.name} is now ${data.integration.status}`,
        variant: data.integration.status === "Online" ? "default" : "destructive",
      });
      
      // Refresh integration status data
      integrationQuery.refetch();
    };
    
    const handleTaskUpdate = (data: any) => {
      toast({
        title: "Task Updated",
        description: `${data.task.title} is now ${data.task.status} (${data.task.completion}%)`,
      });
      
      // Refresh tasks data
      tasksQuery.refetch();
    };
    
    // Register WebSocket event handlers
    webSocketService.on('incident', handleIncident);
    webSocketService.on('integration_change', handleIntegrationChange);
    webSocketService.on('task_update', handleTaskUpdate);
    
    return () => {
      // Clean up WebSocket event handlers
      webSocketService.off('incident', handleIncident);
      webSocketService.off('integration_change', handleIntegrationChange);
      webSocketService.off('task_update', handleTaskUpdate);
    };
  }, [toast, healthQuery, integrationQuery, tasksQuery]);

  const isLoading = completionQuery.isLoading || tasksQuery.isLoading || 
                   integrationQuery.isLoading || healthQuery.isLoading;

  const hasError = completionQuery.isError || tasksQuery.isError || 
                 integrationQuery.isError || healthQuery.isError;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-medium">Loading dashboard data...</h3>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
          <h3 className="text-lg font-medium mb-2">Error loading dashboard data</h3>
          <p>Please try refreshing the page or contact support if the problem persists.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Project Completion Overview</h2>
        <p className="text-muted-foreground">Track your project's progress and focus on high-priority incomplete features.</p>
      </div>
      
      {/* Project Completion Cards */}
      <ProjectCompletion data={completionQuery.data} />
      
      {/* Priority Tasks Table */}
      <PriorityTasks data={tasksQuery.data} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Integration Status */}
        <div className="lg:col-span-2">
          <IntegrationStatus data={integrationQuery.data} />
        </div>
        
        {/* System Health */}
        <div>
          <SystemHealth data={healthQuery.data} />
        </div>
      </div>
    </div>
  );
}
