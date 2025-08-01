'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface UserProfile {
  id: string
  email: string
  company_name?: string
  company_type?: string
  is_first_login?: boolean
  profile_completed?: boolean
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/login')
          return
        }

        setUser(session.user)

        // Check if user profile exists and is complete
        const { data: profileData, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        if (error || !profileData) {
          // New user - show onboarding
          setShowOnboarding(true)
        } else {
          setProfile(profileData)
          // Check if profile needs completion
          if (!profileData.profile_completed) {
            setShowOnboarding(true)
          }
        }
      } catch (error) {
        console.error('Dashboard initialization error:', error)
      } finally {
        setLoading(false)
      }
    }
    initializeDashboard()
  }, [supabase, router])

  const completeOnboarding = async (profileData: any) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          email: user.email,
          ...profileData,
          profile_completed: true,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      setShowOnboarding(false)
      setProfile({ ...profileData, profile_completed: true })
      
      // Redirect to main dashboard after successful completion
      router.push('/dashboard')
    } catch (error) {
      console.error('Profile completion error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your Bell24h dashboard...</p>
        </div>
      </div>
    )
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={completeOnboarding} userEmail={user?.email} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Dashboard Content */}
      <DashboardContent user={user} profile={profile} />
    </div>
  )
}

// ===============================================
// ONBOARDING FLOW FOR NEW USERS
// ===============================================
function OnboardingFlow({ onComplete, userEmail }: { onComplete: (data: any) => void, userEmail: string }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    company_name: '',
    company_type: '',
    business_category: '',
    role: '',
    phone: '',
    city: '',
    state: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    setStep(step + 1)
  }

  const handleSubmit = () => {
    onComplete(formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome to Bell24h! 🚀</h1>
            <p className="text-gray-600 mt-2">India's First AI-Powered B2B Marketplace</p>
            <div className="mt-4 flex justify-center space-x-2">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className={`w-3 h-3 rounded-full ${
                    num <= step ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Type *
                </label>
                <select
                  value={formData.company_type}
                  onChange={(e) => handleInputChange('company_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select company type</option>
                  <option value="manufacturer">Manufacturer</option>
                  <option value="supplier">Supplier</option>
                  <option value="trader">Trader</option>
                  <option value="service_provider">Service Provider</option>
                  <option value="startup">Startup</option>
                  <option value="msme">MSME</option>
                </select>
              </div>
              <button
                onClick={handleNext}
                disabled={!formData.company_name || !formData.company_type}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Business Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Category *
                </label>
                <select
                  value={formData.business_category}
                  onChange={(e) => handleInputChange('business_category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  <option value="automotive">Automotive</option>
                  <option value="electronics">Electronics</option>
                  <option value="textiles">Textiles</option>
                  <option value="chemicals">Chemicals</option>
                  <option value="steel_metals">Steel & Metals</option>
                  <option value="machinery">Machinery</option>
                  <option value="food_beverage">Food & Beverage</option>
                  <option value="construction">Construction</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select your role</option>
                  <option value="owner">Owner</option>
                  <option value="director">Director</option>
                  <option value="manager">Manager</option>
                  <option value="procurement">Procurement Head</option>
                  <option value="sales">Sales Head</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!formData.business_category || !formData.role}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 9876543210"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Maharashtra"
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.phone || !formData.city || !formData.state}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Complete Setup 🚀
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ===============================================
// MAIN DASHBOARD CONTENT
// ===============================================
function DashboardContent({ user, profile }: { user: any, profile: any }) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Bell24h</h1>
              <span className="ml-2 text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-full">
                AI-Powered
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{profile?.company_name || 'Welcome'}</p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Banner for New Users */}
      {profile?.is_first_login && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl font-bold mb-2">🎉 Welcome to Bell24h, {profile?.company_name}!</h2>
            <p className="text-blue-100">
              You're now part of India's most advanced AI-powered B2B marketplace. Start exploring our AI features and connect with thousands of suppliers and buyers!
            </p>
          </div>
        </div>
      )}

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">📋</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active RFQs</dt>
                    <dd className="text-lg font-medium text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">🏭</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Connected Suppliers</dt>
                    <dd className="text-lg font-medium text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">💬</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">AI Conversations</dt>
                    <dd className="text-lg font-medium text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">💰</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Deals Closed</dt>
                    <dd className="text-lg font-medium text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Features Showcase */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">🤖 Explore Bell24h's AI Features</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all">
                <div className="text-center">
                  <div className="text-3xl mb-3">🎤</div>
                  <h4 className="font-medium text-gray-900 mb-2">Voice-to-RFQ</h4>
                  <p className="text-sm text-gray-600 mb-3">Speak your requirements, get instant structured RFQs</p>
                  <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
                    Try Now →
                  </button>
                </div>
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 hover:border-green-400 hover:bg-green-50 cursor-pointer transition-all">
                <div className="text-center">
                  <div className="text-3xl mb-3">🎯</div>
                  <h4 className="font-medium text-gray-900 mb-2">Smart Matching</h4>
                  <p className="text-sm text-gray-600 mb-3">AI finds perfect suppliers for your requirements</p>
                  <button className="text-green-600 text-sm font-medium hover:text-green-800">
                    Explore →
                  </button>
                </div>
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 hover:border-purple-400 hover:bg-purple-50 cursor-pointer transition-all">
                <div className="text-center">
                  <div className="text-3xl mb-3">📊</div>
                  <h4 className="font-medium text-gray-900 mb-2">Market Intel</h4>
                  <p className="text-sm text-gray-600 mb-3">AI-powered demand forecasting and price trends</p>
                  <button className="text-purple-600 text-sm font-medium hover:text-purple-800">
                    View Insights →
                  </button>
                </div>
              </div>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 hover:border-orange-400 hover:bg-orange-50 cursor-pointer transition-all">
                <div className="text-center">
                  <div className="text-3xl mb-3">🤖</div>
                  <h4 className="font-medium text-gray-900 mb-2">AI Assistant</h4>
                  <p className="text-sm text-gray-600 mb-3">24/7 business assistant for all your queries</p>
                  <button className="text-orange-600 text-sm font-medium hover:text-orange-800">
                    Chat Now →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors">
                Create New RFQ
              </button>
              <button className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-medium transition-colors">
                Browse Suppliers
              </button>
              <button className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 font-medium transition-colors">
                View Analytics
              </button>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-3">📭</div>
              <p className="text-gray-500">No recent activity</p>
              <p className="text-sm text-gray-400 mt-1">Start by creating your first RFQ!</p>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Help & Support</h3>
            <div className="space-y-3">
              <a href="#" className="block text-blue-600 hover:text-blue-800 text-sm">
                📖 Getting Started Guide
              </a>
              <a href="#" className="block text-blue-600 hover:text-blue-800 text-sm">
                🎥 Video Tutorials
              </a>
              <a href="#" className="block text-blue-600 hover:text-blue-800 text-sm">
                💬 Contact Support
              </a>
              <a href="#" className="block text-blue-600 hover:text-blue-800 text-sm">
                🤝 Schedule Demo
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
