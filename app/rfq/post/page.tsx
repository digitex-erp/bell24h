export default function PostRFQPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Your RFQ</h1>
        <p className="text-xl text-gray-600 mb-8">Create your request for quotation</p>
        <a 
          href="/rfq/create" 
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-block"
        >
          Go to RFQ Creation
        </a>
      </div>
    </div>
  );
}
