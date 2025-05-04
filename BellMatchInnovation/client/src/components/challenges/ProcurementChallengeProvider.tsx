import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { apiRequest } from '@/lib/queryClient';

// Challenge difficulty levels
export type ChallengeDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Challenge categories
export type ChallengeCategory = 
  | 'supplier-selection' 
  | 'price-negotiation' 
  | 'risk-assessment'
  | 'contract-management'
  | 'sustainability'
  | 'delivery-optimization';

// Challenge status
export type ChallengeStatus = 'locked' | 'available' | 'in-progress' | 'completed' | 'failed';

// Challenge step type
export interface ChallengeStep {
  id: string;
  title: string;
  description: string;
  // The type of interaction required
  interactionType: 'multiple-choice' | 'ranking' | 'matching' | 'simulation' | 'decision' | 'scenario';
  // Content depends on interactionType
  content: any;
  // Criteria to pass this step
  successCriteria: any;
  // Hint to help user
  hint?: string;
  // Time limit in seconds (0 means no limit)
  timeLimit: number;
  // Points awarded for completing this step
  points: number;
  // Flag for results step
  isResults?: boolean;
}

// Challenge definition
export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  status: ChallengeStatus;
  steps: ChallengeStep[];
  // Points awarded for completing the challenge
  totalPoints: number;
  // Time estimate to complete in minutes
  estimatedTime: number;
  // Skills that will be improved
  skills: string[];
  // Prerequisites (other challenge IDs)
  prerequisites: string[];
  // Completion badge image
  badgeImage?: string;
}

// User challenge progress
export interface ChallengeProgress {
  challengeId: string;
  started: Date;
  completed?: Date;
  currentStepIndex: number;
  stepsCompleted: {
    stepId: string;
    completed: Date;
    points: number;
    attempts: number;
  }[];
  totalScore: number;
  totalSteps: number;
}

// Context type
interface ProcurementChallengeContextType {
  challenges: Challenge[];
  activeChallengeId: string | null;
  activeChallengeProgress: ChallengeProgress | null;
  currentStep: ChallengeStep | null;
  stepIndex: number;
  // Load available challenges
  loadChallenges: () => Promise<void>;
  // Start a challenge
  startChallenge: (challengeId: string) => Promise<void>;
  // Submit an answer for the current step
  submitStepAnswer: (answer: any) => Promise<boolean>;
  // Move to the next step
  nextStep: () => void;
  // Get a hint for the current step
  getHint: () => string | undefined;
  // Exit the current challenge
  exitChallenge: () => void;
  // Check if all prerequisites are met
  checkPrerequisites: (challengeId: string) => boolean;
  // Get user achievements
  getUserAchievements: () => Promise<any>;
  // Get leaderboard
  getLeaderboard: () => Promise<any>;
}

// Create context
const ProcurementChallengeContext = createContext<ProcurementChallengeContextType | null>(null);

// Provider props
interface ProcurementChallengeProviderProps {
  children: ReactNode;
}

// Use custom hook to access context
export const useProcurementChallenge = () => {
  const context = useContext(ProcurementChallengeContext);
  if (!context) {
    throw new Error('useProcurementChallenge must be used within a ProcurementChallengeProvider');
  }
  return context;
};

