import { Category } from '../../types/categories.js';

export const healthcare: Category = {
  id: 'health-medical',
  name: 'Health & Medical',
  description: 'Medical equipment, supplies, and healthcare services',
  slug: 'health-medical',
  icon: '🏥',
  subcategories: [
    {
      id: 'medical-equipment',
      name: 'Medical Equipment',
      slug: 'medical-equipment',
      description: 'Diagnostic and treatment equipment for healthcare facilities',
      icon: '🩺'
    },
    {
      id: 'medical-supplies',
      name: 'Medical Supplies',
      slug: 'medical-supplies',
      description: 'Disposable and consumable medical supplies',
      icon: '🧴'
    },
    {
      id: 'pharmaceuticals',
      name: 'Pharmaceuticals',
      slug: 'pharmaceuticals',
      description: 'Medicines and pharmaceutical products',
      icon: '💊'
    },
    {
      id: 'laboratory-equipment',
      name: 'Laboratory Equipment',
      slug: 'laboratory-equipment',
      description: 'Equipment and supplies for medical laboratories',
      icon: '🧪'
    },
    {
      id: 'dental-supplies',
      name: 'Dental Supplies',
      slug: 'dental-supplies',
      description: 'Equipment and supplies for dental practices',
      icon: '🦷'
    },
    {
      id: 'healthcare-services',
      name: 'Healthcare Services',
      slug: 'healthcare-services',
      description: 'Medical consulting and healthcare services',
      icon: '👨‍⚕️'
    },
    {
      id: 'fitness-equipment',
      name: 'Fitness Equipment',
      slug: 'fitness-equipment',
      description: 'Equipment for physical fitness and rehabilitation',
      icon: '🏋️'
    },
    {
      id: 'personal-care',
      name: 'Personal Care',
      slug: 'personal-care',
      description: 'Products for personal hygiene and care',
      icon: '🧼'
    }
  ]
};
