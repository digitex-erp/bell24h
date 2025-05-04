import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

// Type definitions for challenge structure
export interface ChallengeStep {
  id: string;
  title: string;
  description: string;
  interactionType: 'multiple-choice' | 'ranking' | 'matching' | 'simulation' | 'decision' | 'scenario';
  content?: any;
  hint?: string;
  timeLimit?: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'locked' | 'available' | 'completed' | 'in-progress';
  totalPoints: number;
  estimatedTime: number;
  skills: string[];
  prerequisites: string[];
  steps: ChallengeStep[];
}

export interface ChallengeProgress {
  challengeId: string;
  challenge: Challenge;
  startedAt: string;
  completedAt?: string;
  currentStepIndex: number;
  stepProgress: Record<string, any>;
  score?: number;
  totalAttempts: number;
  completedSteps: string[];
}

export interface UserAchievement {
  totalPoints: number;
  completedChallenges: number;
  certificates: string[];
  badges: string[];
  level: number;
  rank?: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  completedChallenges: number;
}

export interface Leaderboard {
  currentUser: {
    rank: number;
    points: number;
    completedChallenges: number;
  };
  topUsers: LeaderboardEntry[];
}

// Context type
export interface ProcurementChallengeContextType {
  challenges: Challenge[];
  activeChallengeId: string | null;
  activeChallengeProgress: ChallengeProgress | null;
  currentStep: ChallengeStep | null;
  stepIndex: number;
  loadChallenges: () => Promise<void>;
  startChallenge: (challengeId: string) => Promise<boolean>;
  submitStepAnswer: (answer: any) => void;
  nextStep: () => void;
  getHint: () => string | null;
  exitChallenge: () => void;
  checkPrerequisites: (challengeId: string) => boolean;
  getUserAchievements: () => UserAchievement;
  getLeaderboard: () => Leaderboard;
}

// Create the context
const ProcurementChallengeContext = createContext<ProcurementChallengeContextType | undefined>(undefined);

// Custom hook to use the context
export const useProcurementChallenges = () => {
  const context = useContext(ProcurementChallengeContext);
  if (!context) {
    throw new Error('useProcurementChallenges must be used within a ProcurementChallengeProvider');
  }
  return context;
};

