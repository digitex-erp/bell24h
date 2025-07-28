import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Filter, ChevronDown, ChevronUp, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface RFQ {
  id: string;
  title: string;
  status: 'draft' | 'sent' | 'in_progress' | 'completed' | 'expired' | 'cancelled';
  supplierCount: number;
  quoteCount: number;
  createdDate: string;
  expiryDate: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
  }[];
}

const RFQs: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Mock data - replace with real data from your API
  const rfqs: RFQ[] = [
    {
      id: 'RFQ-2023-001',
      title: 'Steel Pipes for Construction Project',
      status: 'in_progress',
      supplierCount: 5,
      quoteCount: 3,
      createdDate: '2023-06-15',
      expiryDate: '2023-07-15',
      items: [
        { id: '1', name: 'Steel Pipe 2"', quantity: 100, unit: 'meters' },
        { id: '2', name: 'Steel Pipe 4"', quantity: 50, unit: 'meters' },
      ],
    },
    {
      id: 'RFQ-2023-002',
      title: 'Aluminum Sheets for Manufacturing',
      status: 'sent',
      supplierCount: 3,
      quoteCount: 1,
      createdDate: '2023-06-20',
      expiryDate: '2023-07-05',
      items: [
        { id: '3', name: 'Aluminum Sheet 4x8', quantity: 200, unit: 'pieces' },
      ],
    },
    {
      id: 'RFQ-2023-003',
      title: 'Copper Wires - Urgent',
      status: 'draft',
      supplierCount: 0,
      quoteCount: 0,
      createdDate: '2023-06-25',
      expiryDate: '2023-07-25',
      items: [
        { id: '4', name: 'Copper Wire 14 AWG', quantity: 500, unit: 'meters' },
        { id: '5', name: 'Copper Wire 12 AWG', quantity: 300, unit: 'meters' },
        { id: '6', name: 'Copper Wire 10 AWG', quantity: 200, unit: 'meters' },
      ],
    },
    {
      id: 'RFQ-2023-004',
      title: 'PVC Pipes for Plumbing',
      status: 'completed',
      supplierCount: 7,
      quoteCount: 5,
      createdDate: '2023-05-10',
      expiryDate: '2023-06-10',
      items: [
        { id: '7', name: 'PVC Pipe 1/2"', quantity: 300, unit: 'meters' },
        { id: '8', name: 'PVC Pipe 3/4"', quantity: 200, unit: 'meters' },
        { id: '9', name: 'PVC Pipe 1"', quantity: 150, unit: 'meters' },
      ],
    },
    {
      id: 'RFQ-2023-005',
      title: 'Electrical Components',
      status: 'expired',
      supplierCount: 4,
      quoteCount: 2,
      createdDate: '2023-04-01',
      expiryDate: '2023-05-01',
      items: [
        { id: '10', name: 'Circuit Breaker 20A', quantity: 50, unit: 'pieces' },
        { id: '11', name: 'Switch Socket', quantity: 100, unit: 'pieces' },
      ],
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="border-gray-300 text-gray-700">Draft</Badge>;
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Sent</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'expired':
        return <Badge variant="outline" className="border-red-200 text-red-700">Expired</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="border-gray-400 text-gray-700">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-4 w-4 text-gray-500" />;
      case 'sent':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredRFQs = rfqs.filter(rfq => {
    const matchesSearch = 
      rfq.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfq.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && ['draft', 'sent', 'in_progress'].includes(rfq.status)) ||
      rfq.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('rfqs.title')}</h1>
          <p className="text-muted-foreground">
            {t('rfqs.subtitle', { count: filteredRFQs.length })}
          </p>
        </div>
        <Button asChild>
          <Link to="/rfqs/new">
            <Plus className="mr-2 h-4 w-4" />
            {t('rfqs.createRfq')}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('rfqs.searchPlaceholder')}
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:w-[200px]"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">{t('rfqs.filters.allStatuses')}</option>
                  <option value="active">{t('rfqs.filters.active')}</option>
                  <option value="draft">{t('rfqs.statuses.draft')}</option>
                  <option value="sent">{t('rfqs.statuses.sent')}</option>
                  <option value="in_progress">{t('rfqs.statuses.inProgress')}</option>
                  <option value="completed">{t('rfqs.statuses.completed')}</option>
                  <option value="expired">{t('rfqs.statuses.expired')}</option>
                  <option value="cancelled">{t('rfqs.statuses.cancelled')}</option>
                </select>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {t('common.filters')}
                  {showFilters ? (
                    <ChevronUp className="ml-2 h-4 w-4" />
                  ) : (
                    <ChevronDown className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('rfqs.filters.dateRange')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="date" placeholder="From" />
                    <Input type="date" placeholder="To" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('rfqs.filters.suppliers')}
                  </label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">{t('rfqs.filters.anySupplier')}</option>
                    <option value="1">Global Steel Inc.</option>
                    <option value="2">Alumex Solutions</option>
                    <option value="3">CopperTech</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('rfqs.filters.category')}
                  </label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">{t('rfqs.filters.anyCategory')}</option>
                    <option value="metals">Metals</option>
                    <option value="construction">Construction</option>
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button className="w-full">
                    {t('common.applyFilters')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredRFQs.length > 0 ? (
            <div className="space-y-4">
              {filteredRFQs.map((rfq) => (
                <Card key={rfq.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{rfq.title}</h3>
                            {getStatusBadge(rfq.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{rfq.id}</p>
                        </div>
                        <div className="mt-2 md:mt-0 flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">{t('rfqs.createdOn')}</p>
                            <p className="text-sm font-medium">{formatDate(rfq.createdDate)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">{t('rfqs.expiresOn')}</p>
                            <p className={`text-sm font-medium ${
                              rfq.status === 'expired' ? 'text-red-500' : ''
                            }`}>
                              {formatDate(rfq.expiryDate)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 rounded-full bg-blue-50">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{t('rfqs.items')}</p>
                            <p className="font-medium">{rfq.items.length} {t('rfqs.itemsCount')}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="p-2 rounded-full bg-green-50">
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
                              className="h-4 w-4 text-green-600"
                            >
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{t('rfqs.suppliers')}</p>
                            <p className="font-medium">{rfq.supplierCount} {t('rfqs.suppliersCount')}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="p-2 rounded-full bg-purple-50">
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
                              className="h-4 w-4 text-purple-600"
                            >
                              <path d="M21 11V5a2 2 0 0 0-1-1.73M3.38 3.38 2 5v14a2 2 0 0 0 2 2h16a2 2 0 0 0 1.73-1M2 9h18v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" />
                              <path d="M8 15h.01" />
                              <path d="M12 15h.01" />
                              <path d="M16 15h.01" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{t('rfqs.quotes')}</p>
                            <p className="font-medium">{rfq.quoteCount} {t('rfqs.quotesReceived')}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex -space-x-2">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="relative">
                                <div className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white" />
                                {i === 3 && (
                                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 text-white text-xs">
                                    +{rfq.supplierCount - 3}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {rfq.supplierCount} {t('rfqs.suppliersInvited')}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/rfqs/${rfq.id}`}>
                              {t('common.viewDetails')}
                            </Link>
                          </Button>
                          {rfq.status === 'draft' && (
                            <Button size="sm" variant="outline" asChild>
                              <Link to={`/rfqs/${rfq.id}/edit`}>
                                {t('common.edit')}
                              </Link>
                            </Button>
                          )}
                          {rfq.status === 'in_progress' && (
                            <Button size="sm" asChild>
                              <Link to={`/rfqs/${rfq.id}/quotes`}>
                                {t('rfqs.viewQuotes')}
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {t('rfqs.noResults.title')}
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                {t('rfqs.noResults.description')}
              </p>
              <div className="mt-6">
                <Button asChild>
                  <Link to="/rfqs/new">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('rfqs.createRfq')}
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RFQs;
