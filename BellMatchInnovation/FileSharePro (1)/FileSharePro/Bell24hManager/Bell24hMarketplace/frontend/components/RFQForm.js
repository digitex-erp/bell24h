import { useState } from 'react';
import { useRouter } from 'next/router';

export default function RFQForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    quantity: '',
    budget: '',
    delivery_days: '',
    requirements: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/rfq/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create RFQ');
      }

      // Redirect to the created RFQ
      router.push(`/rfq/${data.id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create a New RFQ</h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              RFQ Title *
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="mt-1 input"
              placeholder="E.g., '5000 Steel Bolts with Plating'"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="mt-1 input"
            >
              <option value="">Select a category</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="electronics">Electronics</option>
              <option value="textiles">Textiles & Apparel</option>
              <option value="chemicals">Chemicals</option>
              <option value="automotive">Automotive</option>
              <option value="pharmaceuticals">Pharmaceuticals</option>
              <option value="construction">Construction</option>
              <option value="food_processing">Food Processing</option>
              <option value="packaging">Packaging</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              id="quantity"
              required
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              className="mt-1 input"
              placeholder="Number of units"
            />
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
              Budget (₹) *
            </label>
            <input
              type="number"
              name="budget"
              id="budget"
              required
              min="1"
              value={formData.budget}
              onChange={handleChange}
              className="mt-1 input"
              placeholder="Your maximum budget in ₹"
            />
          </div>

          <div>
            <label htmlFor="delivery_days" className="block text-sm font-medium text-gray-700">
              Delivery Days *
            </label>
            <input
              type="number"
              name="delivery_days"
              id="delivery_days"
              required
              min="1"
              value={formData.delivery_days}
              onChange={handleChange}
              className="mt-1 input"
              placeholder="Required delivery time in days"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            required
            value={formData.description}
            onChange={handleChange}
            className="mt-1 input"
            placeholder="Provide a detailed description of what you need"
          />
        </div>

        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
            Technical Requirements
          </label>
          <textarea
            id="requirements"
            name="requirements"
            rows={3}
            value={formData.requirements}
            onChange={handleChange}
            className="mt-1 input"
            placeholder="Any specific technical requirements or standards?"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Delivery Address *
            </label>
            <input
              type="text"
              name="address"
              id="address"
              required
              value={formData.address}
              onChange={handleChange}
              className="mt-1 input"
              placeholder="Street address"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City *
            </label>
            <input
              type="text"
              name="city"
              id="city"
              required
              value={formData.city}
              onChange={handleChange}
              className="mt-1 input"
              placeholder="City"
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State *
            </label>
            <input
              type="text"
              name="state"
              id="state"
              required
              value={formData.state}
              onChange={handleChange}
              className="mt-1 input"
              placeholder="State"
            />
          </div>

          <div>
            <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
              Pincode *
            </label>
            <input
              type="text"
              name="pincode"
              id="pincode"
              required
              pattern="[0-9]{6}"
              value={formData.pincode}
              onChange={handleChange}
              className="mt-1 input"
              placeholder="6-digit pincode"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="mr-4 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {loading ? 'Creating...' : 'Create RFQ'}
          </button>
        </div>
      </form>
    </div>
  );
}
