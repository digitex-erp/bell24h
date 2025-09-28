import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Voice RFQ - Bell24h',
  description: 'Create RFQs using voice commands and AI'
};

export default function VoiceRFQPage() {
  return (
    <div className="page-container">
      <div className="page-content">
        {/* Header Section */}
        <div className="page-header">
          <h1 className="page-title">Voice RFQ</h1>
          <p className="page-subtitle">
            Create RFQs using voice commands and AI-powered natural language processing
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Main Voice Interface */}
          <div className="card card-hover mb-8">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🎤</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create RFQ with Voice</h2>
              <p className="text-lg text-gray-600 mb-8">
                Simply speak your requirements and our AI will create a detailed RFQ for you
              </p>
            </div>

            <div className="text-center mb-8">
              <button className="bg-red-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-red-700 transition-colors flex items-center mx-auto">
                <span className="mr-2">🎤</span>
                Start Recording
              </button>
              <p className="text-sm text-gray-600 mt-3">
                Click and hold to record, release to stop
              </p>
            </div>

            {/* Voice Commands Examples */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Commands Examples:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700">
                      <strong>"I need 1000 cotton t-shirts"</strong>
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700">
                      <strong>"Looking for steel pipes for construction"</strong>
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700">
                      <strong>"Need pharmaceutical packaging materials"</strong>
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700">
                      <strong>"Require automotive parts delivery in 2 weeks"</strong>
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700">
                      <strong>"Want to buy agricultural equipment"</strong>
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700">
                      <strong>"Need IT services for my company"</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works & Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">How It Works</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Speak Your Requirements</h4>
                    <p className="text-sm text-gray-600">Describe what you need in natural language</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">AI Processing</h4>
                    <p className="text-sm text-gray-600">Our AI extracts key details and creates structured RFQ</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Review & Edit</h4>
                    <p className="text-sm text-gray-600">Review the generated RFQ and make adjustments</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                    <span className="text-blue-600 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Submit RFQ</h4>
                    <p className="text-sm text-gray-600">Send to relevant suppliers automatically</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Features</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-green-600 mr-3 text-lg">✓</span>
                  <span className="text-sm text-gray-700">Multi-language support (Hindi, English)</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-3 text-lg">✓</span>
                  <span className="text-sm text-gray-700">Automatic category detection</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-3 text-lg">✓</span>
                  <span className="text-sm text-gray-700">Quantity and specification extraction</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-3 text-lg">✓</span>
                  <span className="text-sm text-gray-700">Timeline and budget estimation</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-3 text-lg">✓</span>
                  <span className="text-sm text-gray-700">Smart supplier matching</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 mr-3 text-lg">✓</span>
                  <span className="text-sm text-gray-700">Voice-to-text accuracy 95%+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Voice RFQs */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Voice RFQs</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">Cotton T-shirts for retail</p>
                  <p className="text-sm text-gray-600">Created 2 hours ago via voice</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="badge-success">Active</span>
                  <button className="btn-outline text-sm px-4 py-2">View</button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">Steel pipes for construction</p>
                  <p className="text-sm text-gray-600">Created yesterday via voice</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="badge-info">Quoted</span>
                  <button className="btn-outline text-sm px-4 py-2">View</button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">Pharmaceutical packaging</p>
                  <p className="text-sm text-gray-600">Created 3 days ago via voice</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="badge-warning">Completed</span>
                  <button className="btn-outline text-sm px-4 py-2">View</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
