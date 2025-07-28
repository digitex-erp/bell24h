import React, { useEffect, useState } from 'react';

interface UserWallet {
  id: string;
  name: string;
  email?: string;
  razorpay_contact_id?: string;
  razorpay_fund_account_id?: string;
  wallet_status?: string;
  gst_number?: string;
}

const WalletAdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Replace with your actual admin API endpoint
    fetch('/api/admin/users-wallets')
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <h2>User Wallet & GST Dashboard</h2>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <table border={1} cellPadding={6} style={{ width: '100%', marginTop: 16 }}>
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Wallet Status</th>
            <th>Contact ID</th>
            <th>Fund Account ID</th>
            <th>GST Number</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email || '-'}</td>
              <td>{u.wallet_status || '-'}</td>
              <td>{u.razorpay_contact_id || '-'}</td>
              <td>{u.razorpay_fund_account_id || '-'}</td>
              <td>{u.gst_number || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WalletAdminDashboard;
