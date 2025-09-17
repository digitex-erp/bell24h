export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">B</div>
                <div>
                  <div className="font-bold text-xl">Bell24h</div>
                  <div className="text-xs text-gray-600">Verified B2B Platform</div>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <a href="#" className="text-gray-700 hover:text-indigo-600">Suppliers</a>
                <a href="#" className="text-gray-700 hover:text-indigo-600">RFQ</a>
                <a href="#" className="text-gray-700 hover:text-indigo-600">Wallet</a>
                <a href="#" className="text-gray-700 hover:text-indigo-600">Insights</a>
                <a href="#" className="text-gray-700 hover:text-indigo-600">About</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href="/auth/login" className="text-gray-700 hover:text-indigo-600">Login</a>
              <button className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white rounded-lg font-semibold">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-7xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
            Post RFQ. Get 3 Verified Quotes in 24 Hours
          </span>
        </h1>
        <p className="text-2xl text-gray-700 mb-8 max-w-4xl mx-auto">
          Bell24h uses 200 live data signals—GST, credit, logistics, ESG—to match you with 3 pre-qualified Indian suppliers and locks payment till goods arrive.
        </p>

        {/* Trust Layer */}
        <div className="flex justify-center gap-6 mb-12 flex-wrap">
          <span className="px-5 py-2 bg-green-100 text-green-800 rounded-full text-lg font-medium flex items-center gap-2">
            ✅ Escrow-Secured Payments
          </span>
          <span className="px-5 py-2 bg-blue-100 text-blue-800 rounded-full text-lg font-medium flex items-center gap-2">
            ✅ GST & PAN Verified Suppliers
          </span>
          <span className="px-5 py-2 bg-purple-100 text-purple-800 rounded-full text-lg font-medium flex items-center gap-2">
            ✅ AI Trust-Score on Every Profile
          </span>
        </div>

        {/* Social Proof Strip */}
        <div className="flex justify-center gap-8 mb-12 flex-wrap text-gray-700 text-lg font-medium">
          <span>📊 4,321 RFQs processed yesterday</span>
          <span>🔒 98% escrow success rate</span>
          <span>🏢 12,400 suppliers verified</span>
        </div>

        {/* CTA Section */}
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-xl">
          <input type="text" placeholder="What are you looking for? (e.g., Steel Pipes, Textiles)" className="flex-1 px-5 py-3 text-lg outline-none border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500" />
          <button className="bg-gradient-to-r from-indigo-600 to-emerald-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:from-indigo-700 hover:to-emerald-700 transition-all duration-300">
            🚀 Start My RFQ Now
          </button>
          <button className="bg-white text-indigo-600 border border-indigo-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition-all duration-300">
            ▶️ Watch 2-Min Demo
          </button>
        </div>

        {/* How It Works Section */}
        <section className="py-20 bg-white rounded-lg shadow-xl mt-16">
          <h2 className="text-5xl font-bold mb-12 text-gray-900">How Bell24h Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-4xl mb-4">1</div>
              <h3 className="text-2xl font-semibold mb-2 text-gray-800">Post Your RFQ</h3>
              <p className="text-gray-600">Submit your request by voice, video, or text. Our AI understands your needs.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mb-4">2</div>
              <h3 className="text-2xl font-semibold mb-2 text-gray-800">Get Verified Matches</h3>
              <p className="text-gray-600">Receive 3 AI-scored, GST-verified supplier quotes within 24 hours.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-4xl mb-4">3</div>
              <h3 className="text-2xl font-semibold mb-2 text-gray-800">Secure Escrow Payment</h3>
              <p className="text-gray-600">Funds are held in escrow and released only when you confirm satisfaction.</p>
            </div>
          </div>
        </section>

        {/* Popular Categories Section */}
        <section className="py-20">
          <h2 className="text-5xl font-bold mb-12 text-gray-900">Popular Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-3xl font-semibold text-indigo-700 mb-4">Steel & Metals</h3>
              <p className="text-gray-600 mb-4">Find verified suppliers for all types of steel, aluminum, and other metals.</p>
              <button className="text-indigo-600 font-semibold hover:underline">Explore Now →</button>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-3xl font-semibold text-emerald-700 mb-4">Textiles & Apparel</h3>
              <p className="text-gray-600 mb-4">Connect with manufacturers for fabrics, garments, and fashion accessories.</p>
              <button className="text-emerald-600 font-semibold hover:underline">Explore Now →</button>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-3xl font-semibold text-purple-700 mb-4">Electronics & Components</h3>
              <p className="text-gray-600 mb-4">Source high-quality electronic components and finished goods globally.</p>
              <button className="text-purple-600 font-semibold hover:underline">Explore Now →</button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">B</div>
            <span className="text-2xl font-bold">Bell24h</span>
          </div>
          <p className="text-gray-400 mb-4">India's Fastest B2B Match-Making Engine for MSMEs</p>
          <p className="text-gray-500 text-sm">© 2024 Bell24h. All rights reserved. Made in India 🇮🇳</p>
        </div>
      </footer>
    </div>
  )
}
