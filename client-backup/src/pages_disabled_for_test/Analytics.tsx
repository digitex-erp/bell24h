import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Download, Filter, BarChart2, PieChart, LineChart, ArrowUpRight } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { Calendar as CalendarIcon } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Mock data - replace with real data from your API
const spendByCategory = [
  { name: 'Metals', value: 45000, color: '#3b82f6' },
  { name: 'Construction', value: 28000, color: '#10b981' },
  { name: 'Electrical', value: 19000, color: '#f59e0b' },
  { name: 'Plumbing', value: 15000, color: '#8b5cf6' },
  { name: 'Other', value: 9000, color: '#6b7280' },
];

const monthlySpendData = [
  { name: 'Jan', value: 25000 },
  { name: 'Feb', value: 30000 },
  { name: 'Mar', value: 35000 },
  { name: 'Apr', value: 28000 },
  { name: 'May', value: 40000 },
  { name: 'Jun', value: 45000 },
  { name: 'Jul', value: 50000 },
];

const topSuppliers = [
  { id: 1, name: 'Global Steel Inc.', spend: 32000, change: 12.5, orders: 24 },
  { id: 2, name: 'Alumex Solutions', spend: 28000, change: 8.2, orders: 18 },
  { id: 3, name: 'CopperTech', spend: 21500, change: -3.7, orders: 15 },
  { id: 4, name: 'PVC Masters', spend: 18000, change: 5.3, orders: 12 },
  { id: 5, name: 'ElectroPlus', spend: 14500, change: 2.1, orders: 10 },
];

const Analytics: React.FC = () => {
  const { t } = useTranslation();
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [activeTab, setActiveTab] = useState('overview');

  const totalSpend = spendByCategory.reduce((sum, item) => sum + item.value, 0);
  const ytdSpend = monthlySpendData.reduce((sum, item) => sum + item.value, 0);
  const monthlyAvg = ytdSpend / monthlySpendData.length;
  const yoyGrowth = 12.8; // This would come from your API

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('analytics.title')}</h1>
          <p className="text-muted-foreground">
            {t('analytics.subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className={cn(
                  'w-[260px] justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, 'MMM d, yyyy')} - {format(date.to, 'MMM d, yyyy')}
                    </>
                  ) : (
                    format(date.from, 'MMM d, yyyy')
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t('common.export')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 md:w-[400px] mb-6">
          <TabsTrigger value="overview">
            <BarChart2 className="mr-2 h-4 w-4" />
            {t('analytics.tabs.overview')}
          </TabsTrigger>
          <TabsTrigger value="spend">
            <PieChart className="mr-2 h-4 w-4" />
            {t('analytics.tabs.spend')}
          </TabsTrigger>
          <TabsTrigger value="suppliers">
            <LineChart className="mr-2 h-4 w-4" />
            {t('analytics.tabs.suppliers')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('analytics.metrics.totalSpend')}
                </CardTitle>
                <div className="h-4 w-4 text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalSpend.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {yoyGrowth > 0 ? '+' : ''}{yoyGrowth}% {t('analytics.vsLastYear')}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('analytics.metrics.ytdSpend')}
                </CardTitle>
                <div className="h-4 w-4 text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${ytdSpend.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {t('analytics.metrics.ytdDescription')}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('analytics.metrics.monthlyAvg')}
                </CardTitle>
                <div className="h-4 w-4 text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${Math.round(monthlyAvg).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {t('analytics.metrics.monthlyAvgDescription')}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('analytics.metrics.activeSuppliers')}
                </CardTitle>
                <div className="h-4 w-4 text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  +5 {t('analytics.metrics.vsLastQuarter')}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>{t('analytics.charts.spendTrends')}</CardTitle>
                <CardDescription>
                  {t('analytics.charts.monthlySpendDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    {t('analytics.charts.chartPlaceholder')}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>{t('analytics.charts.spendByCategory')}</CardTitle>
                <CardDescription>
                  {t('analytics.charts.spendBreakdown')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    {t('analytics.charts.chartPlaceholder')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="spend" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {spendByCategory.map((category) => (
              <Card key={category.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {category.name}
                  </CardTitle>
                  <div 
                    className="h-4 w-4 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${category.value.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {((category.value / totalSpend) * 100).toFixed(1)}% of total spend
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.charts.spendTrends')}</CardTitle>
              <CardDescription>
                {t('analytics.charts.monthlySpendByCategory')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-md">
                <p className="text-sm text-muted-foreground">
                  {t('analytics.charts.chartPlaceholder')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.topSuppliers')}</CardTitle>
              <CardDescription>
                {t('analytics.topSuppliersDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSuppliers.map((supplier) => (
                  <div key={supplier.id} className="flex items-center">
                    <div className="flex-1">
                      <p className="font-medium">{supplier.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {supplier.orders} {t('analytics.orders')} • ${supplier.spend.toLocaleString()}
                      </p>
                    </div>
                    <div className={`flex items-center ${
                      supplier.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {supplier.change >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 mr-1 transform rotate-180" />
                      )}
                      {Math.abs(supplier.change)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.supplierPerformance')}</CardTitle>
              <CardDescription>
                {t('analytics.supplierPerformanceDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
                <p className="text-sm text-muted-foreground">
                  {t('analytics.charts.chartPlaceholder')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
