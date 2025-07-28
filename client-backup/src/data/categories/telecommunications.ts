import { Category } from '../../types/categories.js';

export const telecommunications: Category = {
  id: 'telecommunications',
  name: 'Telecommunications',
  description: 'Telecommunications equipment, services, and infrastructure',
  slug: 'telecommunications',
  icon: '📡',
  subcategories: [
    {
      id: 'telecom-equipment',
      name: 'Telecommunications Equipment',
      slug: 'telecom-equipment',
      description: 'Hardware for telecommunications networks',
      icon: '📱'
    },
    {
      id: 'network-infrastructure',
      name: 'Network Infrastructure',
      slug: 'network-infrastructure',
      description: 'Infrastructure for telecommunications networks',
      icon: '🌐'
    },
    {
      id: 'wireless-communication',
      name: 'Wireless Communication',
      slug: 'wireless-communication',
      description: 'Equipment and services for wireless networks',
      icon: '📶'
    },
    {
      id: 'satellite-communication',
      name: 'Satellite Communication',
      slug: 'satellite-communication',
      description: 'Satellite-based communication systems',
      icon: '🛰️'
    },
    {
      id: 'telecom-services',
      name: 'Telecommunications Services',
      slug: 'telecom-services',
      description: 'Services for telecommunications',
      icon: '📞'
    },
    {
      id: 'telecom-software',
      name: 'Telecommunications Software',
      slug: 'telecom-software',
      description: 'Software for telecommunications systems',
      icon: '💻'
    },
    {
      id: 'telecom-testing',
      name: 'Telecommunications Testing',
      slug: 'telecom-testing',
      description: 'Equipment and services for testing telecommunications systems',
      icon: '🔍'
    },
    {
      id: 'telecom-consulting',
      name: 'Telecommunications Consulting',
      slug: 'telecom-consulting',
      description: 'Consulting services for telecommunications',
      icon: '📝'
    }
  ]
};
