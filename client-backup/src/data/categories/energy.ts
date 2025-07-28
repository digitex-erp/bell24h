import { Category } from '../../types/categories.js';

export const energy: Category = {
  id: 'energy',
  name: 'Energy',
  description: 'Energy production, distribution, and related equipment',
  slug: 'energy',
  icon: '⚡',
  subcategories: [
    {
      id: 'renewable-energy',
      name: 'Renewable Energy',
      slug: 'renewable-energy',
      description: 'Solar, wind, and other renewable energy solutions',
      icon: '☀️'
    },
    {
      id: 'power-generation',
      name: 'Power Generation',
      slug: 'power-generation',
      description: 'Equipment for generating electrical power',
      icon: '🔋'
    },
    {
      id: 'power-transmission',
      name: 'Power Transmission',
      slug: 'power-transmission',
      description: 'Equipment for transmitting electrical power',
      icon: '🔌'
    },
    {
      id: 'energy-storage',
      name: 'Energy Storage',
      slug: 'energy-storage',
      description: 'Batteries and energy storage solutions',
      icon: '🔋'
    },
    {
      id: 'oil-gas-equipment',
      name: 'Oil & Gas Equipment',
      slug: 'oil-gas-equipment',
      description: 'Equipment for oil and gas extraction and processing',
      icon: '🛢️'
    },
    {
      id: 'energy-efficiency',
      name: 'Energy Efficiency',
      slug: 'energy-efficiency',
      description: 'Products and services for improving energy efficiency',
      icon: '💡'
    },
    {
      id: 'energy-monitoring',
      name: 'Energy Monitoring',
      slug: 'energy-monitoring',
      description: 'Systems for monitoring energy consumption',
      icon: '📊'
    },
    {
      id: 'energy-consulting',
      name: 'Energy Consulting',
      slug: 'energy-consulting',
      description: 'Professional consulting services for energy sector',
      icon: '📝'
    }
  ]
};
