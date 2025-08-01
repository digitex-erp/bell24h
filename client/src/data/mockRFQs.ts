import { ALL_CATEGORIES } from './categories';

export interface MockRFQ {
  id: string;
  category: string;
  subcategory: string;
  title: string;
  description: string;
  quantity: string;
  budget: string;
  timeline: string;
  location: string;
  rfqType: 'standard' | 'voice' | 'video';
  isDemo: true;
  disclaimer: string;
  postedBy: string;
  postedDate: string;
  responses: number;
  specifications: Record<string, string>;
  features?: string[];
  urgency: 'Low' | 'Medium' | 'High' | 'Urgent';
  paymentTerms?: string;
  deliveryTerms?: string;
  qualityCertifications?: string[];
  audioUrl?: string;
  videoUrl?: string;
  transcription?: string;
  aiAnalysis?: string;
}

// Indian business hubs for geographic distribution
const BUSINESS_HUBS = [
  { city: 'Mumbai', state: 'Maharashtra', weight: 25 },
  { city: 'Delhi', state: 'Delhi', weight: 20 },
  { city: 'Bangalore', state: 'Karnataka', weight: 15 },
  { city: 'Chennai', state: 'Tamil Nadu', weight: 10 },
  { city: 'Pune', state: 'Maharashtra', weight: 8 },
  { city: 'Kolkata', state: 'West Bengal', weight: 8 },
  { city: 'Ahmedabad', state: 'Gujarat', weight: 7 },
  { city: 'Hyderabad', state: 'Telangana', weight: 7 },
];

const COMPANY_NAMES = [
  'Tata Industries',
  'Reliance Corporation',
  'Mahindra Group',
  'L&T Limited',
  'Wipro Solutions',
  'Infosys Tech',
  'HCL Technologies',
  'Bajaj Holdings',
  'Godrej Industries',
  'Birla Corporation',
  'Jindal Steel',
  'Vedanta Limited',
  'Tech Mahindra',
  'Asian Paints',
  'UltraTech Cement',
  'HDFC Corporation',
];

function getWeightedRandom<T>(items: Array<T & { weight?: number }>): T {
  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= item.weight || 1;
    if (random <= 0) return item;
  }
  return items[0];
}

function getRandomLocation(): string {
  const hub = getWeightedRandom(BUSINESS_HUBS);
  return `${hub.city}, ${hub.state}`;
}

function getRandomCompany(): string {
  return COMPANY_NAMES[Math.floor(Math.random() * COMPANY_NAMES.length)];
}

function getRandomBudget(min: number, max: number): string {
  const budget = Math.floor(Math.random() * (max - min) + min);
  if (budget < 100000) {
    return `₹${(budget / 1000).toFixed(0)}K - ₹${((budget * 1.3) / 1000).toFixed(0)}K`;
  } else {
    return `₹${(budget / 100000).toFixed(1)}L - ₹${((budget * 1.3) / 100000).toFixed(1)}L`;
  }
}

// Generate mock RFQs for all categories
export const generateAllMockRFQs = (): MockRFQ[] => {
  const mockRFQs: MockRFQ[] = [];

  ALL_CATEGORIES.forEach((category, categoryIndex) => {
    const rfqCount = category.trending ? 25 : 20;

    for (let i = 0; i < rfqCount; i++) {
      const rfqType = Math.random() < 0.7 ? 'standard' : Math.random() < 0.8 ? 'voice' : 'video';

      const mockRFQ: MockRFQ = {
        id: `rfq_${category.id}_${String(i + 1).padStart(3, '0')}`,
        category: category.name,
        subcategory:
          category.subcategories[Math.floor(Math.random() * category.subcategories.length)],
        title: `${category.name} - Professional Quality Requirements`,
        description: `Looking for high-quality ${category.name.toLowerCase()} for our business operations. Need reliable supplier with proven track record and competitive pricing.`,
        quantity: `${Math.floor(Math.random() * 1000) + 100} units`,
        budget: getRandomBudget(50000, 1000000),
        timeline: ['7 days', '15 days', '1 month', '2 months'][Math.floor(Math.random() * 4)],
        location: getRandomLocation(),
        rfqType: rfqType,
        isDemo: true,
        disclaimer: '🔍 DEMO CONTENT: This RFQ is created for demonstration purposes.',
        postedBy: `${getRandomCompany()} - Procurement Team`,
        postedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        responses: Math.floor(Math.random() * 25),
        specifications: {
          Quality: 'Premium Grade',
          Certification: 'ISO Certified',
          Warranty: '1 Year',
          Support: '24/7 Technical Support',
        },
        features: ['Quality Assured', 'Competitive Pricing', 'Timely Delivery'],
        urgency: ['Low', 'Medium', 'High', 'Urgent'][Math.floor(Math.random() * 4)] as any,
        paymentTerms: Math.random() > 0.5 ? '30 days credit' : 'Advance payment',
        deliveryTerms: 'FOB destination',
        qualityCertifications: ['ISO 9001', 'CE Marking', 'BIS Certification'],
      };

      if (rfqType === 'voice') {
        mockRFQ.audioUrl = `/api/demo/audio/${mockRFQ.id}.mp3`;
        mockRFQ.transcription = 'Voice recording with detailed requirements...';
        mockRFQ.aiAnalysis = 'AI extracted specifications and requirements.';
      } else if (rfqType === 'video') {
        mockRFQ.videoUrl = `/api/demo/video/${mockRFQ.id}.mp4`;
        mockRFQ.transcription = 'Video showing product requirements and site conditions.';
        mockRFQ.aiAnalysis = 'AI video analysis identified key specifications.';
      }

      mockRFQs.push(mockRFQ);
    }
  });

  return mockRFQs;
};

export const getMockRFQsByCategory = (categoryId: string): MockRFQ[] => {
  const allRFQs = generateAllMockRFQs();
  const category = ALL_CATEGORIES.find(cat => cat.id === categoryId);
  return allRFQs.filter(rfq => rfq.category === category?.name);
};

export const ALL_MOCK_RFQS = generateAllMockRFQs();

// RFQ Statistics
export const getMockRFQStats = () => {
  const allRFQs = ALL_MOCK_RFQS;
  return {
    total: allRFQs.length,
    categories: ALL_CATEGORIES.length,
    voiceRFQs: allRFQs.filter(rfq => rfq.rfqType === 'voice').length,
    videoRFQs: allRFQs.filter(rfq => rfq.rfqType === 'video').length,
    urgentRFQs: allRFQs.filter(rfq => rfq.urgency === 'Urgent').length,
    totalBudget: allRFQs.reduce((sum, rfq) => {
      const budget = rfq.budget.match(/₹([\d.]+)[KL]/);
      if (budget) {
        const value = parseFloat(budget[1]);
        const multiplier = budget[0].includes('L') ? 100000 : 1000;
        return sum + value * multiplier;
      }
      return sum;
    }, 0),
  };
};
