import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface CommunityStats {
  totalSuppliers: number;
  totalRfqs: number;
  activeUsers: number;
}

interface Supplier {
  id: string;
  name: string;
  rating: number;
  _count: {
    reviews: number;
  };
}

interface RFQ {
  id: string;
  title: string;
  viewCount: number;
  user: {
    name: string;
    company: string;
  };
}

interface Activity {
  id: string;
  action: string;
  description: string;
  createdAt: string;
  user: {
    name: string;
    avatar: string | null;
  };
}

export default function CommunityInsights() {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [topSuppliers, setTopSuppliers] = useState<Supplier[]>([]);
  const [trendingRfqs, setTrendingRfqs] = useState<RFQ[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch('/api/community/insights', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch community insights');
        }

        const data = await response.json();
        setTopSuppliers(data.topSuppliers || []);
        setTrendingRfqs(data.trendingRfqs || []);
        setRecentActivities(data.recentActivities || []);
        setStats(data.stats || { totalSuppliers: 0, totalRfqs: 0, activeUsers: 0 });
      } catch (error) {
        console.error('Error fetching community insights:', error);
        toast({
          title: 'Error',
          description: 'Failed to load community insights',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [toast]);

  if (isLoading) {
    return <CommunityInsightsSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Community Insights</h1>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard 
          title="Total Suppliers" 
          value={stats?.totalSuppliers || 0} 
          description="Registered suppliers in our community"
        />
        <StatsCard 
          title="Active RFQs" 
          value={stats?.totalRfqs || 0} 
          description="Open requests for quotes"
        />
        <StatsCard 
          title="Active Users" 
          value={stats?.activeUsers || 0} 
          description="Active in the last 30 days"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Suppliers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Rated Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSuppliers.map((supplier) => (
                <div key={supplier.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={`/avatars/${supplier.id}.jpg`} alt={supplier.name} />
                      <AvatarFallback>{supplier.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{supplier.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {supplier._count?.reviews || 0} reviews
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <StarIcon className="h-4 w-4 text-yellow-500" />
                    {supplier.rating?.toFixed(1) || 'N/A'}
                  </Badge>
                </div>
              ))}
              {topSuppliers.length === 0 && (
                <p className="text-muted-foreground text-sm">No supplier data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trending RFQs */}
        <Card>
          <CardHeader>
            <CardTitle>Trending RFQs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trendingRfqs.map((rfq) => (
                <div key={rfq.id} className="space-y-1">
                  <p className="font-medium">{rfq.title}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>by {rfq.user?.name || 'Unknown'} • {rfq.user?.company || 'Unknown'}</span>
                    <span>{rfq.viewCount} views</span>
                  </div>
                </div>
              ))}
              {trendingRfqs.length === 0 && (
                <p className="text-muted-foreground text-sm">No trending RFQs available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <Avatar>
                  <AvatarImage src={activity.user?.avatar || ''} alt={activity.user?.name} />
                  <AvatarFallback>{activity.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{activity.user?.name || 'User'}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {recentActivities.length === 0 && (
              <p className="text-muted-foreground text-sm">No recent activities</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function CommunityInsightsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-10 w-64" />
      
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>

      <Skeleton className="h-64" />
    </div>
  );
}
