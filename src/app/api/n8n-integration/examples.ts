// File: src/app/api/n8n-integration/examples.ts
// Backend integration examples for triggering n8n workflows
// This shows how to properly separate business logic from marketing automation

import { triggerN8nWorkflow, N8N_WORKFLOWS } from '@/lib/n8n-trigger';
import { prisma } from '@/lib/prisma';

/**
 * EXAMPLE 1: Payment Success Flow
 * Business Logic: Handle payment completion
 * n8n Role: Send confirmation email only
 */
export async function handlePaymentSuccess(paymentId: string) {
  try {
    // STEP 1: YOUR BUSINESS LOGIC (in your backend)
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true }
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Update payment status (YOUR logic)
    await prisma.payment.update({
      where: { id: paymentId },
      data: { 
        status: 'completed',
        completedAt: new Date()
      }
    });

    // Update user status if needed (YOUR logic)
    await prisma.user.update({
      where: { id: payment.userId },
      data: { 
        // Any business logic updates
        lastPaymentAt: new Date()
      }
    });

    // STEP 2: TRIGGER n8n FOR MARKETING (send email only)
    const emailResult = await triggerN8nWorkflow(N8N_WORKFLOWS.PAYMENT_SUCCESS, {
      userEmail: payment.user.email,
      userName: payment.user.name,
      amount: payment.amount,
      paymentId: payment.id,
      currency: payment.currency,
      template: 'payment-success'
    });

    if (!emailResult.success) {
      console.error('Failed to send payment success email:', emailResult.error);
      // Don't fail the payment - just log the error
    }

    return {
      success: true,
      payment,
      emailSent: emailResult.success
    };

  } catch (error) {
    console.error('Payment success handling failed:', error);
    throw error;
  }
}

/**
 * EXAMPLE 2: RFQ Created Flow
 * Business Logic: Match suppliers, calculate scores
 * n8n Role: Notify matched suppliers via email
 */
export async function handleRfqCreated(rfqId: string) {
  try {
    // STEP 1: YOUR BUSINESS LOGIC (matching algorithm)
    const rfq = await prisma.rfq.findUnique({
      where: { id: rfqId },
      include: { 
        user: true,
        category: true
      }
    });

    if (!rfq) {
      throw new Error('RFQ not found');
    }

    // YOUR supplier matching algorithm (your IP)
    const matchedSuppliers = await findMatchingSuppliers(rfq);
    
    // YOUR scoring algorithm (your IP)
    const scoredSuppliers = await scoreSuppliers(matchedSuppliers, rfq);
    
    // YOUR business logic for supplier selection
    const topSuppliers = scoredSuppliers.slice(0, 5); // Top 5 suppliers

    // Update RFQ with supplier matches (YOUR database update)
    await prisma.rfq.update({
      where: { id: rfqId },
      data: {
        matchedSuppliersCount: topSuppliers.length,
        status: 'matched'
      }
    });

    // STEP 2: TRIGGER n8n FOR MARKETING (send notifications)
    const notificationData = {
      userEmail: rfq.user.email,
      userName: rfq.user.name,
      rfqTitle: rfq.title,
      rfqId: rfq.id,
      category: rfq.category.name,
      supplierEmails: topSuppliers.map(s => s.email),
      supplierNames: topSuppliers.map(s => s.name),
      deadline: rfq.deadline,
      template: 'rfq-supplier-notification'
    };

    const emailResult = await triggerN8nWorkflow(N8N_WORKFLOWS.RFQ_CREATED, notificationData);

    if (!emailResult.success) {
      console.error('Failed to send RFQ notifications:', emailResult.error);
      // Could implement fallback notification system here
    }

    return {
      success: true,
      rfq,
      matchedSuppliers: topSuppliers,
      notificationsSent: emailResult.success
    };

  } catch (error) {
    console.error('RFQ creation handling failed:', error);
    throw error;
  }
}

/**
 * EXAMPLE 3: Referral Success Flow
 * Business Logic: Calculate rewards, update referrer
 * n8n Role: Send congratulatory email only
 */
