import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface DecisionOption {
  id: string;
  text: string;
  description?: string;
  outcomes?: string;
  outcomesDetail?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  isRecommended?: boolean;
}

export interface DecisionInteractionProps {
  title: string;
  description: string;
  scenario: string;
  options: DecisionOption[];
  onSubmit: (optionId: string) => void;
  disabled?: boolean;
  showFeedback?: boolean;
  selectedOption?: string;
  recommendedOption?: string;
  hint?: string;
  showHint?: boolean;
  onRequestHint?: () => void;
  timeLimit?: number;
}

export default function DecisionInteraction({
  title,
  description,
  scenario,
  options,
  onSubmit,
  disabled = false,
  showFeedback = false,
  selectedOption: propSelectedOption,
  recommendedOption,
  hint,
  showHint = false,
  onRequestHint,
  timeLimit
}: DecisionInteractionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(propSelectedOption || null);
  const [submitted, setSubmitted] = useState(!!propSelectedOption);
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
    if (timeRemaining === 0 && !submitted && selectedOption) {
      handleSubmit();
    }
  }, [timeRemaining, submitted, selectedOption]);
  
  const handleOptionSelect = (optionId: string) => {
    if (disabled || submitted) return;
    setSelectedOption(optionId);
  };
  
  const handleSubmit = () => {
    if (!selectedOption || disabled || submitted) return;
    setSubmitted(true);
    onSubmit(selectedOption);
  };
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  const getRiskBadge = (risk: 'low' | 'medium' | 'high') => {
    switch(risk) {
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Low Risk</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Medium Risk</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">High Risk</Badge>;
      default:
        return null;
    }
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
          <h3 className="text-lg font-medium mb-2">Scenario</h3>
          <p className="text-slate-700">{scenario}</p>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium">Make Your Decision:</h3>
          <div className="space-y-3">
            {options.map(option => {
              const isSelected = selectedOption === option.id;
              const isRecommended = option.id === recommendedOption;
              
              return (
                <div
                  key={option.id}
                  className={`
                    p-4 rounded-md border transition-colors cursor-pointer
                    ${disabled ? 'opacity-80' : 'hover:border-primary'}
                    ${isSelected && !showFeedback ? 'border-primary bg-primary/5' : 'border-input'}
                    ${showFeedback && isSelected && isRecommended ? 'border-green-400 bg-green-50' : ''}
                    ${showFeedback && isSelected && !isRecommended ? 'border-amber-400 bg-amber-50' : ''}
                  `}
                  onClick={() => handleOptionSelect(option.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium flex items-center">
                        {option.text}
                        {showFeedback && isRecommended && (
                          <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                            Recommended
                          </Badge>
                        )}
                      </h4>
                      {option.description && (
                        <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      {option.riskLevel && getRiskBadge(option.riskLevel)}
                      
                      {showFeedback && isSelected && (
                        isRecommended ? (
                          <ThumbsUp className="h-5 w-5 text-green-500" />
                        ) : (
                          <ThumbsDown className="h-5 w-5 text-amber-500" />
                        )
                      )}
                    </div>
                  </div>
                  
                  {showFeedback && isSelected && option.outcomes && (
                    <div className="mt-3 text-sm bg-slate-50 p-3 rounded border">
                      <strong>Outcome:</strong> {option.outcomes}
                      {option.outcomesDetail && (
                        <p className="mt-2 text-muted-foreground">{option.outcomesDetail}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
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
              disabled={!selectedOption || disabled}
            >
              Submit Decision
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}