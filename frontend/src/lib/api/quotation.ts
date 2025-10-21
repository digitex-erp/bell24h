import { supabase } from '@/lib/supabase'

export interface Quotation {
  id: number
  rfq_id: number
  supplier_id: number
  unit_price: number
  total_price: number
  currency: string
  delivery_time: number
  delivery_terms: string
  warranty_period: string
  payment_terms: string
  validity_period: number
  technical_specifications?: string
  terms_and_conditions?: string
  notes?: string
  status: string
  created_at: string
  updated_at: string
  submitted_at?: string
  attachments: QuotationAttachment[]
}

export interface QuotationAttachment {
  id: number
  quotation_id: number
  file_name: string
  file_url: string
  file_type: string
  description?: string
  created_at: string
}

export async function createQuotation(formData: FormData) {
  const { data: session } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const response = await fetch('/api/v1/quotations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    },
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to create quotation')
  }

  return response.json()
}

export async function updateQuotation(quotationId: number, data: Partial<Quotation>) {
  const { data: session } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(`/api/v1/quotations/${quotationId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to update quotation')
  }

  return response.json()
}

export async function submitQuotation(quotationId: number) {
  const { data: session } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(`/api/v1/quotations/${quotationId}/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to submit quotation')
  }

  return response.json()
}

export async function acceptQuotation(quotationId: number) {
  const { data: session } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(`/api/v1/quotations/${quotationId}/accept`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to accept quotation')
  }

  return response.json()
}

export async function rejectQuotation(quotationId: number) {
  const { data: session } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(`/api/v1/quotations/${quotationId}/reject`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to reject quotation')
  }

  return response.json()
}

export async function getRFQQuotations(rfqId: number) {
  const { data: session } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(`/api/v1/quotations/rfq/${rfqId}`, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to fetch quotations')
  }

  return response.json() as Promise<Quotation[]>
}

export async function getSupplierQuotations() {
  const { data: session } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const response = await fetch('/api/v1/quotations/supplier', {
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to fetch quotations')
  }

  return response.json() as Promise<Quotation[]>
}
