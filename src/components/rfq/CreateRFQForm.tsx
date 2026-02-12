'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@insforge/nextjs';
import { insforge } from '@/lib/insforge';
import { useRouter } from 'next/navigation';

export default function CreateRFQForm() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    quantity: '',
    unit: 'units',
    budget_min: '',
    budget_max: '',
    location: '',
    deadline: '',
  });

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await insforge.database
        .from('categories')
        .select('id, name, slug')
        .is('parent_id', null)
        .order('name', { ascending: true });

      if (!error && data) {
        setCategories(data);
      }
    }

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Please sign in to create an RFQ');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await insforge.database
        .from('rfqs')
        .insert([{
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          quantity: Number(formData.quantity),
          unit: formData.unit,
          budget_min: Number(formData.budget_min),
          budget_max: Number(formData.budget_max),
          location: formData.location,
          deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
          type: 'text',
          status: 'open',
          is_public: true,
        }])
        .select();

      if (error) {
        throw error;
      }

      alert('RFQ created successfully!');
      router.push('/dashboard/rfqs');
    } catch (error: any) {
      console.error('Error creating RFQ:', error);
      alert(`Error: ${error.message || 'Failed to create RFQ'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isLoaded) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-lg mb-4">Please sign in to create an RFQ</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Create Text RFQ</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product/Service Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g., Need 1000 kg Steel Rods"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Provide detailed requirements..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Quantity *</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
              placeholder="e.g., 1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Unit</label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="units">Units</option>
              <option value="kg">Kilograms</option>
              <option value="tons">Tons</option>
              <option value="liters">Liters</option>
              <option value="meters">Meters</option>
              <option value="pieces">Pieces</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Min Budget (₹) *</label>
            <input
              type="number"
              name="budget_min"
              value={formData.budget_min}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
              placeholder="e.g., 50000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Max Budget (₹) *</label>
            <input
              type="number"
              name="budget_max"
              value={formData.budget_max}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md"
              placeholder="e.g., 75000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Location *</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
            placeholder="e.g., Mumbai, Maharashtra"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Deadline (Optional)</label>
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Creating...' : 'Create RFQ'}
        </button>
      </div>
    </form>
  );
}
