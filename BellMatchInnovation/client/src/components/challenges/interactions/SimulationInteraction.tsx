import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

export interface SimulationStage {
  id: string;
  type: string;
  title: string;
  description: string;
  decisions?: Array<{
    id: string;
    text: string;
    description?: string;
    impact: Record<string, number>;
    feedback?: string;
    feedbackType?: 'success' | 'warning' | 'error' | 'info';
  }>;
  tasks?: Array<{
    id: string;
    title: string;
    description?: string;
    points: number;
    complete?: boolean;
  }>;
  metrics?: Array<{
    id: string;
    title: string;
    description?: string;
    value: number;
    target?: number;
    threshold?: number;
    unit?: string;
  }>;
}

export interface SimulationScenario {
  initialState: Record<string, any>;
  stages: SimulationStage[];
}

export interface SimulationInteractionProps {
  title: string;
  description: string;
  simulationScenario: SimulationScenario;
  onSubmit: (results: Record<string, any>) => void;
  disabled?: boolean;
  showFeedback?: boolean;
  userState?: Record<string, any>;
  stageResults?: Record<string, any>;
  hint?: string;
  showHint?: boolean;
  onRequestHint?: () => void;
  timeLimit?: number;
}

export default function SimulationInteraction({
  title,
  description,
  simulationScenario,
  onSubmit,
  disabled = false,
  showFeedback = false,
  userState: initialUserState,
  stageResults: initialStageResults,
  hint,
  showHint = false,
  onRequestHint,
  timeLimit
}: SimulationInteractionProps) {
  // State for simulation
  const [userState, setUserState] = useState<Record<string, any>>(
    initialUserState || {...simulationScenario.initialState}
  );
  const [stageResults, setStageResults] = useState<Record<string, any>>(initialStageResults || {});
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [submitted, setSubmitted] = useState(!!initialStageResults);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(timeLimit || null);
  const [activeTab, setActiveTab] = useState<string>('scenario');
  
  const currentStage = simulationScenario.stages[currentStageIndex];
  
  // Timer logic
  useEffect(() => {
    if (!timeLimit || timeRemaining === null || timeRemaining <= 0 || disabled) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLimit, timeRemaining, disabled]);
  
  useEffect(() => {
    if (timeRemaining === 0 && !submitted) {
      handleSubmit();
    }
  }, [timeRemaining, submitted]);
  
  const handleStageCompletion = (results: any) => {
    const newStageResults = {
      ...stageResults,
      [currentStage.id]: results
    };
    
    setStageResults(newStageResults);
    
    // Update user state based on decision impact
    if (currentStage.type === 'decision-point' && results.decisionId) {
      const decision = currentStage.decisions?.find(d => d.id === results.decisionId);
      if (decision?.impact) {
        const newState = {...userState};
        Object.entries(decision.impact).forEach(([key, value]) => {
          if (typeof newState[key] === 'number') {
            newState[key] += value;
          } else {
            newState[key] = value;
          }
        });
        setUserState(newState);
      }
    }
    
    // If all stages are complete, submit the final results
    const allStagesComplete = simulationScenario.stages.every(
      stage => newStageResults[stage.id]
    );
    
    if (allStagesComplete || currentStageIndex === simulationScenario.stages.length - 1) {
      setSubmitted(true);
      onSubmit({
        stageResults: newStageResults,
        finalState: userState
      });
    } else {
      // Move to next stage
      setCurrentStageIndex(currentStageIndex + 1);
    }
  };
  
  const handleDecisionSelect = (decisionId: string) => {
    if (disabled || submitted) return;
    
    handleStageCompletion({
      decisionId,
      timestamp: new Date().toISOString()
    });
  };
  
  const handleSubmit = () => {
    if (disabled || submitted) return;
    setSubmitted(true);
    
    // Submit whatever results we have so far
    onSubmit({
      stageResults,
      finalState: userState,
      incomplete: true
    });
  };
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  const calculateScore = () => {
    if (!showFeedback || !submitted) return null;
    
    // Calculate final score based on metrics in userState
    const scoreWeights = userState.scoreWeights || {
      quality: 0.25,
      costEfficiency: 0.25,
      timeEfficiency: 0.25,
      riskManagement: 0.25
    };
    
    let totalScore = 0;
    let maxPossible = 0;
    
    Object.entries(scoreWeights).forEach(([metric, weight]) => {
      if (typeof userState[metric] === 'number') {
        const value = Math.max(0, Math.min(100, userState[metric]));
        totalScore += value * (weight as number);
        maxPossible += 100 * (weight as number);
      }
    });
    
    const normalizedScore = (totalScore / maxPossible) * 100;
    
    return {
      score: Math.round(normalizedScore),
      metrics: Object.entries(scoreWeights).map(([metric, weight]) => ({
        name: metric,
        value: userState[metric] || 0,
        weight
      })),
      isPerfect: normalizedScore >= 90,
      isGood: normalizedScore >= 70,
      isFair: normalizedScore >= 50
    };
  };
  
  const scoreFeedback = calculateScore();
  
  const renderStage = () => {
    if (!currentStage) return null;
    
    switch (currentStage.type) {
      case 'decision-point':
        return (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-md border">
              <h3 className="text-lg font-medium mb-2">{currentStage.title}</h3>
              <p>{currentStage.description}</p>
            </div>
            
            <div className="space-y-3 mt-4">
              {currentStage.decisions?.map(decision => {
                const isSelected = stageResults[currentStage.id]?.decisionId === decision.id;
                const feedbackClass = decision.feedbackType === 'success' 
                  ? 'border-green-400 bg-green-50' 
                  : decision.feedbackType === 'warning' 
                    ? 'border-amber-400 bg-amber-50'
                    : decision.feedbackType === 'error'
                      ? 'border-red-400 bg-red-50'
                      : '';
                
                return (
                  <div
                    key={decision.id}
                    className={`
                      p-4 rounded-md border transition-colors cursor-pointer
                      ${disabled ? 'opacity-80' : 'hover:border-primary'}
                      ${isSelected && !showFeedback ? 'border-primary bg-primary/5' : 'border-input'}
                      ${showFeedback && isSelected ? feedbackClass : ''}
                    `}
                    onClick={() => handleDecisionSelect(decision.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{decision.text}</h4>
                        {decision.description && (
                          <p className="text-sm text-muted-foreground mt-1">{decision.description}</p>
                        )}
                      </div>
                      {showFeedback && isSelected && (
                        <Badge variant={
                          decision.feedbackType === 'success' ? 'outline' :
                          decision.feedbackType === 'warning' ? 'secondary' : 'destructive'
                        } className={
                          decision.feedbackType === 'success' ? 'bg-green-50 text-green-700 border-green-200' : ''
                        }>
                          {decision.feedbackType === 'success' ? 'Good Choice' : 
                           decision.feedbackType === 'warning' ? 'Average Choice' : 'Poor Choice'}
                        </Badge>
                      )}
                    </div>
                    
                    {showFeedback && isSelected && decision.feedback && (
                      <div className="mt-3 text-sm bg-slate-50 p-3 rounded border">
                        <strong>Outcome:</strong> {decision.feedback}
                      </div>
                    )}
                    
                    {showFeedback && isSelected && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {Object.entries(decision.impact).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                            <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                            <Badge variant={value >= 0 ? 'outline' : 'destructive'} className={value >= 0 ? 'bg-green-50' : ''}>
                              {value >= 0 ? `+${value}` : value}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      
      // Add other stage types here if needed
      default:
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unsupported Stage Type</AlertTitle>
            <AlertDescription>
              This stage type ({currentStage.type}) is not supported.
            </AlertDescription>
          </Alert>
        );
    }
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          {timeLimit && timeRemaining !== null && !submitted && (
            <Badge variant={timeRemaining < 10 ? "destructive" : "outline"} className="ml-2">
              {formatTime(timeRemaining)}
            </Badge>
          )}
        </div>
        <CardDescription>{description}</CardDescription>
        
        {!submitted && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Stage {currentStageIndex + 1} of {simulationScenario.stages.length}</span>
              <span>{Math.round(((currentStageIndex + 1) / simulationScenario.stages.length) * 100)}%</span>
            </div>
            <Progress value={((currentStageIndex + 1) / simulationScenario.stages.length) * 100} className="h-2" />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {submitted ? (
          <Tabs defaultValue="results" className="w-full">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="decisions">Decisions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="results" className="space-y-4 pt-4">
              {scoreFeedback && (
                <Alert 
                  variant={
                    scoreFeedback.isPerfect ? "default" : 
                    (scoreFeedback.isGood ? "default" : 
                     scoreFeedback.isFair ? "default" : "destructive")
                  } 
                  className={
                    scoreFeedback.isPerfect ? "bg-green-50 border-green-200" : 
                    scoreFeedback.isGood ? "bg-emerald-50 border-emerald-200" : 
                    scoreFeedback.isFair ? "bg-amber-50 border-amber-200" : ""
                  }
                >
                  {scoreFeedback.isPerfect ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : scoreFeedback.isGood ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {scoreFeedback.isPerfect 
                      ? "Outstanding Performance!" 
                      : scoreFeedback.isGood 
                        ? "Good Performance" 
                        : scoreFeedback.isFair
                          ? "Fair Performance"
                          : "Needs Improvement"}
                  </AlertTitle>
                  <AlertDescription>
                    {scoreFeedback.isPerfect 
                      ? `You scored ${scoreFeedback.score}%! You've demonstrated exceptional procurement management skills.` 
                      : `You scored ${scoreFeedback.score}%. ${
                          scoreFeedback.isGood 
                            ? "Your procurement strategy was effective with room for improvements." 
                            : scoreFeedback.isFair 
                              ? "You made some good decisions, but there's significant room for improvement."
                              : "Your procurement strategy faced several challenges. Review your decisions to learn from this experience."
                        }`}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                {scoreFeedback?.metrics.map(metric => (
                  <Card key={metric.name} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {metric.name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-end justify-between">
                        <div className="text-2xl font-bold">
                          {Math.round(metric.value)}
                          <span className="text-xs font-normal text-muted-foreground">/100</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Weight: {(metric.weight as number) * 100}%
                        </div>
                      </div>
                      <Progress 
                        value={Math.max(0, Math.min(100, metric.value))} 
                        className="h-2 mt-2"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">Final State</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(userState)
                    .filter(([key]) => !key.startsWith('_') && key !== 'scoreWeights')
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between p-2 bg-slate-50 rounded border">
                        <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                        <Badge variant="outline">
                          {typeof value === 'number' ? value.toLocaleString() : String(value)}
                        </Badge>
                      </div>
                    ))
                  }
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="metrics" className="pt-4">
              <div className="space-y-4">
                <h3 className="font-medium">Performance Metrics</h3>
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(userState)
                    .filter(([key]) => 
                      !key.startsWith('_') && 
                      key !== 'scoreWeights' &&
                      typeof userState[key] === 'number'
                    )
                    .map(([key, value]) => (
                      <Card key={key}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {key === 'budget' 
                                  ? 'Remaining budget' 
                                  : key === 'time'
                                    ? 'Remaining time (days)'
                                    : key === 'quality'
                                      ? 'Solution quality score'
                                      : key === 'costEfficiency'
                                        ? 'Cost efficiency score'
                                        : key === 'timeEfficiency'
                                          ? 'Time efficiency score'
                                          : key === 'riskManagement'
                                            ? 'Risk management score'
                                            : ''}
                              </p>
                            </div>
                            <div className="text-2xl font-bold">
                              {typeof value === 'number' ? value.toLocaleString() : String(value)}
                            </div>
                          </div>
                          {typeof value === 'number' && key !== 'budget' && key !== 'time' && (
                            <Progress 
                              value={Math.max(0, Math.min(100, value))} 
                              className="h-2 mt-2"
                            />
                          )}
                        </CardContent>
                      </Card>
                    ))
                  }
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="decisions" className="pt-4">
              <div className="space-y-4">
                <h3 className="font-medium">Your Decisions</h3>
                <div className="space-y-4">
                  {simulationScenario.stages
                    .filter(stage => stageResults[stage.id])
                    .map((stage, index) => {
                      const result = stageResults[stage.id];
                      const decision = stage.decisions?.find(d => d.id === result.decisionId);
                      
                      return (
                        <Card key={stage.id}>
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base font-medium">
                              Stage {index + 1}: {stage.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            {decision ? (
                              <div>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{decision.text}</p>
                                    {decision.description && (
                                      <p className="text-sm text-muted-foreground mt-1">{decision.description}</p>
                                    )}
                                  </div>
                                  {decision.feedbackType && (
                                    <Badge variant={
                                      decision.feedbackType === 'success' ? 'outline' :
                                      decision.feedbackType === 'warning' ? 'secondary' : 'destructive'
                                    } className={
                                      decision.feedbackType === 'success' ? 'bg-green-50 text-green-700 border-green-200' : ''
                                    }>
                                      {decision.feedbackType === 'success' ? 'Good Choice' : 
                                       decision.feedbackType === 'warning' ? 'Average Choice' : 'Poor Choice'}
                                    </Badge>
                                  )}
                                </div>
                                
                                {decision.feedback && (
                                  <div className="mt-2 text-sm bg-slate-50 p-3 rounded border">
                                    <strong>Outcome:</strong> {decision.feedback}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-muted-foreground">No decision recorded</p>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })
                  }
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          renderStage()
        )}
        
        {showHint && hint && (
          <Alert variant="default" className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle>Hint</AlertTitle>
            <AlertDescription>{hint}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        {onRequestHint && hint && !showHint && !submitted && (
          <Button
            variant="outline"
            onClick={onRequestHint}
            disabled={disabled || showHint}
          >
            Need a hint?
          </Button>
        )}
        {!onRequestHint && <div />}
        {!submitted && (
          <Button
            onClick={handleSubmit}
            disabled={disabled}
          >
            End Simulation
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}