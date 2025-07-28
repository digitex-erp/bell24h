import React, { useEffect, useState } from 'react';

interface SupplierTierCardProps {
  userId: number | string;
}

interface SupplierTierResult {
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  completedRFQs: number;
  riskScore?: number;
  isVerified?: boolean;
}

const tierColors: Record<string, string> = {
  Bronze: '#cd7f32',
  Silver: '#c0c0c0',
  Gold: '#ffd700',
  Platinum: '#e5e4e2',
};

const SupplierTierCard: React.FC<SupplierTierCardProps> = ({ userId }) => {
  const [data, setData] = useState<SupplierTierResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/analytics/suppliers/${userId}/tier`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch supplier tier');
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message || 'Unknown error'))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="supplier-tier-card" style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, background: '#fff', maxWidth: 340 }}>
      <h3 style={{ marginBottom: 10 }}>Supplier Tier</h3>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {data && !loading && !error && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: tierColors[data.tier], marginBottom: 8 }}>{data.tier}</div>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontWeight: 500 }}>Completed RFQs:</span> {data.completedRFQs}
          </div>
          {typeof data.riskScore === 'number' && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 500 }}>Risk Score:</span> {data.riskScore}
            </div>
          )}
          {typeof data.isVerified !== 'undefined' && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 500 }}>Verified:</span> {data.isVerified ? '✅' : '❌'}
            </div>
          )}
        </div>
      )}
      {!loading && !error && !data && <div>No data available.</div>}
    </div>
  );
};

export default SupplierTierCard;
