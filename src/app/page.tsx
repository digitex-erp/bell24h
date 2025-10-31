export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-2xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">✓</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900">
            Bell24h Procurement Platform
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            Your AI-powered procurement platform is successfully deployed and ready for development.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 mt-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">✅ Deployment Status</h3>
              <p className="text-blue-700 text-sm">Platform deployed successfully</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">🚀 Next Steps</h3>
              <p className="text-green-700 text-sm">Gradually add features</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">🔧 Architecture</h3>
              <p className="text-purple-700 text-sm">Next.js 14 + PostgreSQL</p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-2">🎯 Ready For</h3>
              <p className="text-orange-700 text-sm">Feature development</p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              Core infrastructure deployed. Advanced features can be added incrementally.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
