import { Category } from '../../types/categories.js';

export const ayurveda: Category = {
  id: 'ayurveda-herbal',
  name: 'Ayurveda & Herbal Products',
  description: 'Ayurvedic medicines, herbal products, and related equipment',
  slug: 'ayurveda-herbal',
  icon: '🌿',
  subcategories: [
    {
      id: 'ayurvedic-medicines',
      name: 'Ayurvedic Medicines',
      slug: 'ayurvedic-medicines',
      description: 'Traditional Ayurvedic medicinal preparations',
      icon: '💊'
    },
    {
      id: 'herbal-supplements',
      name: 'Herbal Supplements',
      slug: 'herbal-supplements',
      description: 'Natural supplements and herbal extracts',
      icon: '🌱'
    },
    {
      id: 'ayurvedic-equipment',
      name: 'Ayurvedic Equipment',
      slug: 'ayurvedic-equipment',
      description: 'Equipment for Ayurvedic treatments and procedures',
      icon: '⚗️'
    },
    {
      id: 'medicinal-herbs',
      name: 'Medicinal Herbs',
      slug: 'medicinal-herbs',
      description: 'Raw herbs and plants for medicinal use',
      icon: '🌿'
    },
    {
      id: 'ayurvedic-oils',
      name: 'Ayurvedic Oils',
      slug: 'ayurvedic-oils',
      description: 'Therapeutic oils for Ayurvedic treatments',
      icon: '🧴'
    },
    {
      id: 'herbal-cosmetics',
      name: 'Herbal Cosmetics',
      slug: 'herbal-cosmetics',
      description: 'Natural and herbal personal care products',
      icon: '💄'
    },
    {
      id: 'ayurvedic-services',
      name: 'Ayurvedic Services',
      slug: 'ayurvedic-services',
      description: 'Professional Ayurvedic treatment services',
      icon: '👨‍⚕️'
    },
    {
      id: 'herbal-processing',
      name: 'Herbal Processing Equipment',
      slug: 'herbal-processing',
      description: 'Equipment for processing herbs and natural products',
      icon: '⚙️'
    }
  ]
};
