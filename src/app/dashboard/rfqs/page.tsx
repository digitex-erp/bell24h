import RFQList from '@/components/rfq/RFQList';
import Link from 'next/link';

export default function RFQsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Browse RFQs</h1>
        <Link
          href="/dashboard/rfqs/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
        >
          + Create RFQ
        </Link>
      </div>

      <RFQList />
    </div>
  );
}
