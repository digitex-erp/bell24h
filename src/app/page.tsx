export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bell24h Procurement Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          AI-Powered Supplier Matching & RFQ Management
        </p>
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Platform Status
            </h2>
            <p className="text-green-600 font-medium">
              ✅ Successfully Deployed
            </p>
            <p className="text-gray-600 mt-2">
              Core infrastructure is live and ready for feature development.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Next Steps
            </h3>
            <ul className="text-left text-gray-600 space-y-1">
              <li>• Fix remaining component imports</li>
              <li>• Enable advanced features gradually</li>
              <li>• Test payment integrations</li>
              <li>• Deploy AI agent workflows</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
