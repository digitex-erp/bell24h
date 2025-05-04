import { Request, Response } from 'express';
import { storage } from '../storage';

// Sample challenge data that would normally come from the database
import { challengeData } from '../data/procurement-challenges';

/**
 * Get all available procurement challenges
 */
export const getChallenges = async (req: Request, res: Response) => {
  try {
    // In a real implementation, we'd fetch from the database
    // const challenges = await storage.getProcurementChallenges();
    
    // Using sample data for now
    res.json(challengeData.challenges);
  } catch (error) {
    console.error('Error fetching procurement challenges:', error);
    res.status(500).json({ message: 'Failed to fetch procurement challenges' });
  }
};

/**
 * Get a specific challenge by ID
 */
export const getChallengeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, we'd fetch from the database
    // const challenge = await storage.getProcurementChallengeById(id);
    
    // Using sample data for now
    const challenge = challengeData.challenges.find(c => c.id === id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    res.json(challenge);
  } catch (error) {
    console.error(`Error fetching procurement challenge ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to fetch procurement challenge' });
  }
};

/**
 * Start a challenge for the current user
 */
export const startChallenge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // In a real implementation, we'd get the user ID from the authenticated session
    const userId = req.user?.id || 'sample-user-id';
    
    // In a real implementation, we'd fetch the challenge from the database
    // const challenge = await storage.getProcurementChallengeById(id);
    
    // Using sample data for now
    const challenge = challengeData.challenges.find(c => c.id === id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    // Check prerequisites
    if (challenge.status === 'locked') {
      // In a real implementation, we'd check if prerequisites are met
      // const prerequisitesMet = await storage.checkChallengePrerequisites(userId, id);
      // if (!prerequisitesMet) {
      //   return res.status(403).json({ message: 'Challenge prerequisites not met' });
      // }
    }
    
    // Create a progress record
    const progress = {
      challengeId: id,
      userId,
      started: new Date(),
      currentStepIndex: 0,
      stepsCompleted: [],
      totalScore: 0
    };
    
    // In a real implementation, we'd store in the database
    // await storage.createChallengeProgress(progress);
    
    res.status(201).json(progress);
  } catch (error) {
    console.error(`Error starting procurement challenge ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to start procurement challenge' });
  }
};

/**
 * Submit an answer for a challenge step
 */
export const submitStepAnswer = async (req: Request, res: Response) => {
  try {
    const { challengeId, stepId } = req.params;
    const { answer } = req.body;
    
    // In a real implementation, we'd get the user ID from the authenticated session
    const userId = req.user?.id || 'sample-user-id';
    
    // In a real implementation, we'd fetch from the database
    // const challenge = await storage.getProcurementChallengeById(challengeId);
    // const userProgress = await storage.getChallengeProgress(userId, challengeId);
    
    // Using sample data for now
    const challenge = challengeData.challenges.find(c => c.id === challengeId);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    const step = challenge.steps.find(s => s.id === stepId);
    
    if (!step) {
      return res.status(404).json({ message: 'Step not found' });
    }
    
    // Evaluate the answer based on step type
    let success = false;
    let points = 0;
    
    if (step.interactionType === 'multiple-choice') {
      success = answer === step.successCriteria.correctAnswer;
      points = success ? step.points : 0;
    } else if (step.interactionType === 'ranking') {
      // Check if ranking matches the ideal ranking
      const idealRanking = step.successCriteria.idealRanking;
      const matchCount = answer.filter((item: string, index: number) => item === idealRanking[index]).length;
      const percentMatch = matchCount / idealRanking.length;
      
      // Success if at least 75% correct
      success = percentMatch >= 0.75;
      // Points proportional to match percentage
      points = Math.round(step.points * percentMatch);
    } else if (step.interactionType === 'decision') {
      // Check if decision is among the best choices
      success = step.successCriteria.bestChoices.includes(answer);
      points = success ? step.points : 0;
    } else if (step.interactionType === 'matching') {
      // Check if matched pairs are correct
      const correctPairs = step.successCriteria.correctPairs;
      const matchCount = Object.entries(answer).filter(
        ([key, value]) => correctPairs[key] === value
      ).length;
      const percentMatch = matchCount / Object.keys(correctPairs).length;
      
      // Success if at least 80% correct
      success = percentMatch >= 0.8;
      // Points proportional to match percentage
      points = Math.round(step.points * percentMatch);
    } else if (step.interactionType === 'simulation') {
      // For simulation, we'd need custom evaluation logic
      // This would typically involve more complex scoring based on multiple factors
      const score = evaluateSimulation(step, answer);
      success = score.success;
      points = score.points;
    }
    
    // Create a completed step record
    const completedStep = {
      stepId,
      completed: new Date(),
      points,
      attempts: 1, // Would track actual attempts in a real implementation
      success
    };
    
    // In a real implementation, we'd update in the database
    // await storage.updateChallengeProgress(userId, challengeId, completedStep);
    
    res.json({ success, points });
  } catch (error) {
    console.error(`Error submitting answer for step ${req.params.stepId}:`, error);
    res.status(500).json({ message: 'Failed to submit answer' });
  }
};

