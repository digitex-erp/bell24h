import { Category } from '../../types/categories.js';

export const education: Category = {
  id: 'education',
  name: 'Education',
  description: 'Educational materials, equipment, and services',
  slug: 'education',
  icon: '🎓',
  subcategories: [
    {
      id: 'educational-materials',
      name: 'Educational Materials',
      slug: 'educational-materials',
      description: 'Books, digital content, and teaching materials',
      icon: '📚'
    },
    {
      id: 'educational-equipment',
      name: 'Educational Equipment',
      slug: 'educational-equipment',
      description: 'Equipment for schools and educational institutions',
      icon: '🔬'
    },
    {
      id: 'e-learning',
      name: 'E-Learning Solutions',
      slug: 'e-learning',
      description: 'Online learning platforms and tools',
      icon: '💻'
    },
    {
      id: 'training-services',
      name: 'Training Services',
      slug: 'training-services',
      description: 'Professional training and development services',
      icon: '👨‍🏫'
    },
    {
      id: 'educational-software',
      name: 'Educational Software',
      slug: 'educational-software',
      description: 'Software for education and training',
      icon: '📱'
    },
    {
      id: 'school-supplies',
      name: 'School Supplies',
      slug: 'school-supplies',
      description: 'Stationery and supplies for schools',
      icon: '✏️'
    },
    {
      id: 'educational-consulting',
      name: 'Educational Consulting',
      slug: 'educational-consulting',
      description: 'Consulting services for educational institutions',
      icon: '📝'
    },
    {
      id: 'language-learning',
      name: 'Language Learning',
      slug: 'language-learning',
      description: 'Materials and services for language education',
      icon: '🗣️'
    }
  ]
};