export async function handleReferralSuccess(referralData: {
  referrerId: string;
  referredId: string;
  referralCode: string;
}) {
  try {
    // STEP 1: YOUR BUSINESS LOGIC (referral system)
    const referrer = await prisma.user.findUnique({
      where: { id: referralData.referrerId }
    });

    const referred = await prisma.user.findUnique({
      where: { id: referralData.referredId }
    });

    if (!referrer || !referred) {
      throw new Error('Referrer or referred user not found');
    }

    // YOUR referral reward calculation (your IP)
    const rewardPoints = calculateReferralReward(referrer, referred);
    
    // YOUR business logic for tier progression
    const newTier = calculateNewReferralTier(referrer, rewardPoints);

    // Update referrer (YOUR database update)
    await prisma.user.update({
      where: { id: referrer.id },
      data: {
        referralPoints: { increment: rewardPoints },
        referralTier: newTier,
        totalReferrals: { increment: 1 }
      }
    });

    // Create referral record (YOUR database record)
    await prisma.referral.create({
      data: {
        referrerId: referrer.id,
        referredId: referred.id,
        code: referralData.referralCode,
        rewardPoints,
        status: 'completed'
      }
    });

    // STEP 2: TRIGGER n8n FOR MARKETING (send email only)
    const emailResult = await triggerN8nWorkflow(N8N_WORKFLOWS.REFERRAL_SUCCESS, {
      referrerEmail: referrer.email,
      referrerName: referrer.name,
      referredName: referred.name,
      rewardPoints,
      newTier,
      totalReferrals: (referrer.totalReferrals || 0) + 1,
      template: 'referral-success'
    });

    if (!emailResult.success) {
      console.error('Failed to send referral success email:', emailResult.error);
    }

    return {
      success: true,
      referrer,
      referred,
      rewardPoints,
      newTier,
      emailSent: emailResult.success
    };

  } catch (error) {
    console.error('Referral success handling failed:', error);
    throw error;
  }
}

/**
 * EXAMPLE 4: User Registration Flow
 * Business Logic: Create user, set up profile
 * n8n Role: Send welcome email and onboarding sequence
 */
export async function handleUserRegistration(userId: string) {
  try {
    // STEP 1: YOUR BUSINESS LOGIC (user setup)
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // YOUR user onboarding setup (your IP)
    await setupUserProfile(user);
    await createUserPreferences(user);
    await assignDefaultCategories(user);

    // YOUR business logic for welcome flow
    const onboardingSteps = generateOnboardingSteps(user);

    // STEP 2: TRIGGER n8n FOR MARKETING (welcome sequence)
    const welcomeResult = await triggerN8nWorkflow(N8N_WORKFLOWS.USER_REGISTERED, {
      userEmail: user.email,
      userName: user.name,
      userType: user.type,
      onboardingSteps: onboardingSteps.length,
      template: 'welcome-email'
    });

    if (!welcomeResult.success) {
      console.error('Failed to send welcome email:', welcomeResult.error);
      // Don't fail user registration - just log error
    }

    // Schedule follow-up emails (n8n handles the timing)
    const followUpResult = await triggerN8nWorkflow('user-onboarding-sequence', {
      userEmail: user.email,
      userName: user.name,
      userId: user.id,
      scheduleDelay: '24h' // n8n handles the delay
    });

    return {
      success: true,
      user,
      welcomeEmailSent: welcomeResult.success,
      onboardingSequenceTriggered: followUpResult.success
    };

  } catch (error) {
    console.error('User registration handling failed:', error);
    throw error;
  }
}

/**
 * EXAMPLE 5: Churn Prevention Flow
 * Business Logic: Analyze user activity, determine risk
 * n8n Role: Send re-engagement campaigns
 */
export async function handleChurnPrevention(userId: string) {
  try {
    // STEP 1: YOUR BUSINESS LOGIC (churn analysis)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        rfqs: true,
        quotes: true,
        lastLoginAt: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // YOUR churn risk calculation (your IP)
    const churnRiskScore = calculateChurnRisk(user);
    
    // YOUR business logic for intervention
    if (churnRiskScore < 0.7) {
      return {
        success: true,
        action: 'no_action_needed',
        reason: 'Low churn risk'
      };
    }

    // Determine intervention type (YOUR logic)
    const interventionType = determineInterventionType(churnRiskScore, user);

    // Update user record (YOUR database update)
    await prisma.user.update({
      where: { id: userId },
      data: {
        churnRiskScore,
        lastChurnAnalysis: new Date(),
        churnPreventionStatus: interventionType
      }
    });

    // STEP 2: TRIGGER n8n FOR MARKETING (send re-engagement)
    const campaignResult = await triggerN8nWorkflow(N8N_WORKFLOWS.CHURN_PREVENTION, {
      userEmail: user.email,
      userName: user.name,
      churnRiskScore,
      interventionType,
      lastActivity: user.lastLoginAt,
      template: `churn-prevention-${interventionType}`
    });

    if (!campaignResult.success) {
      console.error('Failed to trigger churn prevention campaign:', campaignResult.error);
      // Could implement fallback retention strategy
    }

    return {
      success: true,
      user,
      churnRiskScore,
      interventionType,
      campaignTriggered: campaignResult.success
    };

  } catch (error) {
    console.error('Churn prevention handling failed:', error);
    throw error;
  }
}

/**
 * EXAMPLE 6: Gamification Achievement Flow
 * Business Logic: Validate achievement, award points
 * n8n Role: Send achievement notifications
 */
