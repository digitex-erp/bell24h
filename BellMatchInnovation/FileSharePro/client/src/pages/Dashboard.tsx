import { useEffect, useState } from "react";
import { User } from "@shared/schema";
import { DashboardStats } from "@/types";
import { useQuery } from "@tanstack/react-query";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import StatsCards from "@/components/dashboard/StatsCards";
import AIInsights from "@/components/dashboard/AIInsights";
import ActiveRFQs from "@/components/dashboard/ActiveRFQs";

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    activeRfqs: 0,
    quotesReceived: 0,
    pendingResponses: 0,
    aiMatchScore: "0%",
  });

  // Fetch RFQs for the user
  const { data: userRfqs, refetch: refetchRfqs } = useQuery({
    queryKey: ["/api/rfqs"],
  });

  // Calculate stats from RFQs data
  useEffect(() => {
    if (userRfqs) {
      // Count active RFQs
      const activeRfqs = userRfqs.filter((rfq: any) => rfq.status === "active").length;
      
      // For demo purposes, generate some placeholder stats
      // In a real implementation, these would be fetched from the API
      const quotesReceived = Math.floor(Math.random() * 30) + 5;
      const pendingResponses = Math.floor(Math.random() * 10);
      const aiMatchScore = `${Math.floor(Math.random() * 15) + 85}%`;
      
      setStats({
        activeRfqs,
        quotesReceived,
        pendingResponses,
        aiMatchScore,
      });
    }
  }, [userRfqs]);

  const handleRFQCreated = () => {
    // Refresh RFQs data
    refetchRfqs();
  };

  return (
    <div className="p-6">
      <WelcomeSection user={user} onRFQCreated={handleRFQCreated} />
      <StatsCards stats={stats} />
      <AIInsights user={user} />
      <ActiveRFQs />
    </div>
  );
}
