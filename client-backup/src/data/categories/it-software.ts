import { Category } from '../../types/categories.js';

export const itSoftware: Category = {
  id: 'it-software',
  name: 'IT & Software Services',
  description: 'Professional IT solutions and software development services',
  slug: 'it-software',
  icon: '💻',
  subcategories: [
    {
      id: 'cloud-solutions',
      name: 'Cloud Solutions',
      slug: 'cloud-solutions',
      description: 'Cloud computing, storage, and infrastructure services',
      icon: '☁️'
    },
    {
      id: 'software-development',
      name: 'Software Development',
      slug: 'software-development',
      description: 'Custom software development and application services',
      icon: '📱'
    },
    {
      id: 'it-consulting',
      name: 'IT Consulting',
      slug: 'it-consulting',
      description: 'IT strategy, architecture, and implementation consulting',
      icon: '📊'
    },
    {
      id: 'saas-solutions',
      name: 'SaaS Solutions',
      slug: 'saas-solutions',
      description: 'Software as a Service applications and platforms',
      icon: '🌐'
    },
    {
      id: 'cybersecurity',
      name: 'Cybersecurity',
      slug: 'cybersecurity',
      description: 'Security solutions and managed security services',
      icon: '🛡️'
    },
    {
      id: 'data-center',
      name: 'Data Center',
      slug: 'data-center',
      description: 'Data center infrastructure and hosting services',
      icon: '💾'
    },
    {
      id: 'network-solutions',
      name: 'Network Solutions',
      slug: 'network-solutions',
      description: 'Network infrastructure and connectivity services',
      icon: '📡'
    },
    {
      id: 'it-support',
      name: 'IT Support',
      slug: 'it-support',
      description: 'Technical support and helpdesk services',
      icon: '🔧'
    }
  ]
};

export default itSoftware;
