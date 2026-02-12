'use client';

import { useState, useEffect } from 'react';
import { insforge } from '@/lib/insforge';
import Link from 'next/link';

interface RFQ {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  budget_min: number;
  budget_max: number;
  type: 'text' | 'voice' | 'video';
  status: string;
  views: number;
  quote_count: number;
  created_at: string;
}

export default function RFQList() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'text' | 'voice' | 'video'>('all');

  useEffect(() => {
    fetchRFQs();
  }, [filter]);

  async function fetchRFQs() {
    setLoading(true);
    try {
      let query = insforge.database
        .from('rfqs')
        .select('*')
        .eq('status', 'open')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (filter !== 'all') {
        query = query.eq('type', filter);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setRfqs(data || []);
    } catch (error) {
      console.error('Error fetching RFQs:', error);
    } finally {
      setLoading(false);
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'voice':
        return '🎤';
      case 'video':
        return '🎥';
      default:
        return '📝';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'voice':
        return 'bg-green-100 text-green-800';
      case 'video':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading RFQs...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Open RFQs</h2>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('text')}
            className={`px-4 py-2 rounded-md ${
              filter === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            📝 Text
          </button>
          <button
            onClick={() => setFilter('voice')}
            className={`px-4 py-2 rounded-md ${
              filter === 'voice' ? 'bg-green-600 text-white' : 'bg-gray-200'
            }`}
          >
            🎤 Voice
          </button>
          <button
            onClick={() => setFilter('video')}
            className={`px-4 py-2 rounded-md ${
              filter === 'video' ? 'bg-purple-600 text-white' : 'bg-gray-200'
            }`}
          >
            🎥 Video
          </button>
        </div>
      </div>

      {rfqs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No RFQs found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rfqs.map((rfq) => (
            <Link
              key={rfq.id}
              href={`/dashboard/rfqs/${rfq.id}`}
              className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getTypeIcon(rfq.type)}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeBadgeColor(rfq.type)}`}>
                      {rfq.type.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">{rfq.category}</span>
                  </div>

                  <h3 className="text-xl font-semibold mb-2">{rfq.title}</h3>

                  {rfq.description && (
                    <p className="text-gray-600 mb-3 line-clamp-2">{rfq.description}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>📍 {rfq.location}</span>
                    {rfq.budget_min && rfq.budget_max && (
                      <span>
                        💰 ₹{rfq.budget_min.toLocaleString()} - ₹{rfq.budget_max.toLocaleString()}
                      </span>
                    )}
                    <span>👁️ {rfq.views || 0} views</span>
                    <span>💬 {rfq.quote_count || 0} quotes</span>
                  </div>
                </div>

                <div className="text-sm text-gray-400">
                  {new Date(rfq.created_at).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
