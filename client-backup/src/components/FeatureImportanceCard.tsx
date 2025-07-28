import React, { useEffect, useState } from 'react';

interface FeatureImportance {
  feature: string;
  importance: number;
}

interface FeatureImportanceCardProps {
  model: string;
  predictionId: string | number;
}

const FeatureImportanceCard: React.FC<FeatureImportanceCardProps> = ({ model, predictionId }) => {
  const [explanation, setExplanation] = useState<FeatureImportance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExplanation = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/analytics/explainability/${model}/${predictionId}`);
        if (!res.ok) throw new Error('Failed to fetch explanation');
        const data = await res.json();
        setExplanation(data.explanation || []);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    if (model && predictionId) fetchExplanation();
  }, [model, predictionId]);

  return (
    <div className="feature-importance-card" style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, background: '#fff', maxWidth: 400 }}>
      <h3 style={{ marginBottom: 12 }}>Feature Importance (Explainability)</h3>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && explanation.length === 0 && <div>No explanation available.</div>}
      {!loading && !error && explanation.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {explanation.sort((a, b) => b.importance - a.importance).map((item) => (
            <li key={item.feature} style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 500 }}>{item.feature}</span>
              <div style={{ background: '#e3e8f0', borderRadius: 4, height: 16, width: '100%', marginTop: 4 }}>
                <div style={{ background: '#4f8cff', height: '100%', borderRadius: 4, width: `${Math.round(item.importance * 100)}%`, transition: 'width 0.3s' }} />
              </div>
              <span style={{ fontSize: 12, color: '#666' }}>Importance: {item.importance}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FeatureImportanceCard;
