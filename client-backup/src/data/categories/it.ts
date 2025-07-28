import { Category } from '../../types/categories.js';

export const it: Category = {
  id: 'it-software',
  name: 'IT & Software',
  description: 'Information technology services, software, and hardware',
  slug: 'it-software',
  icon: '💻',
  subcategories: [
    {
      id: 'software-development',
      name: 'Software Development',
      slug: 'software-development',
      description: 'Custom software development services',
      icon: '👨‍💻'
    },
    {
      id: 'web-development',
      name: 'Web Development',
      slug: 'web-development',
      description: 'Website design and development services',
      icon: '🌐'
    },
    {
      id: 'mobile-app-development',
      name: 'Mobile App Development',
      slug: 'mobile-app-development',
      description: 'Mobile application development for iOS and Android',
      icon: '📱'
    },
    {
      id: 'cloud-services',
      name: 'Cloud Services',
      slug: 'cloud-services',
      description: 'Cloud computing and storage solutions',
      icon: '☁️'
    },
    {
      id: 'cybersecurity',
      name: 'Cybersecurity',
      slug: 'cybersecurity',
      description: 'Security solutions for IT infrastructure',
      icon: '🔒'
    },
    {
      id: 'data-analytics',
      name: 'Data Analytics',
      slug: 'data-analytics',
      description: 'Data processing and analytics services',
      icon: '📊'
    },
    {
      id: 'ai-machine-learning',
      name: 'AI & Machine Learning',
      slug: 'ai-machine-learning',
      description: 'Artificial intelligence and machine learning solutions',
      icon: '🤖'
    },
    {
      id: 'it-consulting',
      name: 'IT Consulting',
      slug: 'it-consulting',
      description: 'Professional IT consulting services',
      icon: '📝'
    }
  ]
};