/**
 * Complete a challenge
 */
export const completeChallenge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, we'd get the user ID from the authenticated session
    const userId = req.user?.id || 'sample-user-id';
    
    // In a real implementation, we'd fetch from the database and update
    // const progress = await storage.getChallengeProgress(userId, id);
    // await storage.completeChallenge(userId, id, progress.totalScore);
    
    // Using sample data for now
    const completedProgress = {
      challengeId: id,
      userId,
      completed: new Date(),
      totalScore: 1000 // Sample score
    };
    
    res.json(completedProgress);
  } catch (error) {
    console.error(`Error completing procurement challenge ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to complete procurement challenge' });
  }
};

/**
 * Get user's challenge progress
 */
export const getUserChallengeProgress = async (req: Request, res: Response) => {
  try {
    // In a real implementation, we'd get the user ID from the authenticated session
    const userId = req.user?.id || 'sample-user-id';
    
    // In a real implementation, we'd fetch from the database
    // const progress = await storage.getUserChallengeProgress(userId);
    
    // Using sample data for now
    const progress = [
      {
        challengeId: 'supplier-selection-101',
        completed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        totalScore: 850
      }
    ];
    
    res.json(progress);
  } catch (error) {
    console.error('Error fetching user challenge progress:', error);
    res.status(500).json({ message: 'Failed to fetch user challenge progress' });
  }
};

/**
 * Get user's achievements
 */
export const getUserAchievements = async (req: Request, res: Response) => {
  try {
    // In a real implementation, we'd get the user ID from the authenticated session
    const userId = req.user?.id || 'sample-user-id';
    
    // In a real implementation, we'd fetch from the database
    // const achievements = await storage.getUserAchievements(userId);
    
    // Using sample data for now
    const achievements = {
      totalPoints: 850,
      completedChallenges: 1,
      badges: [
        {
          id: 'supplier-selection-basic',
          name: 'Supplier Selection Specialist',
          image: '/badges/supplier-selection.svg',
          earnedOn: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    };
    
    res.json(achievements);
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    res.status(500).json({ message: 'Failed to fetch user achievements' });
  }
};

/**
 * Get procurement challenge leaderboard
 */
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    // In a real implementation, we'd get the user ID from the authenticated session
    const userId = req.user?.id || 'sample-user-id';
    
    // In a real implementation, we'd fetch from the database
    // const leaderboard = await storage.getProcurementLeaderboard();
    // const userRank = await storage.getUserLeaderboardRank(userId);
    
    // Using sample data for now
    const leaderboard = {
      topUsers: [
        { id: 'user1', name: 'Ajay Sharma', points: 3200, completedChallenges: 8 },
        { id: 'user2', name: 'Maya Patel', points: 2950, completedChallenges: 7 },
        { id: 'user3', name: 'Rahul Singh', points: 2700, completedChallenges: 6 },
        { id: 'user4', name: 'Current User', points: 2450, completedChallenges: 5 },
        { id: 'user5', name: 'Sanjay Kumar', points: 2100, completedChallenges: 5 }
      ],
      currentUser: {
        rank: 4,
        points: 2450,
        completedChallenges: 5
      }
    };
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
};

/**
 * Helper function to evaluate simulation answers
 * This would need custom logic based on simulation type
 */
const evaluateSimulation = (step: any, answer: any) => {
  // This is a simplified example
  // Real implementation would have more complex scoring logic
  
  let success = false;
  let points = 0;
  
  // Example for a budget allocation simulation
  if (step.content.simulationType === 'budget-allocation') {
    // Check if allocation percentages add up to 100%
    const totalPercentage = Object.values(answer.allocations).reduce((sum: number, value: any) => sum + value, 0);
    const isValidAllocation = Math.abs(totalPercentage - 100) < 0.1; // Allow for small rounding errors
    
    if (!isValidAllocation) {
      return { success: false, points: 0 };
    }
    
    // Calculate how close the allocation is to the optimal allocation
    const optimalAllocation = step.successCriteria.optimalAllocation;
    let differenceScore = 0;
    
    for (const [category, percentage] of Object.entries(answer.allocations)) {
      const optimalPercentage = optimalAllocation[category] || 0;
      // Add to difference score based on how far from optimal (0 is perfect)
      differenceScore += Math.abs(percentage - optimalPercentage);
    }
    
    // Convert difference to a 0-100 score (0 difference = 100 score)
    const maxPossibleDifference = 200; // Theoretical maximum difference
    const scorePercentage = 100 - (differenceScore / maxPossibleDifference * 100);
    
    // Success if score is above 70%
    success = scorePercentage >= 70;
    // Points proportional to score percentage
    points = Math.round(step.points * (scorePercentage / 100));
  }
  
  return { success, points };
};

export const procurementChallengeController = {
  getChallenges,
  getChallengeById,
  startChallenge,
  submitStepAnswer,
  completeChallenge,
  getUserChallengeProgress,
  getUserAchievements,
  getLeaderboard
};