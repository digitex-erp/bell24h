// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Bell24h</h1>
              <span className="ml-2 px-2 py-1 bg-orange-500 text-white text-xs rounded-full">Dashboard</span>
            </div>
            <a
              href="/"
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-6">Bell24h Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Suppliers Card */}
            <div className="bg-white/20 rounded-lg p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">Total Suppliers</h3>
              <p className="text-3xl font-bold text-orange-400">5,000+</p>
              <p className="text-sm text-white/70 mt-2">Active verified suppliers</p>
            </div>

            {/* Transactions Card */}
            <div className="bg-white/20 rounded-lg p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">Total Transactions</h3>
              <p className="text-3xl font-bold text-green-400">₹100Cr+</p>
              <p className="text-sm text-white/70 mt-2">Processed this month</p>
            </div>

            {/* RFQs Card */}
            <div className="bg-white/20 rounded-lg p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">Active RFQs</h3>
              <p className="text-3xl font-bold text-blue-400">1,250</p>
              <p className="text-sm text-white/70 mt-2">Pending responses</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="bg-white/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                  Create New RFQ
                </button>
                <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Search Suppliers
                </button>
                <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  View Analytics
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3 text-white/80">
                <div className="flex justify-between">
                  <span>New supplier registered</span>
                  <span className="text-sm">2 mins ago</span>
                </div>
                <div className="flex justify-between">
                  <span>RFQ submitted</span>
                  <span className="text-sm">5 mins ago</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment processed</span>
                  <span className="text-sm">10 mins ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Razorpay Integration Status */}
          <div className="mt-8 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-6 border border-green-500/30">
            <h3 className="text-xl font-semibold text-white mb-2">Payment Integration Status</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white">Razorpay Live API Active</span>
              <span className="text-green-400 text-sm">(rzp_live_mk8XL8QrrZ4rjn)</span>
            </div>
            <p className="text-white/70 mt-2">Dual payment gateway ready for Indian & International transactions</p>
          </div>
        </div>
      </div>
    </div>
  )
}
