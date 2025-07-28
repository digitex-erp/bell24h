import { Category } from '../../types/categories.js';

export const plastics: Category = {
  id: 'plastics-rubber',
  name: 'Plastics & Rubber',
  description: 'Plastic products, rubber materials, and related equipment',
  slug: 'plastics-rubber',
  icon: '🧩',
  subcategories: [
    {
      id: 'plastic-products',
      name: 'Plastic Products',
      slug: 'plastic-products',
      description: 'Finished products made from plastics',
      icon: '🧩'
    },
    {
      id: 'rubber-products',
      name: 'Rubber Products',
      slug: 'rubber-products',
      description: 'Finished products made from rubber',
      icon: '🧪'
    },
    {
      id: 'plastic-raw-materials',
      name: 'Plastic Raw Materials',
      slug: 'plastic-raw-materials',
      description: 'Raw materials for plastic production',
      icon: '🧫'
    },
    {
      id: 'rubber-raw-materials',
      name: 'Rubber Raw Materials',
      slug: 'rubber-raw-materials',
      description: 'Raw materials for rubber production',
      icon: '🌴'
    },
    {
      id: 'plastic-processing',
      name: 'Plastic Processing Equipment',
      slug: 'plastic-processing',
      description: 'Equipment for processing plastics',
      icon: '⚙️'
    },
    {
      id: 'rubber-processing',
      name: 'Rubber Processing Equipment',
      slug: 'rubber-processing',
      description: 'Equipment for processing rubber',
      icon: '🔧'
    },
    {
      id: 'recycled-plastics',
      name: 'Recycled Plastics',
      slug: 'recycled-plastics',
      description: 'Recycled plastic materials and products',
      icon: '♻️'
    },
    {
      id: 'plastic-rubber-testing',
      name: 'Plastic & Rubber Testing',
      slug: 'plastic-rubber-testing',
      description: 'Testing services for plastics and rubber',
      icon: '🔬'
    }
  ]
};
