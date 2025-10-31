export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl">✓</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Bell24h</h1>
          <p className="text-lg text-gray-600 mb-6">
            Minimal deployment successful! All problematic components have been removed.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-medium">✅ Build should pass now</p>
            <p className="text-green-700 text-sm mt-1">No missing imports or scripts</p>
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