export async function handleAchievementUnlocked(userId: string, achievementType: string) {
  try {
    // STEP 1: YOUR BUSINESS LOGIC (achievement system)
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // YOUR achievement validation (your IP)
    const achievement = await validateAchievement(user, achievementType);
    
    if (!achievement) {
      return {
        success: false,
        reason: 'Achievement requirements not met'
      };
    }

    // YOUR point calculation (your IP)
    const pointsAwarded = calculateAchievementPoints(achievementType);
    
    // YOUR badge assignment logic (your IP)
    const newBadges = await assignBadges(user, achievementType);

    // Update user (YOUR database update)
    await prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: { increment: pointsAwarded },
        achievements: { push: achievementType }
      }
    });

    // Create achievement record (YOUR database record)
    await prisma.achievement.create({
      data: {
        userId,
        type: achievementType,
        points: pointsAwarded,
        badges: newBadges,
        status: 'unlocked'
      }
    });

    // STEP 2: TRIGGER n8n FOR MARKETING (send notifications)
    const notificationResult = await triggerN8nWorkflow(N8N_WORKFLOWS.GAMIFICATION_NOTIFICATIONS, {
      userEmail: user.email,
      userName: user.name,
      achievementType,
      pointsAwarded,
      newBadges,
      totalPoints: (user.totalPoints || 0) + pointsAwarded,
      template: 'achievement-unlocked'
    });

    if (!notificationResult.success) {
      console.error('Failed to send achievement notification:', notificationResult.error);
    }

    return {
      success: true,
      user,
      achievement,
      pointsAwarded,
      newBadges,
      notificationSent: notificationResult.success
    };

  } catch (error) {
    console.error('Achievement unlock handling failed:', error);
    throw error;
  }
}

/**
 * HELPER FUNCTIONS (These would be your business logic)
 * These are examples - implement according to your specific requirements
 */

async function findMatchingSuppliers(rfq: any) {
  // Your supplier matching algorithm
  // This is your IP - implement based on category, location, capacity, etc.
  return await prisma.user.findMany({
    where: {
      type: 'supplier',
      categories: {
        some: { id: rfq.categoryId }
      }
    }
  });
}

async function scoreSuppliers(suppliers: any[], rfq: any) {
  // Your supplier scoring algorithm
  // This is your IP - implement based on ratings, past performance, etc.
  return suppliers.map(supplier => ({
    ...supplier,
    score: Math.random() * 100 // Replace with actual scoring
  })).sort((a, b) => b.score - a.score);
}

function calculateReferralReward(referrer: any, referred: any) {
  // Your referral reward calculation
  // This is your IP - implement based on user tiers, activity, etc.
  return 100; // Example: 100 points
}

function calculateNewReferralTier(referrer: any, newPoints: number) {
  // Your tier calculation logic
  // This is your IP - implement based on total points, referrals, etc.
  const totalPoints = (referrer.referralPoints || 0) + newPoints;
  if (totalPoints >= 1000) return 'gold';
  if (totalPoints >= 500) return 'silver';
  return 'bronze';
}

async function setupUserProfile(user: any) {
  // Your user setup logic
  // This is your IP - implement profile creation, preferences, etc.
  console.log(`Setting up profile for user: ${user.id}`);
}

async function createUserPreferences(user: any) {
  // Your preference setup logic
  // This is your IP - implement default preferences, etc.
  console.log(`Creating preferences for user: ${user.id}`);
}

async function assignDefaultCategories(user: any) {
  // Your category assignment logic
  // This is your IP - implement based on user type, interests, etc.
  console.log(`Assigning default categories for user: ${user.id}`);
}

function generateOnboardingSteps(user: any) {
  // Your onboarding logic
  // This is your IP - implement based on user type, goals, etc.
  return ['complete_profile', 'verify_email', 'create_first_rfq'];
}

function calculateChurnRisk(user: any) {
  // Your churn risk calculation
  // This is your IP - implement based on activity, engagement, etc.
  const daysSinceLastLogin = Math.floor(
    (Date.now() - new Date(user.lastLoginAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.min(daysSinceLastLogin / 30, 1); // Simple example
}

function determineInterventionType(riskScore: number, user: any) {
  // Your intervention logic
  // This is your IP - implement based on risk level, user preferences, etc.
  if (riskScore > 0.9) return 'urgent_reengagement';
  if (riskScore > 0.8) return 'special_offer';
  return 'gentle_reminder';
}

async function validateAchievement(user: any, achievementType: string) {
  // Your achievement validation logic
  // This is your IP - implement based on user activity, requirements, etc.
  console.log(`Validating achievement: ${achievementType} for user: ${user.id}`);
  return { type: achievementType, valid: true }; // Example
}

function calculateAchievementPoints(achievementType: string) {
  // Your achievement points calculation
  // This is your IP - implement based on achievement difficulty, etc.
  const pointsMap: Record<string, number> = {
    'first_rfq': 50,
    'first_quote': 50,
    'ten_rfqs': 200,
    'supplier_match': 100
  };
  return pointsMap[achievementType] || 50;
}

async function assignBadges(user: any, achievementType: string) {
  // Your badge assignment logic
  // This is your IP - implement based on achievements, tiers, etc.
  console.log(`Assigning badges for achievement: ${achievementType}`);
  return ['new_achiever']; // Example
}