// Provider component
export const ProcurementChallengeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [activeChallengeProgress, setActiveChallengeProgress] = useState<ChallengeProgress | null>(null);
  const [currentStep, setCurrentStep] = useState<ChallengeStep | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  // Load challenges from API or local data
  const loadChallenges = useCallback(async () => {
    try {
      // In a real implementation, this would be an API call
      // const response = await apiRequest('GET', '/api/procurement-challenges');
      // const data = await response.json();
      // setChallenges(data);
      
      // For now, let's use local data
      setChallenges([
        {
          id: 'supplier-evaluation',
          title: 'Supplier Evaluation Challenge',
          description: 'Learn how to evaluate suppliers based on various criteria and make informed decisions.',
          category: 'supplier-management',
          difficulty: 'beginner',
          status: 'available',
          totalPoints: 1000,
          estimatedTime: 20,
          skills: ['Supplier Evaluation', 'Risk Assessment', 'Decision Making'],
          prerequisites: [],
          steps: [
            {
              id: 'step1',
              title: 'Understanding Supplier Evaluation Criteria',
              description: 'Learn about different criteria used to evaluate suppliers.',
              interactionType: 'multiple-choice',
              content: {
                question: 'Which of the following is NOT typically considered a key criterion in supplier evaluation?',
                options: [
                  { id: 'option1', text: 'Quality of products or services' },
                  { id: 'option2', text: 'Financial stability' },
                  { id: 'option3', text: 'Number of employees' },
                  { id: 'option4', text: 'Delivery performance' }
                ],
                correctOptionId: 'option3'
              },
              hint: 'Think about what directly impacts your business operations when working with a supplier.'
            },
            {
              id: 'step2',
              title: 'Ranking Evaluation Criteria',
              description: 'Learn to prioritize different supplier evaluation criteria based on business needs.',
              interactionType: 'ranking',
              content: {
                question: 'Rank the following supplier evaluation criteria from most important to least important for a manufacturing company with just-in-time production:',
                options: [
                  { id: 'criteria1', name: 'Delivery Reliability', details: 'Consistent on-time delivery' },
                  { id: 'criteria2', name: 'Quality', details: 'Product meets or exceeds specifications' },
                  { id: 'criteria3', name: 'Price', details: 'Competitive pricing' },
                  { id: 'criteria4', name: 'Financial Stability', details: 'Supplier\'s financial health' }
                ],
                idealRanking: ['criteria1', 'criteria2', 'criteria3', 'criteria4']
              },
              hint: 'For just-in-time production, consider what would most severely impact operations if it fails.'
            },
            {
              id: 'step3',
              title: 'Supplier Risk Assessment',
              description: 'Identify different types of supplier risks and appropriate mitigation strategies.',
              interactionType: 'matching',
              content: {
                instructions: 'Match each supplier risk with the most appropriate mitigation strategy.',
                items: [
                  { id: 'risk1', name: 'Single Source Dependency', description: 'Relying on only one supplier' },
                  { id: 'risk2', name: 'Price Volatility', description: 'Unpredictable changes in costs' },
                  { id: 'risk3', name: 'Quality Issues', description: 'Inconsistent product quality' },
                  { id: 'risk4', name: 'Delivery Delays', description: 'Late or missed deliveries' }
                ],
                targets: [
                  { id: 'strategy1', name: 'Multiple Sourcing', description: 'Develop relationships with multiple suppliers' },
                  { id: 'strategy2', name: 'Fixed-Price Contracts', description: 'Lock in prices for a specified period' },
                  { id: 'strategy3', name: 'Quality Certification Requirements', description: 'Require suppliers to maintain certifications' },
                  { id: 'strategy4', name: 'Buffer Inventory', description: 'Maintain safety stock of critical items' }
                ],
                correctPairs: {
                  'risk1': 'strategy1',
                  'risk2': 'strategy2',
                  'risk3': 'strategy3',
                  'risk4': 'strategy4'
                }
              },
              hint: 'Think about which strategy directly addresses the core issue of each risk.'
            }
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
                simulationScenario: {
                  initialState: {
                    budget: 500000,
                    time: 90, // in days
                    quality: 50,
                    costEfficiency: 50,
                    timeEfficiency: 50,
                    riskManagement: 50,
                    scoreWeights: {
                      quality: 0.3,
                      costEfficiency: 0.3,
                      timeEfficiency: 0.2,
                      riskManagement: 0.2
                    }
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
                          feedback: 'The workshop took time to organize but resulted in clear, aligned requirements and identification of potential issues early.',
                          feedbackType: 'success'
                        },
                        {
                          id: 'it-interview',
                          text: 'One-on-one interviews with IT staff only',
                          description: 'Technical focus but may miss business needs',
                          impact: {
                            budget: -2000,
                            time: -7,
                            quality: 5,
                            costEfficiency: 0,
                            timeEfficiency: 5,
                            riskManagement: -5
                          },
                          feedback: 'You collected detailed technical requirements but missed some key business needs, creating potential misalignment.',
                          feedbackType: 'warning'
                        }
                      ]
                    },
                    {
                      id: 'vendor-selection',
                      type: 'decision-point',
                      title: 'Vendor Selection Approach',
                      description: 'How will you approach selecting vendors for the IT infrastructure?',
                      decisions: [
                        {
                          id: 'lowest-bid',
                          text: 'Select the lowest-cost qualified bidder',
                          description: 'Saves money but may compromise on quality',
                          impact: {
                            budget: 100000,
                            time: 0,
                            quality: -20,
                            costEfficiency: 25,
                            timeEfficiency: 0,
                            riskManagement: -15
                          },
                          feedback: 'You saved significantly on upfront costs, but the solution had quality issues that affected operations.',
                          feedbackType: 'error'
                        },
                        {
                          id: 'best-value',
                          text: 'Use a weighted scoring system based on multiple criteria',
                          description: 'Balanced approach considering cost, quality, and risk',
                          impact: {
                            budget: -20000,
                            time: -5,
                            quality: 15,
                            costEfficiency: 10,
                            timeEfficiency: 5,
                            riskManagement: 20
                          },
                          feedback: 'The comprehensive evaluation led to selecting a vendor offering the best overall value, balancing cost and quality.',
                          feedbackType: 'success'
                        },
                        {
                          id: 'premium-solution',
                          text: 'Select the highest-rated technical solution',
                          description: 'Quality focus regardless of cost',
                          impact: {
                            budget: -150000,
                            time: -2,
                            quality: 25,
                            costEfficiency: -25,
                            timeEfficiency: 10,
                            riskManagement: 10
                          },
                          feedback: 'You selected a high-quality solution but exceeded the budget significantly, creating financial strain.',
                          feedbackType: 'warning'
                        }
                      ]
                    },
                    {
                      id: 'risk-management',
                      type: 'decision-point',
                      title: 'Risk Management Strategy',
                      description: 'How will you manage risks during the IT infrastructure implementation?',
                      decisions: [
                        {
                          id: 'pilot-implementation',
                          text: 'Implement a pilot project first',
                          description: 'Test approach with limited scope',
                          impact: {
                            budget: -25000,
                            time: -15,
                            quality: 10,
                            costEfficiency: -5,
                            timeEfficiency: -10,
                            riskManagement: 20
                          },
                          feedback: 'The pilot helped identify and address several issues before full implementation, saving time and resources in the long run.',
                          feedbackType: 'success'
                        },
                        {
                          id: 'phased-approach',
                          text: 'Use a phased implementation approach',
                          description: 'Gradual rollout across the organization',
                          impact: {
                            budget: -10000,
                            time: -10,
                            quality: 15,
                            costEfficiency: 5,
                            timeEfficiency: 5,
                            riskManagement: 15
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
                          feedback: 'The minimal communication left many stakeholders unaware of key details, leading to confusion and resistance.',
                          feedbackType: 'error'
                        },
                        {
                          id: 'department-meetings',
                          text: 'Hold meetings with each department',
                          description: 'Personalized communication',
                          impact: {
                            budget: -5000,
                            time: -7,
                            quality: 10,
                            costEfficiency: -5,
                            timeEfficiency: -5,
                            riskManagement: 15
                          },
                          feedback: 'The personalized approach helped address concerns specific to each department, increasing buy-in and cooperation.',
                          feedbackType: 'success'
                        },
                        {
                          id: 'communication-plan',
                          text: 'Develop a comprehensive communication plan',
                          description: 'Strategic approach to communication',
                          impact: {
                            budget: -10000,
                            time: -5,
                            quality: 15,
                            costEfficiency: -5,
                            timeEfficiency: 0,
                            riskManagement: 20
                          },
                          feedback: 'The strategic communication kept all stakeholders informed and engaged throughout the implementation process.',
                          feedbackType: 'success'
                        }
                      ]
                    }
                  ]
                }
              },
              hint: 'In procurement decision-making, consider the balance between cost, quality, and risk. The lowest upfront cost may not always provide the best long-term value.'
            }
          ]
        }
      ]);
    } catch (error) {
      console.error('Failed to load challenges:', error);
    }
  }, []);

  // Start a challenge
  const startChallenge = useCallback(async (challengeId: string) => {
    try {
      // In a real implementation, this would be an API call to start or retrieve a challenge
      // const response = await apiRequest('POST', `/api/procurement-challenges/${challengeId}/start`);
      // const data = await response.json();
      
      // For now, find the challenge in local data
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) {
        console.error(`Challenge not found: ${challengeId}`);
        return false;
      }
      
      // Create initial progress
      const progress: ChallengeProgress = {
        challengeId,
        challenge,
        startedAt: new Date().toISOString(),
        currentStepIndex: 0,
        stepProgress: {},
        totalAttempts: 1,
        completedSteps: []
      };
      
      setActiveChallengeId(challengeId);
      setActiveChallengeProgress(progress);
      setStepIndex(0);
      setCurrentStep(challenge.steps[0]);
      
      return true;
    } catch (error) {
      console.error('Failed to start challenge:', error);
      return false;
    }
  }, [challenges]);

  // Submit answer for current step
  const submitStepAnswer = useCallback((answer: any) => {
    if (!activeChallengeProgress || !currentStep) return;
    
    // Update progress for current step
    const updatedProgress = { ...activeChallengeProgress };
    updatedProgress.stepProgress[currentStep.id] = {
      answer,
      submittedAt: new Date().toISOString()
    };
    
    // Mark step as completed if not already
    if (!updatedProgress.completedSteps.includes(currentStep.id)) {
      updatedProgress.completedSteps.push(currentStep.id);
    }
    
    setActiveChallengeProgress(updatedProgress);
    
    // In a real implementation, submit to API
    // apiRequest('POST', `/api/procurement-challenges/${activeChallengeId}/steps/${currentStep.id}/submit`, { answer });
  }, [activeChallengeProgress, currentStep, activeChallengeId]);

  // Move to next step
  const nextStep = useCallback(() => {
    if (!activeChallengeProgress || stepIndex >= activeChallengeProgress.challenge.steps.length - 1) return;
    
    const nextIndex = stepIndex + 1;
    const nextStep = activeChallengeProgress.challenge.steps[nextIndex];
    
    // Update progress
    const updatedProgress = { ...activeChallengeProgress, currentStepIndex: nextIndex };
    
    setStepIndex(nextIndex);
    setCurrentStep(nextStep);
    setActiveChallengeProgress(updatedProgress);
  }, [activeChallengeProgress, stepIndex]);

  // Get hint for current step
  const getHint = useCallback(() => {
    if (!currentStep || !currentStep.hint) return null;
    return currentStep.hint;
  }, [currentStep]);

  // Exit current challenge
  const exitChallenge = useCallback(() => {
    setActiveChallengeId(null);
    setActiveChallengeProgress(null);
    setCurrentStep(null);
    setStepIndex(0);
    
    // In a real implementation, notify API
    // if (activeChallengeId) {
    //   apiRequest('POST', `/api/procurement-challenges/${activeChallengeId}/exit`);
    // }
  }, [activeChallengeId]);

  // Check if user has completed prerequisites for a challenge
  const checkPrerequisites = useCallback((challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return false;
    
    // If no prerequisites, return true
    if (!challenge.prerequisites || challenge.prerequisites.length === 0) {
      return true;
    }
    
    // In a real implementation, check user's completed challenges against prerequisites
    // For now, always return true
    return true;
  }, [challenges]);

  // Get user achievements
  const getUserAchievements = useCallback(() => {
    // In a real implementation, fetch from API
    // For now, return mock data
    return {
      totalPoints: 3500,
      completedChallenges: 3,
      certificates: ['Procurement Basics', 'Supplier Management'],
      badges: ['Quick Learner', 'Decision Maker'],
      level: 3
    };
  }, []);

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

  // Get leaderboard data
  const getLeaderboard = useCallback(() => {
    // In a real implementation, fetch from API
    // For now, return mock data
    return getFallbackLeaderboard();
  }, []);

  // Load challenges on mount
  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  // Context value
  const value: ProcurementChallengeContextType = {
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