import React from 'react';
import { Check, Clock, Lock, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Challenge, ChallengeStatus, ChallengeDifficulty } from './ProcurementChallengeProvider';

interface ChallengeProgressTrackerProps {
  challenges: Challenge[];
  activeChallengeId: string | null;
  onSelectChallenge: (challengeId: string) => void;
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-blue-100 text-blue-800',
  advanced: 'bg-amber-100 text-amber-800',
  expert: 'bg-red-100 text-red-800'
};

const getDifficultyLabel = (difficulty: ChallengeDifficulty): string => {
  switch (difficulty) {
    case 'beginner': return 'Beginner';
    case 'intermediate': return 'Intermediate';
    case 'advanced': return 'Advanced';
    case 'expert': return 'Expert';
    default: return difficulty;
  }
};

export const ChallengeProgressTracker: React.FC<ChallengeProgressTrackerProps> = ({ 
  challenges, 
  activeChallengeId,
  onSelectChallenge
}) => {
  // Calculate completion percentage
  const totalChallenges = challenges.length;
  const completedChallenges = challenges.filter(c => c.status === 'completed').length;
  const completionPercentage = totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0;
  
  // Group challenges by category
  const categorizedChallenges = challenges.reduce((acc, challenge) => {
    const category = challenge.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(challenge);
    return acc;
  }, {} as Record<string, Challenge[]>);
  
  // Format category name
  const formatCategoryName = (category: string): string => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  // Get status icon
  const getStatusIcon = (status: ChallengeStatus, isActive: boolean = false) => {
    switch (status) {
      case 'completed':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'in-progress':
      case 'available':
        if (isActive) {
          return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
        }
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'locked':
        return <Lock className="h-5 w-5 text-gray-400" />;
      case 'failed':
        return <Clock className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Your Progress</h3>
          <div className="text-sm text-gray-500">
            {completedChallenges} of {totalChallenges} completed
          </div>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </div>
      
      <div className="space-y-6">
        {Object.entries(categorizedChallenges).map(([category, categoryChallenges]) => (
          <div key={category} className="space-y-3">
            <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wider">
              {formatCategoryName(category)}
            </h4>
            
            <div className="space-y-2">
              {categoryChallenges.map(challenge => {
                const isActive = challenge.id === activeChallengeId;
                const isClickable = challenge.status === 'available' || challenge.status === 'in-progress';
                
                return (
                  <TooltipProvider key={challenge.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div 
                          className={`
                            flex items-center justify-between p-3 rounded-md border 
                            ${isActive ? 'bg-blue-50 border-blue-300' : 'bg-white'} 
                            ${isClickable ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'}
                            ${challenge.status === 'locked' ? 'opacity-60' : ''}
                          `}
                          onClick={() => isClickable && onSelectChallenge(challenge.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              {getStatusIcon(challenge.status, isActive)}
                            </div>
                            <div>
                              <h5 className="font-medium text-sm">{challenge.title}</h5>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={difficultyColors[challenge.difficulty]}>
                                  {getDifficultyLabel(challenge.difficulty)}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {challenge.estimatedTime} min
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <Award className="h-4 w-4 text-amber-500" />
                              <span className="text-xs ml-1">{challenge.totalPoints}</span>
                            </div>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="max-w-xs">
                          <p className="font-medium">{challenge.title}</p>
                          <p className="text-sm mt-1">{challenge.description}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {challenge.skills.map(skill => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          {challenge.status === 'locked' && (
                            <p className="text-xs text-amber-600 mt-2">
                              Complete prerequisite challenges to unlock
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChallengeProgressTracker;