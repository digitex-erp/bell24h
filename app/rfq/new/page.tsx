'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewRFQPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    quantity: '',
    budget: '',
    deadline: '',
    specifications: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/rfq/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: formData.quantity ? parseInt(formData.quantity) : 1,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          specifications: formData.specifications.split(',').map(s => s.trim()).filter(s => s)
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/rfq/${data.rfq.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to create RFQ')
      }
    } catch (error) {
      setError('Failed to create RFQ. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">B</div>
                <div>
                  <div className="font-bold text-xl">Bell24h</div>
                  <div className="text-xs text-gray-600">Verified B2B Platform</div>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">Dashboard</Link>
                <Link href="/rfq" className="text-gray-700 hover:text-indigo-600">My RFQs</Link>
                <Link href="/rfq/new" className="text-indigo-600 font-semibold">New RFQ</Link>
                <Link href="#" className="text-gray-700 hover:text-indigo-600">Suppliers</Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">Back to Dashboard</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Create New RFQ</h1>
            <p className="text-xl text-gray-600">Post your request and get 3 verified quotes in 24 hours</p>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  RFQ Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Steel Pipes for Construction Project"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Provide detailed specifications, quality requirements, delivery timeline, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a category</option>
                    <option value="Steel & Metals">Steel & Metals</option>
                    <option value="Textiles & Apparel">Textiles & Apparel</option>
                    <option value="Electronics & Components">Electronics & Components</option>
                    <option value="Machinery & Equipment">Machinery & Equipment</option>
                    <option value="Chemicals & Materials">Chemicals & Materials</option>
                    <option value="Food & Beverages">Food & Beverages</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter quantity"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                    Budget (₹)
                  </label>
                  <input
                    type="number"
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your budget"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Deadline
                  </label>
                  <input
                    type="date"
                    id="deadline"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="specifications" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Specifications
                </label>
                <textarea
                  id="specifications"
                  name="specifications"
                  rows={3}
                  value={formData.specifications}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter specifications separated by commas (e.g., Grade A steel, 6 inch diameter, galvanized coating)"
                />
                <p className="mt-1 text-sm text-gray-500">Separate multiple specifications with commas</p>
              </div>

              <div className="bg-indigo-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-indigo-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-indigo-800 space-y-1">
                  <li>• Your RFQ will be published to verified suppliers</li>
                  <li>• You'll receive 3 qualified quotes within 24 hours</li>
                  <li>• Compare quotes and select the best supplier</li>
                  <li>• Secure payment through our escrow system</li>
                </ul>
              </div>

              <div className="flex justify-end gap-4">
                <Link
                  href="/rfq"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Creating RFQ...' : 'Create RFQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

