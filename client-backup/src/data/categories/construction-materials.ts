import { Category } from '../../types/categories.js';

export const constructionMaterials: Category = {
  id: 'construction-materials',
  name: 'Construction Materials',
  description: 'Building materials for construction and real estate projects',
  slug: 'construction-materials',
  icon: '🏗️',
  subcategories: [
    {
      id: 'building-materials',
      name: 'Building Materials',
      slug: 'building-materials',
      description: 'Concrete, bricks, cement, and other construction materials',
      icon: '🟥'
    },
    {
      id: 'steel-structures',
      name: 'Steel Structures',
      slug: 'steel-structures',
      description: 'Steel beams, columns, and structural components',
      icon: '🪜'
    },
    {
      id: 'glass-supplies',
      name: 'Glass Supplies',
      slug: 'glass-supplies',
      description: 'Architectural glass, windows, and glass panels',
      icon: '🪟'
    },
    {
      id: 'flooring-materials',
      name: 'Flooring Materials',
      slug: 'flooring-materials',
      description: 'Tiles, carpets, wooden flooring, and other floor coverings',
      icon: '🪑'
    },
    {
      id: 'roofing-materials',
      name: 'Roofing Materials',
      slug: 'roofing-materials',
      description: 'Roof tiles, shingles, and waterproofing materials',
      icon: '🪝'
    },
    {
      id: 'insulation-materials',
      name: 'Insulation Materials',
      slug: 'insulation-materials',
      description: 'Thermal and acoustic insulation solutions',
      icon: '❄️'
    },
    {
      id: 'plumbing-supplies',
      name: 'Plumbing Supplies',
      slug: 'plumbing-supplies',
      description: 'Pipes, fittings, and plumbing accessories',
      icon: '🚰'
    },
    {
      id: 'electrical-fittings',
      name: 'Electrical Fittings',
      slug: 'electrical-fittings',
      description: 'Wiring, switches, and electrical components',
      icon: '💡'
    }
  ]
};

export default constructionMaterials;
