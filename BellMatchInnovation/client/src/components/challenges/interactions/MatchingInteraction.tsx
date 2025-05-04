import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface MatchingItem {
  id: string;
  name: string;
  description?: string;
}

export interface MatchingInteractionProps {
  title: string;
  description: string;
  instructions: string;
  items: MatchingItem[];
  targets: MatchingItem[];
  correctPairs: Record<string, string>;
  onSubmit: (pairs: Record<string, string>) => void;
  disabled?: boolean;
  showFeedback?: boolean;
  userPairs?: Record<string, string>;
  hint?: string;
  showHint?: boolean;
  onRequestHint?: () => void;
  timeLimit?: number;
}

export default function MatchingInteraction({
  title,
  description,
  instructions,
  items,
  targets,
  correctPairs,
  onSubmit,
  disabled = false,
  showFeedback = false,
  userPairs: propUserPairs,
  hint,
  showHint = false,
  onRequestHint,
  timeLimit
}: MatchingInteractionProps) {
  const [userPairs, setUserPairs] = useState<Record<string, string>>(propUserPairs || {});
  const [submitted, setSubmitted] = useState(!!propUserPairs);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(timeLimit || null);
  
  // Timer logic
  React.useEffect(() => {
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
  
  React.useEffect(() => {
    if (timeRemaining === 0 && !submitted) {
      handleSubmit();
    }
  }, [timeRemaining, submitted]);
  
  const handleSelectItem = (itemId: string) => {
    if (disabled || submitted) return;
    setSelectedItem(prev => prev === itemId ? null : itemId);
  };
  
  const handleSelectTarget = (targetId: string) => {
    if (disabled || submitted || !selectedItem) return;
    
    // Create a new pairs object without any current mapping to the selected target
    const newPairs = { ...userPairs };
    
    // Find any existing item that's already mapped to this target and remove it
    Object.keys(newPairs).forEach(itemId => {
      if (newPairs[itemId] === targetId) {
        delete newPairs[itemId];
      }
    });
    
    // Add the new pair
    newPairs[selectedItem] = targetId;
    
    setUserPairs(newPairs);
    setSelectedItem(null);
  };
  
  const handleSubmit = () => {
    if (disabled || submitted) return;
    setSubmitted(true);
    onSubmit(userPairs);
  };
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  const isAllMatched = items.every(item => userPairs[item.id]);
  
  // Calculate score
  const calculateScore = () => {
    if (!showFeedback) return null;
    
    let correctCount = 0;
    const totalPairs = items.length;
    
    items.forEach(item => {
      const userTargetId = userPairs[item.id];
      if (userTargetId && correctPairs[item.id] === userTargetId) {
        correctCount++;
      }
    });
    
    return {
      correctCount,
      totalPairs,
      percentage: Math.round((correctCount / totalPairs) * 100),
      isPerfect: correctCount === totalPairs,
      isGood: correctCount >= Math.floor(totalPairs * 0.7)
    };
  };
  
  const score = calculateScore();
  
  // Check if a pair is correct
  const isPairCorrect = (itemId: string, targetId: string): boolean => {
    return correctPairs[itemId] === targetId;
  };
  
  // Get the matched target for an item
  const getMatchedTarget = (itemId: string) => {
    return targets.find(target => target.id === userPairs[itemId]);
  };
  
  // Get the item that's matched to a target
  const getItemMatchedToTarget = (targetId: string) => {
    const itemId = Object.keys(userPairs).find(itemId => userPairs[itemId] === targetId);
    return itemId ? items.find(item => item.id === itemId) : null;
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
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
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-slate-50 p-4 rounded-md border mb-4">
          <h3 className="text-lg font-medium mb-2">Instructions</h3>
          <p className="text-slate-700">{instructions}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left column - Items */}
          <div className="space-y-4">
            <h3 className="font-medium">Items</h3>
            <div className="space-y-2">
              {items.map(item => {
                const isSelected = item.id === selectedItem;
                const matchedTargetId = userPairs[item.id];
                const isCorrect = showFeedback && matchedTargetId && isPairCorrect(item.id, matchedTargetId);
                const isIncorrect = showFeedback && matchedTargetId && !isPairCorrect(item.id, matchedTargetId);
                
                return (
                  <div
                    key={item.id}
                    className={`
                      p-4 rounded-md border transition-colors cursor-pointer
                      ${disabled ? 'opacity-80' : 'hover:border-primary'}
                      ${isSelected ? 'border-primary bg-primary/5' : 'border-input'}
                      ${isCorrect ? 'border-green-400 bg-green-50' : ''}
                      ${isIncorrect ? 'border-red-400 bg-red-50' : ''}
                    `}
                    onClick={() => handleSelectItem(item.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center">
                        {showFeedback && (
                          isCorrect ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            isIncorrect && <AlertCircle className="h-5 w-5 text-red-500" />
                          )
                        )}
                      </div>
                    </div>
                    
                    {matchedTargetId && !isSelected && (
                      <div className="mt-2 flex items-center gap-1 text-sm">
                        <ArrowRight className="h-4 w-4" />
                        <span className="font-medium">Matched to:</span>
                        <Badge variant="outline" className="font-normal">
                          {targets.find(t => t.id === matchedTargetId)?.name}
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Right column - Targets */}
          <div className="space-y-4">
            <h3 className="font-medium">Targets</h3>
            <div className="space-y-2">
              {targets.map(target => {
                const matchedItem = getItemMatchedToTarget(target.id);
                const isCorrect = showFeedback && matchedItem && isPairCorrect(matchedItem.id, target.id);
                const isIncorrect = showFeedback && matchedItem && !isPairCorrect(matchedItem.id, target.id);
                
                return (
                  <div
                    key={target.id}
                    className={`
                      p-4 rounded-md border transition-colors
                      ${disabled || !selectedItem ? 'opacity-80' : 'cursor-pointer hover:border-primary'}
                      ${isCorrect ? 'border-green-400 bg-green-50' : ''}
                      ${isIncorrect ? 'border-red-400 bg-red-50' : ''}
                    `}
                    onClick={() => handleSelectTarget(target.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{target.name}</h4>
                        {target.description && (
                          <p className="text-sm text-muted-foreground mt-1">{target.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center">
                        {showFeedback && (
                          isCorrect ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            isIncorrect && <AlertCircle className="h-5 w-5 text-red-500" />
                          )
                        )}
                      </div>
                    </div>
                    
                    {matchedItem && (
                      <div className="mt-2 flex items-center gap-1 text-sm">
                        <span className="font-medium">Matched with:</span>
                        <Badge variant="outline" className="font-normal">
                          {matchedItem.name}
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {selectedItem && (
          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <AlertTitle>Select a target</AlertTitle>
            <AlertDescription>
              Choose a target to match with {items.find(item => item.id === selectedItem)?.name}
            </AlertDescription>
          </Alert>
        )}
        
        {showFeedback && score && (
          <Alert 
            variant={score.isPerfect ? "default" : (score.isGood ? "default" : "destructive")} 
            className={score.isPerfect || score.isGood ? "bg-green-50 border-green-200" : ""}
          >
            {score.isPerfect ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {score.isPerfect 
                ? "Perfect Match!" 
                : (score.isGood ? "Good Job!" : "Needs Improvement")}
            </AlertTitle>
            <AlertDescription>
              {score.isPerfect 
                ? "You matched all items correctly." 
                : `You matched ${score.correctCount} out of ${score.totalPairs} items correctly.`}
              <div className="mt-1">
                Score: {score.percentage}%
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {showFeedback && (
          <div className="space-y-2 p-4 bg-slate-50 rounded-md border">
            <h3 className="text-sm font-medium mb-2">Correct Matches:</h3>
            {items.map(item => {
              const correctTargetId = correctPairs[item.id];
              const correctTarget = targets.find(target => target.id === correctTargetId);
              
              return (
                <div key={item.id} className="flex items-start gap-2">
                  <div className="font-medium">{item.name}</div>
                  <ArrowRight className="h-4 w-4 mt-1" />
                  <div>{correctTarget?.name}</div>
                </div>
              );
            })}
          </div>
        )}
        
        {showHint && hint && (
          <Alert variant="default" className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle>Hint</AlertTitle>
            <AlertDescription>{hint}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-between items-center pt-4">
          {onRequestHint && hint && !showHint && (
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
              disabled={!isAllMatched || disabled}
            >
              Submit Matches
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}