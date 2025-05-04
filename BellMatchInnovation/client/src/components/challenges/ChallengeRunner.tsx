import { useState, useEffect } from 'react';
import { useProcurementChallenges, ChallengeStep } from './ProcurementChallengeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Clock, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getInteractionComponent } from './interactions/InteractionTypeRegistry';

interface ChallengeRunnerProps {
  challengeId: string;
  onComplete: () => void;
  onExit: () => void;
}

export default function ChallengeRunner({ challengeId, onComplete, onExit }: ChallengeRunnerProps) {
  const {
    startChallenge,
    activeChallengeProgress,
    currentStep,
    stepIndex,
    submitStepAnswer,
    nextStep,
    getHint,
    exitChallenge,
  } = useProcurementChallenges();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Fetch challenge on mount
  useEffect(() => {
    const loadChallenge = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const success = await startChallenge(challengeId);
        if (!success) {
          setError('Failed to load challenge. Please try again.');
        }
      } catch (error) {
        setError('An error occurred while loading the challenge. Please try again.');
        console.error('Error starting challenge:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadChallenge();
    
    // Cleanup on unmount
    return () => {
      exitChallenge();
    };
  }, [challengeId, startChallenge, exitChallenge]);
  
  const handleSubmitAnswer = (answer: any) => {
    submitStepAnswer(answer);
    setShowFeedback(true);
  };
  
  const handleNextStep = () => {
    setShowFeedback(false);
    setShowHint(false);
    nextStep();
  };
  
  const handleShowHint = () => {
    setShowHint(true);
  };
  
  const handleExitChallenge = () => {
    exitChallenge();
    onExit();
  };
  
  const handleCompleteChallenge = () => {
    exitChallenge();
    onComplete();
  };
  
  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading challenge...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-6 text-center">
          <Button onClick={handleExitChallenge}>
            Return to Challenge Library
          </Button>
        </div>
      </div>
    );
  }
  
  if (!activeChallengeProgress || !currentStep) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>No active challenge found. Please select a challenge from the library.</AlertDescription>
        </Alert>
        <div className="mt-6 text-center">
          <Button onClick={handleExitChallenge}>
            Return to Challenge Library
          </Button>
        </div>
      </div>
    );
  }
  
  const { challenge } = activeChallengeProgress;
  const totalSteps = challenge.steps.length;
  const progressPercentage = ((stepIndex + 1) / totalSteps) * 100;
  const isLastStep = stepIndex === totalSteps - 1;
  
  // Get the appropriate interaction component for the current step
  const InteractionComponent = getInteractionComponent(currentStep.interactionType);
  
  if (!InteractionComponent) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Unknown interaction type: {currentStep.interactionType}. Please contact support.
          </AlertDescription>
        </Alert>
        <div className="mt-6 text-center">
          <Button onClick={handleExitChallenge}>
            Return to Challenge Library
          </Button>
        </div>
      </div>
    );
  }
  
  // Get user's answer for the current step
  const userAnswer = activeChallengeProgress.stepProgress[currentStep.id]?.answer;
  
  return (
    <div className="container mx-auto max-w-4xl">
      <div className="mb-8 flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={handleExitChallenge}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Exit Challenge
        </Button>
        
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-1">
            <Clock className="h-4 w-4" />
            <span>~{challenge.estimatedTime} min</span>
          </Badge>
          <Badge variant="outline">{challenge.difficulty}</Badge>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h1 className="text-2xl font-bold mb-2">{challenge.title}</h1>
        <p className="text-slate-600 mb-4">{challenge.description}</p>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress: {stepIndex + 1} of {totalSteps} steps</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>
      
      <div className="mb-8">
        <InteractionComponent
          {...currentStep}
          {...currentStep.content}
          onSubmit={handleSubmitAnswer}
          disabled={showFeedback}
          showFeedback={showFeedback}
          selectedOption={userAnswer}
          userRanking={userAnswer}
          hint={getHint()}
          showHint={showHint}
          onRequestHint={handleShowHint}
        />
      </div>
      
      {showFeedback && (
        <div className="flex justify-between">
          <div />
          {isLastStep ? (
            <Button onClick={handleCompleteChallenge} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Complete Challenge
            </Button>
          ) : (
            <Button onClick={handleNextStep} className="gap-2">
              Next Step
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}