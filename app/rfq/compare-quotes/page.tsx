'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Quote {
  id: string;
  price: number;
  quantity: number;
  deliveryTime: string;
  terms: string;
  validity: number;
  notes: string;
  status: string;
  createdAt: string;
  supplier: {
    id: string;
    name: string;
    company: string;
    rating: number;
    verified: boolean;
    location: string;
  };
  rfq: {
    id: string;
    title: string;
    category: string;
  };
}

function CompareQuotesContent() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'delivery'>('price');
  const searchParams = useSearchParams();
  const rfqId = searchParams.get('rfqId');

  useEffect(() => {
    if (rfqId) {
      fetchQuotes();
    }
  }, [rfqId]);

  const fetchQuotes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/rfq/quotes?rfqId=${rfqId}`);
      if (response.ok) {
        const data = await response.json();
        setQuotes(data.quotes || []);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuoteSelection = (quoteId: string) => {
    setSelectedQuotes(prev => 
      prev.includes(quoteId) 
        ? prev.filter(id => id !== quoteId)
        : [...prev, quoteId]
    );
  };

  const handleQuoteStatus = async (quoteId: string, status: string) => {
    try {
      const response = await fetch('/api/rfq/quotes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          quoteId, 
          status,
          selectedReason: status === 'SELECTED' ? 'Best price and terms' : null
        })
      });

      if (response.ok) {
        fetchQuotes(); // Refresh quotes
      }
    } catch (error) {
      console.error('Error updating quote status:', error);
    }
  };

  const sortedQuotes = [...quotes].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'rating':
        return b.supplier.rating - a.supplier.rating;
      case 'delivery':
        return new Date(a.deliveryTime).getTime() - new Date(b.deliveryTime).getTime();
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quotes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Compare Quotes</h1>
              <p className="text-gray-600 mt-1">Review and compare supplier quotes</p>
            </div>
            <div className="flex gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="price">Sort by Price</option>
                <option value="rating">Sort by Rating</option>
                <option value="delivery">Sort by Delivery</option>
              </select>
              <Link
                href="/rfq"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Back to RFQs
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {quotes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes received yet</h3>
            <p className="text-gray-600 mb-6">
              Quotes will appear here once suppliers respond to your RFQ
            </p>
            <Link
              href="/rfq/create"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create New RFQ
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-gray-900">{quotes.length}</div>
                <div className="text-sm text-gray-600">Total Quotes</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-gray-900">
                  ₹{Math.min(...quotes.map(q => q.price)).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Lowest Price</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-gray-900">
                  ₹{Math.max(...quotes.map(q => q.price)).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Highest Price</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-gray-900">
                  {quotes.filter(q => q.status === 'SELECTED').length}
                </div>
                <div className="text-sm text-gray-600">Selected</div>
              </div>
            </div>

            {/* Quotes Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all ${
                    quote.status === 'SELECTED' 
                      ? 'border-green-500 bg-green-50' 
                      : selectedQuotes.includes(quote.id)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Supplier Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{quote.supplier.company}</h3>
                      <p className="text-gray-600">{quote.supplier.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < quote.supplier.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">{quote.supplier.rating}/5</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {quote.supplier.verified && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          ✓ Verified
                        </span>
                      )}
                      {quote.status === 'SELECTED' && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                          ✓ Selected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quote Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="text-xl font-bold text-gray-900">₹{quote.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Quantity:</span>
                      <span className="text-sm text-gray-900">{quote.quantity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Delivery:</span>
                      <span className="text-sm text-gray-900">{quote.deliveryTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Validity:</span>
                      <span className="text-sm text-gray-900">{quote.validity} days</span>
                    </div>
                  </div>

                  {/* Terms & Notes */}
                  {quote.terms && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Terms:</p>
                      <p className="text-sm text-gray-900">{quote.terms}</p>
                    </div>
                  )}

                  {quote.notes && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Notes:</p>
                      <p className="text-sm text-gray-900">{quote.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {quote.status !== 'SELECTED' && (
                      <button
                        onClick={() => handleQuoteStatus(quote.id, 'SELECTED')}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Select Quote
                      </button>
                    )}
                    {quote.status === 'SELECTED' && (
                      <button
                        onClick={() => handleQuoteStatus(quote.id, 'PENDING')}
                        className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                      >
                        Deselect
                      </button>
                    )}
                    <button
                      onClick={() => handleQuoteSelection(quote.id)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        selectedQuotes.includes(quote.id)
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {selectedQuotes.includes(quote.id) ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Quotes Summary */}
            {selectedQuotes.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Selected Quotes Summary ({selectedQuotes.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Value:</p>
                    <p className="text-xl font-bold text-gray-900">
                      ₹{quotes
                        .filter(q => selectedQuotes.includes(q.id))
                        .reduce((sum, q) => sum + q.price, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Average Price:</p>
                    <p className="text-xl font-bold text-gray-900">
                      ₹{Math.round(
                        quotes
                          .filter(q => selectedQuotes.includes(q.id))
                          .reduce((sum, q) => sum + q.price, 0) / selectedQuotes.length
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Suppliers:</p>
                    <p className="text-xl font-bold text-gray-900">{selectedQuotes.length}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

<<<<<<< HEAD
function CompareQuotesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading quotes...</p>
      </div>
    </div>
  );
}

export default function CompareQuotesPage() {
  return (
    <Suspense fallback={<CompareQuotesLoading />}>
=======
export default function CompareQuotesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quotes...</p>
        </div>
      </div>
    }>
>>>>>>> 37693a2c47be200ae04845426f75361c3cfaa255
      <CompareQuotesContent />
    </Suspense>
  );
}
