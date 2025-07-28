import { Category } from '../../types/categories.js';

export const safety: Category = {
  id: 'safety-security',
  name: 'Safety & Security',
  description: 'Safety equipment, security systems, and related services',
  slug: 'safety-security',
  icon: '🛡️',
  subcategories: [
    {
      id: 'personal-protective',
      name: 'Personal Protective Equipment',
      slug: 'personal-protective',
      description: 'Equipment for personal safety',
      icon: '🥽'
    },
    {
      id: 'fire-safety',
      name: 'Fire Safety',
      slug: 'fire-safety',
      description: 'Equipment and systems for fire prevention and control',
      icon: '🧯'
    },
    {
      id: 'security-systems',
      name: 'Security Systems',
      slug: 'security-systems',
      description: 'Systems for security and surveillance',
      icon: '📹'
    },
    {
      id: 'access-control',
      name: 'Access Control',
      slug: 'access-control',
      description: 'Systems for controlling access to facilities',
      icon: '🔐'
    },
    {
      id: 'workplace-safety',
      name: 'Workplace Safety',
      slug: 'workplace-safety',
      description: 'Equipment and services for workplace safety',
      icon: '⚠️'
    },
    {
      id: 'safety-signs',
      name: 'Safety Signs & Signals',
      slug: 'safety-signs',
      description: 'Signs and signals for safety information',
      icon: '🚸'
    },
    {
      id: 'security-services',
      name: 'Security Services',
      slug: 'security-services',
      description: 'Professional security services',
      icon: '💂'
    },
    {
      id: 'safety-training',
      name: 'Safety Training',
      slug: 'safety-training',
      description: 'Training services for safety and security',
      icon: '👨‍🏫'
    }
  ]
};
