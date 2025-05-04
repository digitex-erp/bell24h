import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Info, BookOpen, Sparkles, ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/lib/translations';
import ChallengeRunner, { Challenge, ChallengeCompletion } from './ChallengeRunner';
import { InteractionType } from './interactions/InteractionTypeRegistry';
import { useToast } from '@/hooks/use-toast';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  criteria: (completion: ChallengeCompletion) => boolean;
  points: number;
  unlocked: boolean;
}

interface InteractiveChallengeModeProps {
  onExit: () => void;
}

const InteractiveChallengeMode: React.FC<InteractiveChallengeModeProps> = ({
  onExit,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // In a real application, these would come from an API
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: 'challenge-1',
      title: 'RFQ Analysis Challenge',
      description: 'Learn to analyze RFQ documents and identify key requirements and opportunities in procurement documents.',
      difficulty: 'beginner',
      category: 'Analysis',
      estimatedTime: 15,
      points: 100,
      steps: [
        {
          id: 'step-1',
          title: 'Understanding RFQ Components',
          description: 'Select the correct components that should be included in a standard RFQ document.',
          type: InteractionType.MULTIPLE_CHOICE,
          options: [
            { id: 'option-1', text: 'Technical specifications and requirements' },
            { id: 'option-2', text: 'Delivery timeline expectations' },
            { id: 'option-3', text: 'Vendor performance history with other clients' },
            { id: 'option-4', text: 'Personal preferences of the procurement manager' }
          ],
          correctOptionId: 'option-1'
        },
        {
          id: 'step-2',
          title: 'Prioritizing Supplier Criteria',
          description: 'Rank the following criteria for supplier selection from most important to least important in a standard procurement process.',
          type: InteractionType.RANKING,
          items: [
            { id: 'item-1', text: 'Quality assurance and certifications' },
            { id: 'item-2', text: 'Price competitiveness' },
            { id: 'item-3', text: 'Delivery reliability and lead times' },
            { id: 'item-4', text: 'Sustainability practices' }
          ],
          correctOrder: ['item-1', 'item-3', 'item-2', 'item-4']
        }
      ]
    },
    {
      id: 'challenge-2',
      title: 'Negotiation Strategy',
      description: 'Practice effective negotiation strategies with suppliers to achieve optimal outcomes.',
      difficulty: 'intermediate',
      category: 'Negotiation',
      estimatedTime: 25,
      points: 150,
      steps: [
        {
          id: 'step-1',
          title: 'Supplier Price Reduction Request',
          description: 'You need to request a 10% price reduction from a long-term supplier. Choose the most effective approach.',
          type: InteractionType.DECISION,
          scenario: 'Your company has been working with a key supplier for 5 years. Market conditions have changed, and you need to request a 10% price reduction to remain competitive. How do you approach this conversation?',
          choices: [
            { 
              id: 'choice-1', 
              text: 'Collaborative Approach', 
              description: 'Discuss market conditions openly and work together to find solutions that maintain the relationship while achieving cost savings.',
              icon: 'approve'
            },
            { 
              id: 'choice-2', 
              text: 'Competitive Pressure', 
              description: 'Inform the supplier that you have received better offers from competitors and are considering switching.',
              icon: 'reject'
            }
          ],
          correctChoiceId: 'choice-1'
        },
        {
          id: 'step-2',
          title: 'Responding to Supplier Concerns',
          description: 'The supplier has expressed concerns about your price reduction request. Draft a response that addresses their concerns.',
          type: InteractionType.SCENARIO,
          scenario: 'Your supplier has responded to your price reduction request with concerns about their own rising costs and thin margins. They have been a reliable partner for years and have always delivered quality products on time.',
          question: 'How would you respond to maintain the relationship while still working toward your cost reduction goals?',
          minimumResponseLength: 100
        }
      ]
    },
    {
      id: 'challenge-3',
      title: 'Supply Chain Risk Management',
      description: 'Learn to identify and mitigate various types of risks in the global supply chain.',
      difficulty: 'advanced',
      category: 'Risk Management',
      estimatedTime: 35,
      points: 200,
      steps: [
        {
          id: 'step-1',
          title: 'Risk Identification',
          description: 'Match each supply chain risk to its appropriate category.',
          type: InteractionType.MATCHING,
          leftItems: [
            { id: 'left-1', text: 'Currency exchange rate volatility' },
            { id: 'left-2', text: 'Production facility fire' },
            { id: 'left-3', text: 'Supplier bankruptcy' },
            { id: 'left-4', text: 'New import tariffs' }
          ],
          rightItems: [
            { id: 'right-1', text: 'Financial Risk' },
            { id: 'right-2', text: 'Operational Risk' },
            { id: 'right-3', text: 'Supplier Risk' },
            { id: 'right-4', text: 'Regulatory Risk' }
          ],
          correctMatches: {
            'left-1': 'right-1',
            'left-2': 'right-2',
            'left-3': 'right-3',
            'left-4': 'right-4'
          }
        },
        {
          id: 'step-2',
          title: 'Supply Chain Resilience Planning',
          description: 'Optimize your supply chain resilience plan within budget constraints.',
          type: InteractionType.SIMULATION,
          simulationScenario: {
            id: 'sim-1',
            title: 'Building Supply Chain Resilience',
            description: 'Your company is allocating budget to improve supply chain resilience. You need to select initiatives that will have the best impact on risk reduction while staying within your budget.',
            actions: [
              {
                id: 'action-1',
                text: 'Implement multi-sourcing strategy',
                description: 'Develop relationships with multiple suppliers for critical components.',
                impact: { cost: 30, quality: 5, time: -10, risk: -25, sustainability: 5 }
              },
              {
                id: 'action-2',
                text: 'Increase inventory buffers',
                description: 'Maintain higher safety stock levels for critical components.',
                impact: { cost: 20, quality: 0, time: -15, risk: -15, sustainability: -5 }
              },
              {
                id: 'action-3',
                text: 'Invest in supplier monitoring tools',
                description: 'Advanced analytics to detect early warning signs of supplier issues.',
                impact: { cost: 15, quality: 10, time: 5, risk: -20, sustainability: 0 }
              },
              {
                id: 'action-4',
                text: 'Develop nearshore suppliers',
                description: 'Shift some procurement to suppliers in closer geographic proximity.',
                impact: { cost: 25, quality: -5, time: -20, risk: -10, sustainability: 15 }
              }
            ],
            constraints: {
              budget: 50,
              maxRisk: 30
            },
            initialMetrics: {
              cost: 40,
              quality: 65,
              time: 50,
              risk: 70,
              sustainability: 45
            },
            targetMetrics: {
              risk: 30
            }
          }
        }
      ]
    }
  ]);
  
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [completions, setCompletions] = useState<ChallengeCompletion[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first_challenge',
      title: "First Challenge Completed",
      description: "You've completed your first procurement challenge. Great start!",
      icon: <Award className="h-5 w-5 text-yellow-500" />,
      criteria: () => completions.length > 0,
      points: 50,
      unlocked: false
    },
    {
      id: 'perfect_score',
      title: "Perfect Score",
      description: "You achieved a perfect score on a challenge. Excellent work!",
      icon: <Sparkles className="h-5 w-5 text-purple-500" />,
      criteria: (completion) => {
        const challenge = challenges.find(c => c.id === completion.challengeId);
        return challenge ? completion.score === challenge.points : false;
      },
      points: 100,
      unlocked: false
    },
    {
      id: 'quick_learner',
      title: "Quick Learner",
      description: "You completed a challenge faster than the estimated time. You're a natural!",
      icon: <BookOpen className="h-5 w-5 text-blue-500" />,
      criteria: (completion) => {
        const challenge = challenges.find(c => c.id === completion.challengeId);
        if (!challenge || !completion.completedAt) return false;
        
        const startTime = new Date(completion.startedAt).getTime();
        const endTime = new Date(completion.completedAt).getTime();
        const timeInMinutes = (endTime - startTime) / (1000 * 60);
        
        return timeInMinutes < challenge.estimatedTime * 0.75;
      },
      points: 75,
      unlocked: false
    }
  ]);
  
  const [showTutorial, setShowTutorial] = useState(true);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  
  // Check for achievements whenever completions change
  useEffect(() => {
    if (completions.length === 0) return;
    
    const latestCompletion = completions[completions.length - 1];
    const newlyUnlocked: Achievement[] = [];
    
    const updatedAchievements = achievements.map(achievement => {
      if (!achievement.unlocked && achievement.criteria(latestCompletion)) {
        newlyUnlocked.push({...achievement, unlocked: true});
        return {...achievement, unlocked: true};
      }
      return achievement;
    });
    
    setAchievements(updatedAchievements);
    
    if (newlyUnlocked.length > 0) {
      setNewAchievements(newlyUnlocked);
    }
  }, [completions, achievements]);
  
  const handleChallengeComplete = (completion: ChallengeCompletion) => {
    setCompletions(prev => [...prev, completion]);
    
    // Update challenges to mark as completed
    setChallenges(prev => prev.map(challenge => 
      challenge.id === completion.challengeId
        ? { ...challenge, completed: true }
        : challenge
    ));
  };
  
  const handleCloseAchievementModal = () => {
    // Add points to user account (in production)
    const totalPoints = newAchievements.reduce((sum, a) => sum + a.points, 0);
    
    // Show toast for points
    toast({
      title: "Achievements Unlocked",
      description: `You earned ${totalPoints} points!`,
      variant: 'default',
    });
    
    setNewAchievements([]);
  };
  
  if (newAchievements.length > 0) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <Card className="w-full max-w-md">
            <CardHeader className="bg-gradient-to-r from-primary/20 to-primary/5 text-center">
              <Sparkles className="h-12 w-12 mx-auto text-primary mb-2" />
              <h2 className="text-2xl font-bold">Achievement Unlocked!</h2>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="space-y-6">
                {newAchievements.map(achievement => (
                  <motion.div 
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-start gap-4 p-4 bg-muted/20 rounded-lg"
                  >
                    <div className="bg-primary/10 p-3 rounded-full">
                      {achievement.icon}
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="font-medium mb-1">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      <div className="mt-2 text-sm font-medium text-primary">
                        +{achievement.points} {t('procurementChallenges.points')}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-center border-t pt-4">
              <Button onClick={handleCloseAchievementModal}>
                {t('common.continue')}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    );
  }
  
  if (showTutorial) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="pb-3 border-b">
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onExit}
              className="text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
            
            <h2 className="text-xl font-bold">{t('procurementChallenges.interactiveMode')}</h2>
            
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <Info className="h-12 w-12 mx-auto text-primary mb-3" />
            <h3 className="text-xl font-bold mb-2">{t('procurementChallenges.welcomeToInteractive')}</h3>
            <p className="text-muted-foreground mb-4">{t('procurementChallenges.interactiveModeDescription')}</p>
          </div>
          
          <div className="space-y-6">
            <Feature 
              title={t('procurementChallenges.features.guidedTutorials.title')}
              description={t('procurementChallenges.features.guidedTutorials.description')}
              icon={<BookOpen className="h-5 w-5 text-primary" />}
            />
            
            <Feature 
              title={t('procurementChallenges.features.realTimeFeedback.title')}
              description={t('procurementChallenges.features.realTimeFeedback.description')}
              icon={<Sparkles className="h-5 w-5 text-primary" />}
            />
            
            <Feature 
              title={t('procurementChallenges.features.progressTracking.title')}
              description={t('procurementChallenges.features.progressTracking.description')}
              icon={<Award className="h-5 w-5 text-primary" />}
            />
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4 flex justify-end">
          <Button onClick={() => setShowTutorial(false)}>
            {t('procurementChallenges.getStarted')}
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  if (selectedChallenge) {
    const savedProgress = completions.find(c => c.challengeId === selectedChallenge.id);
    
    return (
      <ChallengeRunner
        challenge={selectedChallenge}
        savedProgress={savedProgress}
        onComplete={handleChallengeComplete}
        onExit={() => setSelectedChallenge(null)}
      />
    );
  }
  
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="pb-3 border-b">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            className="text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.back')}
          </Button>
          
          <h2 className="text-xl font-bold">{t('procurementChallenges.interactiveMode')}</h2>
          
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>
      </CardHeader>
      
      <CardContent className="py-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">{t('procurementChallenges.selectChallenge')}</h3>
          <p className="text-sm text-muted-foreground">{t('procurementChallenges.selectChallengeDescription')}</p>
        </div>
        
        {challenges.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('procurementChallenges.noChallengesAvailable')}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {challenges.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                isCompleted={completions.some(c => c.challengeId === challenge.id)}
                onClick={() => setSelectedChallenge(challenge)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface FeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const Feature: React.FC<FeatureProps> = ({ title, description, icon }) => {
  return (
    <div className="flex items-start gap-4 p-4 bg-muted/20 rounded-lg">
      <div className="bg-primary/10 p-3 rounded-full">
        {icon}
      </div>
      
      <div>
        <h3 className="font-medium mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

interface ChallengeCardProps {
  challenge: Challenge;
  isCompleted: boolean;
  onClick: () => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, isCompleted, onClick }) => {
  const { t } = useTranslation();
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
        return 'bg-orange-100 text-orange-800';
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-all ${isCompleted ? 'bg-primary/5 border-primary/30' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg mb-1">{challenge.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
            
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                {t(`procurementChallenges.difficulties.${challenge.difficulty}`)}
              </span>
              
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                {challenge.category}
              </span>
              
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                {challenge.estimatedTime} {t('procurementChallenges.minutes')}
              </span>
              
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                {challenge.points} {t('procurementChallenges.points')}
              </span>
            </div>
          </div>
          
          {isCompleted && (
            <div className="flex-shrink-0">
              <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                <Award className="h-3.5 w-3.5" />
                {t('procurementChallenges.completed')}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveChallengeMode;