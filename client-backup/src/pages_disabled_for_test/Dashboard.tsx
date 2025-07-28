import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  // Mock data - replace with real data from your API
  const stats = [
    { title: t('dashboard.stats.activeRfqs'), value: '12', change: '+2.5%', trend: 'up' },
    { title: t('dashboard.stats.openQuotes'), value: '8', change: '+1.2%', trend: 'up' },
    { title: t('dashboard.stats.ordersThisMonth'), value: '24', change: '+5.3%', trend: 'up' },
    { title: t('dashboard.stats.totalSpend'), value: '$12,450', change: '-0.8%', trend: 'down' },
  ];

  const recentActivities = [
    { id: 1, type: 'rfq', title: 'RFQ #1234 - Steel Pipes', time: '2 hours ago', status: 'pending' },
    { id: 2, type: 'quote', title: 'Quote #5678 - Aluminum Sheets', time: '5 hours ago', status: 'received' },
    { id: 3, type: 'order', title: 'Order #9012 - Copper Wires', time: '1 day ago', status: 'shipped' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.title')}</h1>
        <div className="flex space-x-2">
          <Button asChild>
            <Link to="/rfqs/new">
              <Plus className="mr-2 h-4 w-4" />
              {t('dashboard.actions.newRfq')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardHeader>
            <CardContent>
              <div className={`text-xs ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change} {stat.trend === 'up' ? '↑' : '↓'} from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activities */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t('dashboard.recentActivities')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                  <div className="ml-auto">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      activity.status === 'received' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t('dashboard.quickActions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/rfqs/new">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('dashboard.actions.newRfq')}
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/suppliers">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  {t('dashboard.actions.findSuppliers')}
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/marketplace">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="m7.5 4.27 9 5.15" />
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                    <path d="m3.3 7 8.7 5 8.7-5" />
                    <path d="M12 22V12" />
                  </svg>
                  {t('dashboard.actions.browseMarketplace')}
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/analytics">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h3.3a2 2 0 0 0 1.4-.6l1.1-1.5a2 2 0 0 1 1.6-.8h3.2a2 2 0 0 1 1.6.8l1.1 1.5a2 2 0 0 0 1.4.6h3.3Z" />
                    <path d="M12 17v-6" />
                    <path d="M8 17v-3" />
                    <path d="M16 17v-5" />
                  </svg>
                  {t('dashboard.actions.viewAnalytics')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