// Sample challenge data (will be fetched from API in production)
const sampleChallenges: Challenge[] = [
  {
    id: 'procurement-terms-matching',
    title: 'Procurement Terms & Definitions',
    description: 'Match key procurement terms with their correct definitions to build your procurement vocabulary.',
    category: 'contract-management',
    difficulty: 'beginner',
    status: 'available',
    totalPoints: 500,
    estimatedTime: 10,
    skills: ['Procurement Terminology', 'Contract Language', 'Industry Knowledge'],
    prerequisites: [],
    steps: [
      {
        id: 'match-basic-terms',
        title: 'Basic Procurement Terms',
        description: 'Match these fundamental procurement terms with their correct definitions.',
        interactionType: 'matching',
        content: {
          instructions: 'Drag each procurement term on the left to its matching definition on the right.',
          items: [
            {
              id: 'rfp',
              name: 'RFP',
              description: 'Request for Proposal'
            },
            {
              id: 'rfq',
              name: 'RFQ',
              description: 'Request for Quotation'
            },
            {
              id: 'rfi',
              name: 'RFI',
              description: 'Request for Information'
            },
            {
              id: 'sla',
              name: 'SLA',
              description: 'Service Level Agreement'
            },
            {
              id: 'kpi',
              name: 'KPI',
              description: 'Key Performance Indicator'
            }
          ],
          targets: [
            {
              id: 'rfp-def',
              name: 'Formal document soliciting detailed proposals from suppliers',
              description: 'Used for complex purchases requiring customized proposals and evaluation on multiple factors.'
            },
            {
              id: 'rfq-def',
              name: 'Document requesting pricing for specific items or services',
              description: 'Used when price is the primary consideration and specifications are clearly defined.'
            },
            {
              id: 'rfi-def',
              name: 'Preliminary document gathering information from potential suppliers',
              description: 'Used before formal bidding process to collect information about supplier capabilities.'
            },
            {
              id: 'sla-def',
              name: 'Contract specifying performance standards that must be met',
              description: 'Defines measurable metrics, responsibilities, and penalties for service delivery.'
            },
            {
              id: 'kpi-def',
              name: 'Measurable value demonstrating effectiveness in achieving objectives',
              description: 'Used to evaluate supplier performance against specific targets.'
            }
          ]
        },
        successCriteria: {
          correctPairs: {
            'rfp': 'rfp-def',
            'rfq': 'rfq-def',
            'rfi': 'rfi-def',
            'sla': 'sla-def',
            'kpi': 'kpi-def'
          }
        },
        hint: 'Consider what each acronym stands for and match it to the most relevant definition.',
        timeLimit: 180,
        points: 250
      },
      {
        id: 'match-contract-terms',
        title: 'Contract Terminology',
        description: 'Match these contract-related terms with their correct definitions.',
        interactionType: 'matching',
        content: {
          instructions: 'Drag each contract term on the left to its matching definition on the right.',
          items: [
            {
              id: 'force-majeure',
              name: 'Force Majeure',
              description: 'Contract clause'
            },
            {
              id: 'liquidated-damages',
              name: 'Liquidated Damages',
              description: 'Financial compensation'
            },
            {
              id: 'indemnification',
              name: 'Indemnification',
              description: 'Protection clause'
            },
            {
              id: 'termination',
              name: 'Termination Clause',
              description: 'Contract ending'
            },
            {
              id: 'limitation-liability',
              name: 'Limitation of Liability',
              description: 'Risk management clause'
            }
          ],
          targets: [
            {
              id: 'force-majeure-def',
              name: 'Excuses non-performance due to unforeseeable events',
              description: 'Protects parties from obligations when events beyond their control occur (disasters, wars, etc.).'
            },
            {
              id: 'liquidated-damages-def',
              name: 'Predetermined amount for breach of contract',
              description: 'Specific monetary damages agreed upon in advance for failure to meet obligations.'
            },
            {
              id: 'indemnification-def',
              name: 'Agreement to compensate for losses caused by actions',
              description: 'Protects a party from liability for damages caused by the other party.'
            },
            {
              id: 'termination-def',
              name: 'Terms under which contract may be ended',
              description: 'Specifies conditions, notice periods, and consequences for ending the agreement.'
            },
            {
              id: 'limitation-liability-def',
              name: 'Caps potential financial exposure',
              description: 'Limits the amount a party must pay if found liable for damages.'
            }
          ]
        },
        successCriteria: {
          correctPairs: {
            'force-majeure': 'force-majeure-def',
            'liquidated-damages': 'liquidated-damages-def',
            'indemnification': 'indemnification-def',
            'termination': 'termination-def',
            'limitation-liability': 'limitation-liability-def'
          }
        },
        hint: 'Focus on the nature of each term and its primary purpose in a contract.',
        timeLimit: 180,
        points: 250
      }
    ]
  },
  {
    id: 'supplier-selection-101',
    title: 'Supplier Selection Fundamentals',
    description: 'Learn the basics of effective supplier selection through a series of realistic scenarios.',
    category: 'supplier-selection',
    difficulty: 'beginner',
    status: 'available',
    totalPoints: 1000,
    estimatedTime: 15,
    skills: ['Supplier Evaluation', 'Requirement Analysis', 'Decision Making'],
    prerequisites: [],
    steps: [
      {
        id: 'step1',
        title: 'Define Requirements',
        description: 'Identify the correct requirements for procuring office supplies',
        interactionType: 'multiple-choice',
        content: {
          question: 'Which of the following should be included in your requirements for office supplies?',
          options: [
            { id: 'a', text: 'Delivery timeframe, quantity, and quality specifications' },
            { id: 'b', text: 'Only price and brand name' },
            { id: 'c', text: "Supplier's annual revenue and number of employees" },
            { id: 'd', text: 'Marketing materials and promotional offers' }
          ]
        },
        successCriteria: { correctAnswer: 'a' },
        hint: 'Think about what information you need to make an informed purchasing decision.',
        timeLimit: 60,
        points: 200
      },
      {
        id: 'step2',
        title: 'Compare Proposals',
        description: 'Analyze supplier proposals and identify the best candidate',
        interactionType: 'ranking',
        content: {
          question: 'Rank these suppliers from best to worst based on their proposals:',
          options: [
            { 
              id: 'supplier1', 
              name: 'Office Solutions Inc.', 
              details: 'Price: $5,500, Delivery: 3 days, Quality: Standard, Payment terms: Net 30'
            },
            { 
              id: 'supplier2', 
              name: 'Premium Office Supplies', 
              details: 'Price: $7,200, Delivery: 1 day, Quality: Premium, Payment terms: Net 15'
            },
            { 
              id: 'supplier3', 
              name: 'Budget Office', 
              details: 'Price: $4,800, Delivery: 7 days, Quality: Economy, Payment terms: Net 60'
            },
            { 
              id: 'supplier4', 
              name: 'Office Depot Pro', 
              details: 'Price: $6,100, Delivery: 2 days, Quality: High, Payment terms: Net 30'
            }
          ]
        },
        successCriteria: { idealRanking: ['supplier4', 'supplier1', 'supplier2', 'supplier3'] },
        hint: 'Consider the balance between price, delivery time, quality, and payment terms.',
        timeLimit: 120,
        points: 300
      },
      {
        id: 'step3',
        title: 'Evaluate Risk',
        description: 'Identify potential risks with the selected supplier',
        interactionType: 'multiple-choice',
        content: {
          question: 'Which of these is the biggest risk when working with Office Depot Pro?',
          options: [
            { id: 'a', text: 'Higher than average price' },
            { id: 'b', text: 'Lack of industry experience' },
            { id: 'c', text: 'Limited product variety' },
            { id: 'd', text: 'Single point of contact for support' }
          ]
        },
        successCriteria: { correctAnswer: 'a' },
        hint: 'Look at the supplier details and consider what might impact your budget or operations.',
        timeLimit: 60,
        points: 250
      },
      {
        id: 'step4',
        title: 'Negotiate Terms',
        description: 'Select the best negotiation approach',
        interactionType: 'decision',
        content: {
          scenario: 'Office Depot Pro has offered their services, but you want to negotiate better terms. How do you approach this?',
          options: [
            { 
              id: 'a', 
              text: "Demand a 20% price reduction or you'll go elsewhere", 
              outcome: 'The supplier is unwilling to make such a large price cut and negotiations break down.'
            },
            { 
              id: 'b', 
              text: 'Accept their offer as-is to maintain good relations', 
              outcome: 'You secure the supplies but miss an opportunity to optimize terms.'
            },
            { 
              id: 'c', 
              text: 'Request a 5% discount in exchange for faster payment terms', 
              outcome: 'The supplier agrees to a 4% discount for payment within 15 days.'
            },
            { 
              id: 'd', 
              text: 'Ask for free expedited shipping on all orders', 
              outcome: 'The supplier agrees to free expedited shipping on orders over $1,000.'
            }
          ]
        },
        successCriteria: { bestChoices: ['c', 'd'] },
        hint: 'Consider what creates a win-win situation where both parties benefit.',
        timeLimit: 90,
        points: 250
      }
    ]
  },
  {
    id: 'contract-negotiation-basics',
    title: 'Contract Negotiation Essentials',
    description: 'Master the fundamentals of effective contract negotiation',
    category: 'contract-management',
    difficulty: 'intermediate',
    status: 'locked',
    totalPoints: 1500,
    estimatedTime: 20,
    skills: ['Contract Terms', 'Negotiation', 'Legal Awareness'],
    prerequisites: ['supplier-selection-101'],
    steps: [
      // Steps would be defined here similar to the first challenge
      {
        id: 'step1',
        title: 'Contract Element Identification',
        description: 'Identify essential elements of a procurement contract',
        interactionType: 'multiple-choice',
        content: {
          question: 'Which of these is NOT typically included in a procurement contract?',
          options: [
            { id: 'a', text: 'Payment terms and conditions' },
            { id: 'b', text: 'Delivery schedule and requirements' },
            { id: 'c', text: "Supplier's internal hiring policies" },
            { id: 'd', text: 'Termination clauses' }
          ]
        },
        successCriteria: { correctAnswer: 'c' },
        hint: 'Focus on elements that directly impact the business relationship between buyer and supplier.',
        timeLimit: 60,
        points: 300
      },
      // More steps would be added
    ]
  },
  {
    id: 'it-procurement-simulation',
    title: 'IT Infrastructure Procurement Challenge',
    description: 'Manage a complete IT infrastructure procurement project with budget constraints and stakeholder requirements.',
    category: 'risk-assessment',
    difficulty: 'advanced',
    status: 'available',
    totalPoints: 2000,
    estimatedTime: 30,
    skills: ['Budget Management', 'Stakeholder Communication', 'Tech Evaluation', 'Risk Assessment'],
    prerequisites: [],
    steps: [
      {
        id: 'simulation-step1',
        title: 'IT Infrastructure Procurement',
        description: 'You are the procurement manager tasked with acquiring new IT infrastructure for your company. Navigate the procurement process while balancing cost, quality, and time constraints.',
        interactionType: 'simulation',
        content: {
          initialBudget: 500000,
          initialTime: 90, // in days
          scoreWeights: {
            quality: 0.3,
            costEfficiency: 0.3,
            timeEfficiency: 0.2,
            riskManagement: 0.2
          },
          stages: [
            {
              id: 'requirement-gathering',
              type: 'decision-point',
              title: 'Requirements Gathering',
              description: 'How will you approach gathering requirements from the IT department and business stakeholders?',
              decisions: [
                {
                  id: 'quick-survey',
                  text: 'Send a quick email survey to department heads',
                  description: 'Fast but may miss critical requirements',
                  impact: {
                    budget: 0,
                    time: -5,
                    quality: -15,
                    costEfficiency: 5,
                    timeEfficiency: 15,
                    riskManagement: -10
                  },
                  feedback: 'You got responses quickly, but many were incomplete or lacked sufficient detail, which may lead to problems later.',
                  feedbackType: 'warning'
                },
                {
                  id: 'stakeholder-workshop',
                  text: 'Organize a stakeholder workshop',
                  description: 'Takes more time but creates alignment',
                  impact: {
                    budget: -5000,
                    time: -10,
                    quality: 20,
                    costEfficiency: -5,
                    timeEfficiency: -5,
                    riskManagement: 15
                  },
                  feedback: 'The workshop was successful in getting detailed requirements and building consensus among stakeholders.',
                  feedbackType: 'success'
                },
                {
                  id: 'consultant-hire',
                  text: 'Hire an external consultant to conduct needs assessment',
                  description: 'Expensive but professional',
                  impact: {
                    budget: -25000,
                    time: -5,
                    quality: 25,
                    costEfficiency: -15,
                    timeEfficiency: 10,
                    riskManagement: 20
                  },
                  feedback: 'The consultant delivered a comprehensive requirements document, though at a significant cost.',
                  feedbackType: 'success'
                },
                {
                  id: 'previous-only',
                  text: 'Use the previous infrastructure specifications as a baseline',
                  description: 'Quick but may not address new needs',
                  impact: {
                    budget: 0,
                    time: -2,
                    quality: -10,
                    costEfficiency: 10,
                    timeEfficiency: 20,
                    riskManagement: -15
                  },
                  feedback: 'This approach saved time, but you missed several critical new requirements from the business.',
                  feedbackType: 'error'
                }
              ]
            },
            {
              id: 'budget-allocation',
              type: 'resource-allocation',
              title: 'Budget Allocation',
              description: 'How will you allocate your budget across different components of the IT infrastructure?',
              resources: [
                {
                  id: 'servers',
                  name: 'Server Infrastructure',
                  type: 'budget',
                  options: [
                    { id: 'servers-low', value: 150000, label: 'Basic (minimum specs)' },
                    { id: 'servers-medium', value: 200000, label: 'Standard (recommended specs)' },
                    { id: 'servers-high', value: 250000, label: 'Premium (high performance)' }
                  ]
                },
                {
                  id: 'networking',
                  name: 'Network Equipment',
                  type: 'budget',
                  options: [
                    { id: 'networking-low', value: 50000, label: 'Basic connectivity' },
                    { id: 'networking-medium', value: 100000, label: 'Standard with redundancy' },
                    { id: 'networking-high', value: 150000, label: 'High performance' }
                  ]
                },
                {
                  id: 'implementation',
                  name: 'Implementation Timeline',
                  type: 'time',
                  options: [
                    { id: 'implementation-fast', value: 30, label: 'Accelerated (higher risk)' },
                    { id: 'implementation-standard', value: 45, label: 'Standard timeline' },
                    { id: 'implementation-extended', value: 60, label: 'Extended (thorough testing)' }
                  ]
                }
              ]
            },
            {
              id: 'supplier-selection',
              type: 'supplier-selection',
              title: 'Vendor Selection',
              description: 'Select a primary vendor for your IT infrastructure procurement:',
              attributes: [
                { id: 'cost', name: 'Total Cost' },
                { id: 'reliability', name: 'Reliability Score' },
                { id: 'support', name: 'Support SLA' },
                { id: 'delivery', name: 'Delivery Time' },
                { id: 'experience', name: 'Industry Experience' }
              ],
              suppliers: [
                {
                  id: 'tech-systems',
                  name: 'Tech Systems Inc.',
                  attributes: {
                    cost: '$420,000',
                    reliability: '85%',
                    support: '24/7, 4hr response',
                    delivery: '40 days',
                    experience: '15 years'
                  },
                  impact: {
                    budget: -420000,
                    time: -40,
                    quality: 25,
                    costEfficiency: 15,
                    timeEfficiency: 20,
                    riskManagement: 25
                  }
                },
                {
                  id: 'value-it',
                  name: 'Value IT Solutions',
                  attributes: {
                    cost: '$350,000',
                    reliability: '72%',
                    support: '8/5, next day',
                    delivery: '30 days',
                    experience: '5 years'
                  },
                  impact: {
                    budget: -350000,
                    time: -30,
                    quality: 10,
                    costEfficiency: 30,
                    timeEfficiency: 30,
                    riskManagement: 5
                  }
                },
                {
                  id: 'premium-tech',
                  name: 'Premium Tech Group',
                  attributes: {
                    cost: '$520,000',
                    reliability: '95%',
                    support: '24/7, 2hr response',
                    delivery: '45 days',
                    experience: '20 years'
                  },
                  impact: {
                    budget: -520000,
                    time: -45,
                    quality: 35,
                    costEfficiency: -5,
                    timeEfficiency: 10,
                    riskManagement: 35
                  }
                },
                {
                  id: 'agile-infra',
                  name: 'Agile Infrastructure',
                  attributes: {
                    cost: '$400,000',
                    reliability: '80%',
                    support: '24/7, 8hr response',
                    delivery: '25 days',
                    experience: '8 years'
                  },
                  impact: {
                    budget: -400000,
                    time: -25,
                    quality: 20,
                    costEfficiency: 20,
                    timeEfficiency: 35,
                    riskManagement: 15
                  }
                }
              ]
            },
            {
              id: 'risk-mitigation',
              type: 'decision-point',
              title: 'Risk Mitigation Strategy',
              description: 'Choose a strategy to address the potential risks in your IT procurement:',
              decisions: [
                {
                  id: 'extensive-testing',
                  text: 'Implement extensive pre-deployment testing',
                  description: 'Reduces risk but adds time',
                  impact: {
                    budget: -15000,
                    time: -15,
                    quality: 20,
                    costEfficiency: -5,
                    timeEfficiency: -15,
                    riskManagement: 25
                  },
                  feedback: 'The testing revealed several issues that were fixed before deployment, preventing potential disruptions.',
                  feedbackType: 'success'
                },
                {
                  id: 'phased-rollout',
                  text: 'Plan a phased rollout with pilot groups',
                  description: 'Balanced approach',
                  impact: {
                    budget: -5000,
                    time: -10,
                    quality: 15,
                    costEfficiency: 0,
                    timeEfficiency: -5,
                    riskManagement: 20
                  },
                  feedback: 'The phased approach allowed you to identify and fix issues early while maintaining business continuity.',
                  feedbackType: 'success'
                },
                {
                  id: 'contingency-budget',
                  text: 'Set aside a contingency budget',
                  description: 'Financial safety net',
                  impact: {
                    budget: -50000,
                    time: 0,
                    quality: 5,
                    costEfficiency: -10,
                    timeEfficiency: 5,
                    riskManagement: 15
                  },
                  feedback: 'You had funds available to quickly address issues as they arose.',
                  feedbackType: 'success'
                },
                {
                  id: 'no-special-measures',
                  text: 'Proceed without special risk measures',
                  description: 'Saves money but increases risk',
                  impact: {
                    budget: 0,
                    time: 0,
                    quality: -10,
                    costEfficiency: 10,
                    timeEfficiency: 10,
                    riskManagement: -25
                  },
                  feedback: 'You encountered several issues during implementation that caused disruptions and required emergency fixes.',
                  feedbackType: 'error'
                }
              ]
            },
            {
              id: 'stakeholder-communication',
              type: 'decision-point',
              title: 'Stakeholder Communication',
              description: 'How will you communicate the implementation plan to stakeholders?',
              decisions: [
                {
                  id: 'executive-summary',
                  text: 'Send an executive summary email',
                  description: 'Quick but minimal detail',
                  impact: {
                    budget: 0,
                    time: -1,
                    quality: -5,
                    costEfficiency: 5,
                    timeEfficiency: 5,
                    riskManagement: -10
                  },
                  feedback: 'Some stakeholders complained about not receiving enough detail, creating confusion later.',
                  feedbackType: 'warning'
                },
                {
                  id: 'department-meetings',
                  text: 'Hold meetings with each department',
                  description: 'Time-consuming but thorough',
                  impact: {
                    budget: -2000,
                    time: -5,
                    quality: 15,
                    costEfficiency: -5,
                    timeEfficiency: -10,
                    riskManagement: 20
                  },
                  feedback: 'The meetings were well-received and helped create buy-in from all departments.',
                  feedbackType: 'success'
                },
                {
                  id: 'detailed-documentation',
                  text: 'Provide detailed documentation with training',
                  description: 'Comprehensive but resource-intensive',
                  impact: {
                    budget: -10000,
                    time: -7,
                    quality: 20,
                    costEfficiency: -10,
                    timeEfficiency: -5,
                    riskManagement: 25
                  },
                  feedback: 'Stakeholders appreciated the detailed information, and the training sessions improved overall acceptance.',
                  feedbackType: 'success'
                },
                {
                  id: 'project-portal',
                  text: 'Create an online project portal with updates',
                  description: 'Modern and accessible approach',
                  impact: {
                    budget: -5000,
                    time: -3,
                    quality: 10,
                    costEfficiency: 0,
                    timeEfficiency: 0,
                    riskManagement: 15
                  },
                  feedback: 'The portal was well-used and provided a single source of truth for the project.',
                  feedbackType: 'success'
                }
              ]
            }
          ]
        },
        successCriteria: {
          minScore: 60,
          criticalMetrics: {
            quality: 20,
            riskManagement: 15
          }
        },
        hint: 'Consider the long-term impact of your decisions rather than just immediate costs or time savings.',
        timeLimit: 0,
        points: 2000
      }
    ]
  }
];

