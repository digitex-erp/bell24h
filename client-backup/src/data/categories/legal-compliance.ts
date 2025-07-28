import { Category } from '../../types/categories.js';

export const legalCompliance: Category = {
  id: 'legal-compliance',
  name: 'Legal & Compliance Services',
  description: 'Professional legal and regulatory compliance services',
  slug: 'legal-compliance',
  icon: '⚖️',
  subcategories: [
    {
      id: 'contract-law',
      name: 'Contract Law',
      slug: 'contract-law',
      description: 'Contract drafting, review, and negotiation services',
      icon: '📄'
    },
    {
      id: 'corporate-law',
      name: 'Corporate Law',
      slug: 'corporate-law',
      description: 'Company formation, governance, and compliance',
      icon: '🏢'
    },
    {
      id: 'intellectual-property',
      name: 'Intellectual Property',
      slug: 'intellectual-property',
      description: 'Patents, trademarks, and copyright services',
      icon: '🧠'
    },
    {
      id: 'litigation-support',
      name: 'Litigation Support',
      slug: 'litigation-support',
      description: 'Legal representation and dispute resolution',
      icon: '⚖️'
    },
    {
      id: 'compliance-audit',
      name: 'Compliance Audit',
      slug: 'compliance-audit',
      description: 'Regulatory compliance and audit services',
      icon: '🔍'
    },
    {
      id: 'data-protection',
      name: 'Data Protection',
      slug: 'data-protection',
      description: 'GDPR, privacy, and data security services',
      icon: '🔒'
    },
    {
      id: 'employment-law',
      name: 'Employment Law',
      slug: 'employment-law',
      description: 'Labor law and HR compliance services',
      icon: '👥'
    },
    {
      id: 'tax-compliance',
      name: 'Tax Compliance',
      slug: 'tax-compliance',
      description: 'Tax advisory and compliance services',
      icon: '💰'
    }
  ]
};

export default legalCompliance;
