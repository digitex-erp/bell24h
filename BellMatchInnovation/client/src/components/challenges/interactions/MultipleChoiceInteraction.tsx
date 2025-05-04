import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export interface MultipleChoiceOption {
  id: string;
  text: string;
}

export interface MultipleChoiceInteractionProps {
  title: string;
  description: string;
  question: string;
  options: MultipleChoiceOption[];
  onSubmit: (optionId: string) => void;
  correctOptionId?: string;
  disabled?: boolean;
  showFeedback?: boolean;
  explanation?: string;
  selectedOption?: string;
  hint?: string;
  showHint?: boolean;
  onRequestHint?: () => void;
  timeLimit?: number;
}

export default function MultipleChoiceInteraction({
  title,
  description,
  question,
  options,
  onSubmit,
  correctOptionId,
  disabled = false,
  showFeedback = false,
  explanation,
  selectedOption: propSelectedOption,
  hint,
  showHint = false,
  onRequestHint,
  timeLimit
}: MultipleChoiceInteractionProps) {
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
        <div className="text-lg font-medium">{question}</div>
        
        <RadioGroup 
          value={selectedOption || undefined} 
          onValueChange={handleOptionSelect}
          className="space-y-3"
        >
          {options.map((option) => {
            const isCorrect = correctOptionId === option.id;
            const isSelected = selectedOption === option.id;
            const showCorrect = showFeedback && isCorrect;
            const showIncorrect = showFeedback && isSelected && !isCorrect;
            
            return (
              <div
                key={option.id}
                className={`
                  flex items-start space-x-2 p-4 rounded-md border transition-colors
                  ${disabled ? 'opacity-80' : 'hover:border-primary'}
                  ${isSelected && !showFeedback ? 'border-primary bg-primary/5' : 'border-input'}
                  ${showCorrect ? 'border-green-400 bg-green-50' : ''}
                  ${showIncorrect ? 'border-red-400 bg-red-50' : ''}
                `}
              >
                <RadioGroupItem 
                  value={option.id} 
                  id={option.id}
                  disabled={disabled || submitted}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label 
                    htmlFor={option.id} 
                    className={`font-medium ${disabled || submitted ? '' : 'cursor-pointer'}`}
                  >
                    {option.text}
                  </Label>
                </div>
                {showFeedback && (
                  isCorrect ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    isSelected && <AlertCircle className="h-5 w-5 text-red-500" />
                  )
                )}
              </div>
            );
          })}
        </RadioGroup>
        
        {showFeedback && explanation && (
          <Alert 
            variant={selectedOption === correctOptionId ? "default" : "destructive"} 
            className={selectedOption === correctOptionId ? "bg-green-50 border-green-200" : ""}
          >
            {selectedOption === correctOptionId ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>{selectedOption === correctOptionId ? "Correct!" : "Incorrect"}</AlertTitle>
            <AlertDescription>{explanation}</AlertDescription>
          </Alert>
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
              disabled={!selectedOption || disabled}
            >
              Submit Answer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}