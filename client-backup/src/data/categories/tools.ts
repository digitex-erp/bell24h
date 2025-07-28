import { Category } from '../../types/categories.js';

export const tools: Category = {
  id: 'tools',
  name: 'Tools',
  description: 'Hand tools, power tools, and industrial tools',
  slug: 'tools',
  icon: '🔨',
  subcategories: [
    {
      id: 'hand-tools',
      name: 'Hand Tools',
      slug: 'hand-tools',
      description: 'Manual tools for various applications',
      icon: '🔧'
    },
    {
      id: 'power-tools',
      name: 'Power Tools',
      slug: 'power-tools',
      description: 'Electric and battery-powered tools',
      icon: '⚡'
    },
    {
      id: 'industrial-tools',
      name: 'Industrial Tools',
      slug: 'industrial-tools',
      description: 'Heavy-duty tools for industrial use',
      icon: '🏭'
    },
    {
      id: 'measuring-tools',
      name: 'Measuring Tools',
      slug: 'measuring-tools',
      description: 'Tools for measurement and precision',
      icon: '📏'
    },
    {
      id: 'cutting-tools',
      name: 'Cutting Tools',
      slug: 'cutting-tools',
      description: 'Tools for cutting various materials',
      icon: '✂️'
    },
    {
      id: 'tool-accessories',
      name: 'Tool Accessories',
      slug: 'tool-accessories',
      description: 'Accessories and attachments for tools',
      icon: '🔌'
    },
    {
      id: 'tool-storage',
      name: 'Tool Storage',
      slug: 'tool-storage',
      description: 'Boxes, cabinets, and storage solutions for tools',
      icon: '🧰'
    },
    {
      id: 'tool-rental',
      name: 'Tool Rental Services',
      slug: 'tool-rental',
      description: 'Services for renting tools and equipment',
      icon: '💰'
    }
  ]
};
