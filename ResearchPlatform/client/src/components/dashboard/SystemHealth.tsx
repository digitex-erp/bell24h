import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink 
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Incident = {
  id: number;
  title: string;
  description: string;
  status: string;
  duration?: string;
  started: string;
  resolved?: string;
};

type SystemStatus = {
  name: string;
  status: string;
  uptime: number;
};

type SystemHealthProps = {
  data: {
    activeIncidents: number;
    incidents: Incident[];
    systems: SystemStatus[];
  };
};

const getIncidentStatusIcon = (status: string) => {
  if (status === "active") {
    return <AlertCircle className="h-5 w-5 text-red-500" />;
  }
  return <CheckCircle className="h-5 w-5 text-green-500" />;
};

const getSystemStatusDot = (status: string) => {
  switch (status) {
    case "online":
      return "bg-green-500";
    case "degraded":
      return "bg-yellow-500";
    case "issue":
      return "bg-red-500";
    default:
      return "bg-neutral-500";
  }
};

const formatIncidentDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const calculateTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ${diffMins % 60}m ago`;
  } else {
    return `${diffDays}d ${diffHours % 24}h ago`;
  }
};

export default function SystemHealth({ data }: SystemHealthProps) {
  const [expandedIncident, setExpandedIncident] = useState<number | null>(null);

  const toggleIncident = (id: number) => {
    setExpandedIncident(expandedIncident === id ? null : id);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-foreground">System Health</h2>
        <Button variant="ghost" className="text-primary text-sm flex items-center">
          View All
          <ExternalLink className="ml-1 h-3 w-3" />
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="border-b border-border pb-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-foreground">Recent Incidents</h3>
              <Badge 
                variant="outline" 
                className={`${data.activeIncidents > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}
              >
                {data.activeIncidents > 0 
                  ? `${data.activeIncidents} Active` 
                  : 'All Systems Operational'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Last 7 days of monitoring data</p>
          </div>
          
          <div className="space-y-4">
            {data.incidents.map((incident) => (
              <div 
                key={incident.id} 
                className={`border rounded-md ${
                  incident.status === 'active' 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-border'
                } p-3`}
              >
                <div 
                  className="flex items-start cursor-pointer"
                  onClick={() => toggleIncident(incident.id)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getIncidentStatusIcon(incident.status)}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-medium ${
                        incident.status === 'active' ? 'text-red-800' : 'text-foreground'
                      }`}>
                        {incident.title}
                      </h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-0 h-5 w-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleIncident(incident.id);
                        }}
                      >
                        {expandedIncident === incident.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className={`mt-1 text-xs ${
                      incident.status === 'active' ? 'text-red-700' : 'text-muted-foreground'
                    }`}>
                      <p>{incident.description}</p>
                      {expandedIncident === incident.id && (
                        <div className="mt-2 space-y-1 pt-2 border-t border-dashed border-muted">
                          <p><span className="font-semibold">Started:</span> {formatIncidentDate(incident.started)}</p>
                          {incident.resolved && (
                            <p><span className="font-semibold">Resolved:</span> {formatIncidentDate(incident.resolved)}</p>
                          )}
                          {incident.duration && (
                            <p><span className="font-semibold">Duration:</span> {incident.duration}</p>
                          )}
                        </div>
                      )}
                      <p className="mt-1 font-medium">
                        {incident.status === 'active'
                          ? `Started: ${calculateTimeAgo(incident.started)} • Still active`
                          : `Duration: ${incident.duration} • Resolved ${calculateTimeAgo(incident.resolved!)}`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 border-t border-border pt-4">
            <h3 className="text-sm font-medium text-foreground mb-3">System Status</h3>
            <div className="space-y-2">
              {data.systems.map((system, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${getSystemStatusDot(system.status)}`}></span>
                    <span className="text-foreground">{system.name}</span>
                  </div>
                  <span className="text-muted-foreground">{system.uptime}% uptime</span>
                </div>
              ))}
            </div>
          </div>
          
          <Accordion type="single" collapsible className="mt-6">
            <AccordionItem value="details">
              <AccordionTrigger className="text-xs text-muted-foreground">
                View Health Metrics
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">API Response Time</span>
                      <span className="text-foreground font-medium">187ms</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full">
                      <div className="h-1.5 bg-green-500 rounded-full" style={{ width: "15%" }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Database Load</span>
                      <span className="text-foreground font-medium">42%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full">
                      <div className="h-1.5 bg-yellow-500 rounded-full" style={{ width: "42%" }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Memory Usage</span>
                      <span className="text-foreground font-medium">68%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full">
                      <div className="h-1.5 bg-yellow-500 rounded-full" style={{ width: "68%" }}></div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
