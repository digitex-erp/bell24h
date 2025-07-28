import React, { useState } from 'react';

interface WalletBankFormProps {
  userId: string;
  onWalletCreated?: (data: { contactId: string; fundAccountId: string }) => void;
}

const WalletBankForm: React.FC<WalletBankFormProps> = ({ userId, onWalletCreated }) => {
  const [form, setForm] = useState({
    name: '',
    ifsc: '',
    account_number: '',
    email: '',
    contact: '',
    gst_number: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/wallet/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, userId }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        onWalletCreated?.(data);
      } else {
        setError(data.error?.description || data.error || 'Failed to create wallet');
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto' }}>
      <h3>Create Your Wallet</h3>
      <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
      <input name="ifsc" placeholder="IFSC Code" value={form.ifsc} onChange={handleChange} required />
      <input name="account_number" placeholder="Bank Account Number" value={form.account_number} onChange={handleChange} required />
      <input name="email" placeholder="Email (optional)" value={form.email} onChange={handleChange} />
      <input name="contact" placeholder="Phone (optional)" value={form.contact} onChange={handleChange} />
      <input name="gst_number" placeholder="GST Number (optional)" value={form.gst_number} onChange={handleChange} maxLength={32} />
      <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Wallet'}</button>
      {success && <div style={{ color: 'green', marginTop: 8 }}>Wallet created successfully!</div>}
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </form>
  );
};

export default WalletBankForm;
