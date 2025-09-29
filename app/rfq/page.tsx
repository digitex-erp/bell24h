'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface RFQ {
  id: string;
  title: string;
  category: string;
  description: string;
  quantity: string;
  unit: string;
  minBudget: string;
  maxBudget: string;
  timeline: string;
  status: 'active' | 'quoted' | 'completed' | 'cancelled';
  urgency: 'low' | 'normal' | 'high' | 'urgent';
  createdBy: string;
  createdAt: string;
  views: number;
  quotes: number;
  suppliers: number;
  tags: string[];
  location: string;
  priority: number;
  estimatedValue: number;
}

export default function RFQPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  useEffect(() => {
    fetchRFQs();
  }, [filters, pagination.page]);

  const fetchRFQs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await fetch(`/api/rfq/list?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRfqs(data.rfqs || []);
        setPagination(prev => ({ ...prev, ...data.pagination }));
      }
    } catch (error) {
      console.error('Error fetching RFQs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'quoted': return 'badge-info';
      case 'completed': return 'badge-warning';
      case 'cancelled': return 'badge-error';
      default: return 'badge-info';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading RFQs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-content">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">RFQ Management</h1>
          <p className="page-subtitle">
            Manage your Request for Quotations and track supplier responses
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="card mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search RFQs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="form-input pl-10"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Category Filter */}
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="form-input"
              >
                <option value="all">All Categories</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="textiles">Textiles</option>
                <option value="electronics">Electronics</option>
                <option value="construction">Construction</option>
                <option value="chemicals">Chemicals</option>
                <option value="machinery">Machinery</option>
                <option value="packaging">Packaging</option>
                <option value="automotive">Automotive</option>
              </select>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="form-input"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="quoted">Quoted</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Sort */}
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="form-input"
              >
                <option value="createdAt">Sort by Date</option>
                <option value="priority">Sort by Priority</option>
                <option value="estimatedValue">Sort by Value</option>
                <option value="quotes">Sort by Quotes</option>
              </select>
            </div>

            <Link
              href="/rfq/create"
              className="btn-primary flex items-center gap-2"
            >
              <span>+</span>
              <span>Create RFQ</span>
            </Link>
          </div>
        </div>

        {/* RFQ List */}
        <div className="space-y-4">
          {rfqs.length > 0 ? (
            rfqs.map((rfq) => (
              <div key={rfq.id} className="card card-hover">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-neutral-900">{rfq.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rfq.status)}`}>
                          {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(rfq.urgency)}`}>
                          {rfq.urgency.charAt(0).toUpperCase() + rfq.urgency.slice(1)}
                        </span>
                      </div>
                    </div>

                    <p className="text-neutral-600 mb-3">{rfq.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-neutral-500">Quantity:</span>
                        <span className="ml-1 font-semibold">{rfq.quantity} {rfq.unit}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500">Budget:</span>
                        <span className="ml-1 font-semibold">
                          {formatCurrency(parseInt(rfq.minBudget))} - {formatCurrency(parseInt(rfq.maxBudget))}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500">Timeline:</span>
                        <span className="ml-1 font-semibold">{rfq.timeline}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500">Location:</span>
                        <span className="ml-1 font-semibold">{rfq.location}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {rfq.tags.map((tag, index) => (
                        <span key={index} className="bg-neutral-100 text-neutral-700 text-xs px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="lg:w-48 flex flex-col justify-between">
                    <div className="text-sm text-neutral-500 mb-2">
                      <div>Created: {formatDate(rfq.createdAt)}</div>
                      <div>Views: {rfq.views}</div>
                      <div>Quotes: {rfq.quotes}</div>
                      <div>Suppliers: {rfq.suppliers}</div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/rfq/${rfq.id}`}
                        className="btn-outline text-sm px-4 py-2 flex-1 text-center"
                      >
                        View Details
                      </Link>
                      <Link
                        href={`/rfq/${rfq.id}/quotes`}
                        className="btn-primary text-sm px-4 py-2 flex-1 text-center"
                      >
                        View Quotes
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">No RFQs Found</h3>
              <p className="text-neutral-600 mb-6">Create your first RFQ to get started</p>
              <Link href="/rfq/create" className="btn-primary">
                Create RFQ
              </Link>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={!pagination.hasPrevPage}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-4 py-2 text-sm text-neutral-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={!pagination.hasNextPage}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}