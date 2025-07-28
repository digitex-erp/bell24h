export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon: string;
  subcategories: Subcategory[];
}
