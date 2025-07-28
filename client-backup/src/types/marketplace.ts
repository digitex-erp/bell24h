/**
 * Types and interfaces for the Bell24H Marketplace
 * This file defines the category structure for 30 comprehensive marketplace categories
 */

export interface Subcategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  subcategories: Subcategory[];
}

export type CategoryId = 
  | 'agriculture'
  | 'apparel'
  | 'automobile'
  | 'electronics'
  | 'health'
  | 'construction'
  | 'food'
  | 'software'
  | 'energy'
  | 'furniture'
  | 'logistics'
  | 'chemicals'
  | 'education'
  | 'sports'
  | 'telecommunications'
  | 'packaging'
  | 'textiles'
  | 'security'
  | 'tools'
  | 'toys'
  | 'travel'
  | 'business'
  | 'environment'
  | 'ayurveda'
  | 'office'
  | 'minerals'
  | 'plastics'
  | 'electrical'
  | 'gifts'
  | 'jewelry';