// Provider component
export const ProcurementChallengeProvider: React.FC<ProcurementChallengeProviderProps> = ({ children }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [activeChallengeProgress, setActiveChallengeProgress] = useState<ChallengeProgress | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  // Compute the current step based on the active challenge and step index
  const currentStep = useMemo(() => {
    if (!activeChallengeId || challenges.length === 0) return null;
    
    const challenge = challenges.find(c => c.id === activeChallengeId);
    if (!challenge || !challenge.steps || !Array.isArray(challenge.steps)) return null;
    
    // Handle possible invalid index or missing steps array
    if (stepIndex < 0 || stepIndex >= challenge.steps.length) return null;
    
    return challenge.steps[stepIndex] || null;
  }, [activeChallengeId, challenges, stepIndex]);

  // Load challenges from API
  const loadChallenges = async (): Promise<void> => {
    try {
      const response = await apiRequest('GET', '/api/procurement/challenges');
      if (response.ok) {
        const data = await response.json();
        setChallenges(data);
      } else {
        // Fallback to sample data if API fails
        console.warn('Falling back to sample challenge data');
        setChallenges(sampleChallenges);
      }
    } catch (error) {
      console.error('Failed to load challenges:', error);
      // Fallback to sample data
      setChallenges(sampleChallenges);
    }
  };

  // Start a challenge
  const startChallenge = async (challengeId: string): Promise<void> => {
    try {
      const challenge = challenges.find(c => c.id === challengeId);
      
      if (!challenge) {
        throw new Error(`Challenge ${challengeId} not found`);
      }
      
      if (challenge.status === 'locked') {
        throw new Error('This challenge is locked. Complete prerequisites first.');
      }
      
      try {
        // Call API to start the challenge
        const response = await apiRequest('POST', `/api/procurement/challenges/${challengeId}/start`);
        
        if (response.ok) {
          const progressData = await response.json();
          
          const challenge = challenges.find(c => c.id === challengeId);
          // Create a new progress record
          const newProgress: ChallengeProgress = {
            challengeId,
            started: new Date(progressData.started),
            currentStepIndex: progressData.currentStepIndex || 0,
            stepsCompleted: progressData.stepsCompleted || [],
            totalScore: progressData.totalScore || 0,
            totalSteps: challenge?.steps.length || 0
          };
          
          setActiveChallengeId(challengeId);
          setActiveChallengeProgress(newProgress);
          setStepIndex(newProgress.currentStepIndex);
          
          // Update challenge status to in-progress
          setChallenges(prev => 
            prev.map(c => 
              c.id === challengeId ? { ...c, status: 'in-progress' as ChallengeStatus } : c
            )
          );
        } else {
          // Fallback to local implementation if API fails
          fallbackStartChallenge(challengeId);
        }
      } catch (error) {
        console.warn('Failed to connect to API, using local implementation:', error);
        fallbackStartChallenge(challengeId);
      }
    } catch (error) {
      console.error('Failed to start challenge:', error);
      throw error;
    }
  };
  
  // Fallback local implementation for starting a challenge
  const fallbackStartChallenge = (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    
    // Create a new progress record
    const newProgress: ChallengeProgress = {
      challengeId,
      started: new Date(),
      currentStepIndex: 0,
      stepsCompleted: [],
      totalScore: 0,
      totalSteps: challenge?.steps.length || 0
    };
    
    setActiveChallengeId(challengeId);
    setActiveChallengeProgress(newProgress);
    setStepIndex(0);
    
    // Update challenge status to in-progress
    setChallenges(prev => 
      prev.map(c => 
        c.id === challengeId ? { ...c, status: 'in-progress' as ChallengeStatus } : c
      )
    );
  };

  // Submit an answer for the current step
  const submitStepAnswer = async (answer: any): Promise<boolean> => {
    if (!activeChallengeId || !currentStep || !activeChallengeProgress) {
      throw new Error('No active challenge or step');
    }
    
    try {
      // Try to submit answer to the API
      try {
        const response = await apiRequest(
          'POST',
          `/api/procurement/challenges/${activeChallengeId}/steps/${currentStep.id}/submit`, 
          { answer }
        );
        
        if (response.ok) {
          // Process API response
          const { success, points } = await response.json();
          
          // Update progress if successful
          if (success) {
            const newStepCompleted = {
              stepId: currentStep.id,
              completed: new Date(),
              points,
              attempts: 1
            };
            
            const newProgress = {
              ...activeChallengeProgress,
              stepsCompleted: [...activeChallengeProgress.stepsCompleted, newStepCompleted],
              totalScore: activeChallengeProgress.totalScore + points
            };
            
            setActiveChallengeProgress(newProgress);
          }
          
          return success;
        } else {
          // Fall back to local evaluation if API fails
          console.warn('API returned error, falling back to local evaluation');
          return fallbackSubmitStepAnswer(answer);
        }
      } catch (apiError) {
        // Fall back to local evaluation if API call fails
        console.warn('API call failed, falling back to local evaluation:', apiError);
        return fallbackSubmitStepAnswer(answer);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      return false;
    }
  };
  
  // Fallback local implementation for evaluating step answers
  const fallbackSubmitStepAnswer = (answer: any): boolean => {
    if (!currentStep || !activeChallengeProgress) return false;
    
    let success = false;
    let points = 0;
    
    // Different evaluation based on interaction type
    if (currentStep.interactionType === 'multiple-choice') {
      success = answer === currentStep.successCriteria.correctAnswer;
      points = success ? currentStep.points : 0;
    } else if (currentStep.interactionType === 'ranking') {
      // Check if ranking matches the ideal ranking
      const idealRanking = currentStep.successCriteria.idealRanking;
      // Simple check - in reality would use more sophisticated scoring
      const matchCount = answer.filter((item: string, index: number) => item === idealRanking[index]).length;
      const percentMatch = matchCount / idealRanking.length;
      
      // Success if at least 75% correct
      success = percentMatch >= 0.75;
      // Points proportional to match percentage
      points = Math.round(currentStep.points * percentMatch);
    } else if (currentStep.interactionType === 'decision') {
      // Check if decision is among the best choices
      success = currentStep.successCriteria.bestChoices.includes(answer);
      points = success ? currentStep.points : 0;
    } else if (currentStep.interactionType === 'matching') {
      // Check if matching pairs are correct
      const correctPairs = currentStep.successCriteria.correctPairs;
      const matchCount = Object.entries(answer).filter(
        ([key, value]) => correctPairs[key] === value
      ).length;
      const percentMatch = matchCount / Object.keys(correctPairs).length;
      
      // Success if at least 80% correct
      success = percentMatch >= 0.8;
      // Points proportional to match percentage
      points = Math.round(currentStep.points * percentMatch);
    } else if (currentStep.interactionType === 'simulation') {
      // For simulation, evaluate the final scores against success criteria
      if (typeof answer === 'object' && answer.scores) {
        const { scores } = answer;
        const { minScore, criticalMetrics } = currentStep.successCriteria;
        
        // Check if total score meets minimum requirement
        const totalScore = scores.total;
        const scorePercentage = totalScore / 100;
        const scoreSuccess = scorePercentage >= (minScore / 100);
        
        // Check if critical metrics meet their minimum requirements
        let criticalSuccess = true;
        if (criticalMetrics) {
          Object.keys(criticalMetrics).forEach(metric => {
            const requiredValue = criticalMetrics[metric];
            const actualValue = answer.metrics[metric] || 0;
            if (actualValue < requiredValue) {
              criticalSuccess = false;
            }
          });
        }
        
        // Overall success requires both score and critical metrics to pass
        success = scoreSuccess && criticalSuccess;
        
        // Points are proportional to the total score achieved
        points = Math.round(currentStep.points * (scorePercentage));
        
        // Cap points at the maximum available
        points = Math.min(points, currentStep.points);
      } else {
        // Invalid answer format
        success = false;
        points = 0;
      }
    }
    
    // Update progress
    if (success) {
      const newStepCompleted = {
        stepId: currentStep.id,
        completed: new Date(),
        points,
        attempts: 1
      };
      
      const newProgress = {
        ...activeChallengeProgress,
        stepsCompleted: [...activeChallengeProgress.stepsCompleted, newStepCompleted],
        totalScore: activeChallengeProgress.totalScore + points
      };
      
      setActiveChallengeProgress(newProgress);
    }
    
    return success;
  };

  // Move to the next step
  const nextStep = () => {
    if (!activeChallengeId || !activeChallengeProgress) return;
    
    const challenge = challenges.find(c => c.id === activeChallengeId);
    if (!challenge) return;
    
    const nextIndex = stepIndex + 1;
    
    // If we've reached the end of the challenge
    if (nextIndex >= challenge.steps.length) {
      // Mark challenge as completed
      const completedProgress = {
        ...activeChallengeProgress,
        completed: new Date(),
        currentStepIndex: challenge.steps.length
      };
      
      setActiveChallengeProgress(completedProgress);
      
      // Update challenge status
      setChallenges(prev => 
        prev.map(c => 
          c.id === activeChallengeId ? { ...c, status: 'completed' as ChallengeStatus } : c
        )
      );
      
      // Try to complete the challenge via API
      try {
        apiRequest('POST', `/api/procurement/challenges/${activeChallengeId}/complete`, completedProgress)
          .then(response => {
            if (!response.ok) {
              console.warn('Failed to record challenge completion on server');
            }
          })
          .catch(error => {
            console.warn('API error when completing challenge:', error);
          });
      } catch (error) {
        console.warn('Error calling completion API:', error);
      }
      
      // Clear active challenge after a delay to show completion screen
      setTimeout(() => {
        setActiveChallengeId(null);
        setActiveChallengeProgress(null);
        setStepIndex(0);
      }, 3000);
    } else {
      // Move to the next step
      setStepIndex(nextIndex);
      
      const newProgress = {
        ...activeChallengeProgress,
        currentStepIndex: nextIndex
      };
      
      setActiveChallengeProgress(newProgress);
    }
  };

  // Get a hint for the current step
  const getHint = (): string | undefined => {
    return currentStep?.hint;
  };

  // Exit the current challenge
  const exitChallenge = () => {
    // In a real implementation, would call API to save progress
    // if (activeChallengeId && activeChallengeProgress) {
    //   apiRequest('POST', `/api/procurement/challenges/${activeChallengeId}/exit`, activeChallengeProgress);
    // }
    
    setActiveChallengeId(null);
    setActiveChallengeProgress(null);
    setStepIndex(0);
  };

  // Check if all prerequisites are met for a challenge
  const checkPrerequisites = (challengeId: string): boolean => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return false;
    
    // If no prerequisites, always return true
    if (!challenge.prerequisites || challenge.prerequisites.length === 0) {
      return true;
    }
    
    // Check if all prerequisite challenges are completed
    return challenge.prerequisites.every(prereqId => {
      const prereq = challenges.find(c => c.id === prereqId);
      return prereq && prereq.status === 'completed';
    });
  };

  // Get user achievements
  const getUserAchievements = async (): Promise<any> => {
    try {
      // Try to get achievements from API
      try {
        const response = await apiRequest('GET', '/api/procurement/user/achievements');
        
        if (response.ok) {
          return await response.json();
        } else {
          console.warn('Failed to fetch achievements from API, using local data');
          return getFallbackAchievements();
        }
      } catch (apiError) {
        console.warn('API error when fetching achievements:', apiError);
        return getFallbackAchievements();
      }
    } catch (error) {
      console.error('Failed to get achievements:', error);
      return { totalPoints: 0, completedChallenges: 0, badges: [] };
    }
  };
  
  // Fallback implementation for achievements
  const getFallbackAchievements = () => {
    const completedChallenges = challenges.filter(c => c.status === 'completed');
    const totalPoints = completedChallenges.reduce((sum, c) => sum + c.totalPoints, 0);
    
    return {
      totalPoints,
      completedChallenges: completedChallenges.length,
      badges: completedChallenges.map(c => ({
        id: `badge-${c.id}`,
        name: `${c.title} Badge`,
        image: c.badgeImage || '/images/default-badge.png',
        earnedOn: new Date().toISOString()
      }))
    };
  };

  // Get leaderboard
  const getLeaderboard = async (): Promise<any> => {
    try {
      // Try to get leaderboard from API
      try {
        const response = await apiRequest('GET', '/api/procurement/leaderboard');
        
        if (response.ok) {
          return await response.json();
        } else {
          console.warn('Failed to fetch leaderboard from API, using local data');
          return getFallbackLeaderboard();
        }
      } catch (apiError) {
        console.warn('API error when fetching leaderboard:', apiError);
        return getFallbackLeaderboard();
      }
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      return { currentUser: { rank: 0, points: 0 }, topUsers: [] };
    }
  };
  
  // Fallback implementation for leaderboard
  const getFallbackLeaderboard = () => {
    return {
      currentUser: {
        rank: 4,
        points: 2500,
        completedChallenges: 2
      },
      topUsers: [
        { id: 'user1', name: 'Procurement Pro', points: 5200, completedChallenges: 5 },
        { id: 'user2', name: 'Supply Chain Master', points: 4800, completedChallenges: 4 },
        { id: 'user3', name: 'Negotiation Expert', points: 3500, completedChallenges: 3 },
        { id: 'user4', name: 'Current User', points: 2500, completedChallenges: 2 },
        { id: 'user5', name: 'Procurement Novice', points: 1200, completedChallenges: 1 }
      ]
    };
  };

  // Load challenges on mount
  useEffect(() => {
    loadChallenges();
  }, []);

  // Context value
  const value = {
    challenges,
    activeChallengeId,
    activeChallengeProgress,
    currentStep,
    stepIndex,
    loadChallenges,
    startChallenge,
    submitStepAnswer,
    nextStep,
    getHint,
    exitChallenge,
    checkPrerequisites,
    getUserAchievements,
    getLeaderboard
  };

  return (
    <ProcurementChallengeContext.Provider value={value}>
      {children}
    </ProcurementChallengeContext.Provider>
  );
};

export default ProcurementChallengeProvider;