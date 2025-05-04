
import React, { useState, useEffect } from 'react';
import { Bell24hRealTimeClient } from '../js/bell24h-websocket';
import SupplierCard from './SupplierCard';

export default function SupplierMatchingUI({ rfqId }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const client = new Bell24hRealTimeClient();
    
    const fetchSuppliers = async () => {
      try {
        const response = await fetch(`/api/rfq/${rfqId}/matches`);
        const data = await response.json();
        setSuppliers(data.suppliers);
        setLoading(false);
      } catch (err) {
        setError('Failed to load supplier matches');
        setLoading(false);
      }
    };

    // Subscribe to real-time updates
    client.subscribe(`rfq_matches_${rfqId}`, (data) => {
      setSuppliers(prevSuppliers => {
        const updated = [...prevSuppliers];
        const index = updated.findIndex(s => s.id === data.supplier.id);
        if (index >= 0) {
          updated[index] = data.supplier;
        } else {
          updated.push(data.supplier);
        }
        return updated;
      });
    });

    fetchSuppliers();

    return () => client.disconnect();
  }, [rfqId]);

  if (loading) return <div className="animate-pulse">Loading matches...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Matched Suppliers</h2>
      {suppliers.length === 0 ? (
        <p>No matches found yet. Our AI is searching for the best suppliers.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map(supplier => (
            <SupplierCard 
              key={supplier.id} 
              supplier={supplier}
              matchScore={supplier.similarity_score}
              explanation={supplier.match_explanation}
            />
          ))}
        </div>
      )}
    </div>
  );
}
