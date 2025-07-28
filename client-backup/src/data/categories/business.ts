import { Category } from '../../types/categories.js';

export const business: Category = {
  id: 'business-services',
  name: 'Business Services',
  description: 'Professional services for businesses',
  slug: 'business-services',
  icon: '💼',
  subcategories: [
    {
      id: 'consulting-services',
      name: 'Consulting Services',
      slug: 'consulting-services',
      description: 'Professional business consulting',
      icon: '📊'
    },
    {
      id: 'accounting-services',
      name: 'Accounting & Financial Services',
      slug: 'accounting-services',
      description: 'Accounting, bookkeeping, and financial services',
      icon: '💰'
    },
    {
      id: 'legal-services',
      name: 'Legal Services',
      slug: 'legal-services',
      description: 'Legal consulting and services',
      icon: '⚖️'
    },
    {
      id: 'marketing-services',
      name: 'Marketing & Advertising',
      slug: 'marketing-services',
      description: 'Marketing, advertising, and promotional services',
      icon: '📣'
    },
    {
      id: 'hr-services',
      name: 'HR & Recruitment',
      slug: 'hr-services',
      description: 'Human resources and recruitment services',
      icon: '👥'
    },
    {
      id: 'translation-services',
      name: 'Translation & Interpretation',
      slug: 'translation-services',
      description: 'Language translation and interpretation services',
      icon: '🌐'
    },
    {
      id: 'business-training',
      name: 'Business Training',
      slug: 'business-training',
      description: 'Training and development for businesses',
      icon: '👨‍🏫'
    },
    {
      id: 'office-services',
      name: 'Office Support Services',
      slug: 'office-services',
      description: 'Administrative and support services for offices',
      icon: '🗃️'
    }
  ]
};
