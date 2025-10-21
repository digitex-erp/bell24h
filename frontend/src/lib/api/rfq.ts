import { supabase } from '@/lib/supabase'

export interface RFQFormData {
  title: string
  description: string
  category: string
  subcategory: string
  quantity: number
  unit: string
  budget: number
  deadline: string
  delivery_location: string
  attachments?: File[]
}

export const categories = [
  {
    name: 'Manufacturing',
    subcategories: ['Electronics', 'Automotive', 'Machinery', 'Plastics', 'Metal Fabrication']
  },
  {
    name: 'Textiles',
    subcategories: ['Apparel', 'Fabrics', 'Home Textiles', 'Technical Textiles']
  },
  {
    name: 'IT Services',
    subcategories: ['Software Development', 'Cloud Services', 'Networking', 'Cybersecurity']
  },
  {
    name: 'Construction',
    subcategories: ['Building Materials', 'Heavy Equipment', 'Interior Finishes', 'MEP']
  }
]

export const units = [
  'Pieces',
  'Kilograms',
  'Meters',
  'Liters',
  'Square Meters',
  'Hours',
  'Days',
  'Months'
]

export async function createRFQ(data: RFQFormData) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const formData = new FormData()
  
  // Add RFQ data
  formData.append('rfq_in', JSON.stringify({
    title: data.title,
    description: data.description,
    category: data.category,
    subcategory: data.subcategory,
    quantity: data.quantity,
    unit: data.unit,
    budget: data.budget,
    deadline: new Date(data.deadline).toISOString(),
    delivery_location: data.delivery_location
  }))

  // Add attachments
  if (data.attachments) {
    data.attachments.forEach((file) => {
      formData.append('files', file)
    })
  }

  const response = await fetch('/api/v1/rfq', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    },
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to create RFQ')
  }

  return response.json()
}

export async function getUserRFQs() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const response = await fetch('/api/v1/rfq/my-rfqs', {
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to fetch RFQs')
  }

  return response.json()
}

export async function sendRFQToSuppliers(rfqId: number, supplierIds: number[]) {
  const session = await supabase.auth.getSession()
  if (!session.data.session) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(`/api/v1/rfq/${rfqId}/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.data.session.access_token}`
    },
    body: JSON.stringify({ supplier_ids: supplierIds })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to send RFQ to suppliers')
  }

  return response.json()
}
