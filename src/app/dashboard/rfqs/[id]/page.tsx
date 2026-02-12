'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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
  quantity: number;
  unit: string;
  type: 'text' | 'voice' | 'video';
  status: string;
  audio_url: string | null;
  video_url: string | null;
  views: number;
  quote_count: number;
  created_at: string;
  deadline: string | null;
}

export default function RFQDetailPage() {
  const params = useParams();
  const [rfq, setRfq] = useState<RFQ | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRFQ();
  }, [params.id]);

  async function fetchRFQ() {
    try {
      const { data, error } = await insforge.database
        .from('rfqs')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        throw error;
      }

      setRfq(data);
    } catch (error) {
      console.error('Error fetching RFQ:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!rfq) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600 mb-4">RFQ not found</p>
        <Link href="/dashboard/rfqs" className="text-blue-600 hover:underline">
          ← Back to RFQs
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Back Button */}
      <Link href="/dashboard/rfqs" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to RFQs
      </Link>

      {/* RFQ Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">
            {rfq.type === 'voice' ? '🎤' : rfq.type === 'video' ? '🎥' : '📝'}
          </span>
          <span className={`px-3 py-1 rounded text-sm font-medium ${
            rfq.type === 'voice' ? 'bg-green-100 text-green-800' :
            rfq.type === 'video' ? 'bg-purple-100 text-purple-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {rfq.type.toUpperCase()} RFQ
          </span>
          <span className={`px-3 py-1 rounded text-sm ${
            rfq.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {rfq.status.toUpperCase()}
          </span>
        </div>

        <h1 className="text-3xl font-bold mb-4">{rfq.title}</h1>

        {/* Text RFQ Description */}
        {rfq.type === 'text' && rfq.description && (
          <p className="text-gray-700 text-lg mb-6 whitespace-pre-wrap">{rfq.description}</p>
        )}

        {/* Voice RFQ Audio Player */}
        {rfq.type === 'voice' && rfq.audio_url && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Audio Recording:</h3>
            <audio controls className="w-full">
              <source src={rfq.audio_url} />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Video RFQ Video Player */}
        {rfq.type === 'video' && rfq.video_url && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Video:</h3>
            <video controls className="w-full rounded-lg">
              <source src={rfq.video_url} />
              Your browser does not support the video element.
            </video>
          </div>
        )}

        {/* RFQ Details Grid */}
        <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
            <p className="text-lg">{rfq.category}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
            <p className="text-lg">📍 {rfq.location}</p>
          </div>

          {rfq.quantity && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Quantity</h3>
              <p className="text-lg">
                {rfq.quantity} {rfq.unit || 'units'}
              </p>
            </div>
          )}

          {rfq.budget_min && rfq.budget_max && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Budget Range</h3>
              <p className="text-lg">
                ₹{rfq.budget_min.toLocaleString()} - ₹{rfq.budget_max.toLocaleString()}
              </p>
            </div>
          )}

          {rfq.deadline && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Deadline</h3>
              <p className="text-lg">{new Date(rfq.deadline).toLocaleDateString()}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Posted</h3>
            <p className="text-lg">{new Date(rfq.created_at).toLocaleDateString()}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Views</h3>
            <p className="text-lg">👁️ {rfq.views || 0}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Quotes Received</h3>
            <p className="text-lg">💬 {rfq.quote_count || 0}</p>
          </div>
        </div>
      </div>

      {/* Quote Section (Placeholder) */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Quotes</h2>
        <p className="text-gray-500">
          Quote submission feature coming soon. Suppliers will be able to submit quotes here.
        </p>
      </div>
    </div>
  );
}
