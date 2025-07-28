import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => setUsers(data.users || []));
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h1>Admin Dashboard</h1>
      <h2>User Management</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name} - {user.email} - {user.role}</li>
        ))}
      </ul>
      {/* Add more admin features here: RFQ monitoring, supplier onboarding, analytics, etc. */}
    </div>
  );
}
