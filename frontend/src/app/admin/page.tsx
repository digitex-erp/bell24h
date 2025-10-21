import Link from 'next/link'

export default function AdminIndex() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Admin Home</h2>
      <ul className="space-y-2">
        <li><Link href="/admin/login" className="text-blue-600">Admin Login</Link></li>
        <li><Link href="/admin/dashboard" className="text-blue-600">Dashboard</Link></li>
        <li><Link href="/admin/crm" className="text-blue-600">CRM</Link></li>
        <li><Link href="/admin/monitoring" className="text-blue-600">Monitoring</Link></li>
      </ul>
    </div>
  )
}
