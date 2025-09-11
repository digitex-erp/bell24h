import { BarChart3, Mic, TrendingUp, Leaf, Wallet } from 'lucide-react';
import Link from 'next/link';

type SidebarItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
};

const sidebarItems: SidebarItem[] = [
  { icon: BarChart3, label: 'Dashboard', href: '/' },
  { icon: Mic, label: 'Voice RFQ', href: '/voice-rfq' },
  { icon: TrendingUp, label: 'Trading Platform', href: '/trading' },
  { icon: Leaf, label: 'ESG Analytics', href: '/esg' },
  { icon: Wallet, label: 'Wallet Management', href: '/wallet' }
];

const metrics = [
  { label: 'Total Suppliers', value: '534,281' },
  { label: 'RFQs Today', value: '12,500+' },
  { label: 'Active Categories', value: '50+' },
  { label: 'Revenue Target', value: '₹100 Cr' }
];

const categories = [
  { name: 'Agriculture', count: '15,247' },
  { name: 'Apparel & Fashion', count: '28,439' },
  { name: 'Automobile', count: '19,582' },
  { name: 'Electronics', count: '35,629' },
  { name: 'Chemicals', count: '12,845' },
  { name: 'Construction', count: '22,197' },
  { name: 'Food & Beverage', count: '31,256' },
  { name: 'Healthcare', count: '27,843' },
  { name: 'Machinery', count: '18,927' },
  { name: 'Textiles', count: '24,761' }
];

export default function Page() {
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-60 bg-[#1a1a1a] text-white p-4">
        <div className="text-xl font-semibold mb-8 px-2">Bell24H</div>
        <nav>
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center p-2 rounded hover:bg-[#2d2d2d] transition-colors"
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 p-4">
          <h1 className="text-2xl font-semibold text-[#1a1a1a]">Dashboard</h1>
        </header>

        <main className="p-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric) => (
              <div 
                key={metric.label}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <p className="text-gray-500 text-sm font-medium">{metric.label}</p>
                <p className="text-2xl font-semibold text-[#1a1a1a] mt-1">{metric.value}</p>
              </div>
            ))}
          </div>

          {/* Category Explorer */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-[#1a1a1a]">Category Explorer</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {categories.map((category, index) => (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-[#1a1a1a]">{category.name}</span>
                    <span className="text-gray-500">{category.count} suppliers</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
