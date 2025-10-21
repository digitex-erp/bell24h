import { supabase } from '@/lib/supabase'

export interface SupplierFormData {
  company_name: string
  description: string
  categories: string[]
  subcategories: string[]
  specialties: string
  certifications: string[]
  location: string
}

export interface SupplierMatch {
  supplier: {
    id: number
    company_name: string
    description: string
    categories: string[]
    subcategories: string[]
    specialties: string
    certifications: string[]
    location: string
  }
  score: number
  category_match: boolean
  subcategory_match: boolean
}

export async function createSupplierProfile(data: SupplierFormData) {
  const { data: session } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const response = await fetch('/api/v1/suppliers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to create supplier profile')
  }

  return response.json()
}

export async function updateSupplierProfile(supplierId: number, data: Partial<SupplierFormData>) {
  const { data: session } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(`/api/v1/suppliers/${supplierId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to update supplier profile')
  }

  return response.json()
}

export async function getMatchingSuppliers(rfqId: number) {
  const { data: session } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(`/api/v1/rfq/${rfqId}/matches`, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to get matching suppliers')
  }

  return response.json() as Promise<SupplierMatch[]>
}
