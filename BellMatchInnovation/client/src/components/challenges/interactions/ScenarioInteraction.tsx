import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

export interface ScenarioInteractionProps {
  title: string;
  description: string;
  scenario: string;
  question: string;
  minResponseLength?: number;
  keyPoints?: string[];
  onSubmit: (response: string) => void;
  disabled?: boolean;
  showFeedback?: boolean;
  feedback?: string;
  userResponse?: string;
  hint?: string;
  showHint?: boolean;
  onRequestHint?: () => void;
  timeLimit?: number;
}

export default function ScenarioInteraction({
  title,
  description,
  scenario,
  question,
  minResponseLength = 50,
  keyPoints = [],
  onSubmit,
  disabled = false,
  showFeedback = false,
  feedback,
  userResponse: propUserResponse,
  hint,
  showHint = false,
  onRequestHint,
  timeLimit
}: ScenarioInteractionProps) {
  const [userResponse, setUserResponse] = useState<string>(propUserResponse || '');
  const [submitted, setSubmitted] = useState(!!propUserResponse);
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
    if (timeRemaining === 0 && !submitted && userResponse.length >= minResponseLength) {
      handleSubmit();
    }
  }, [timeRemaining, submitted, userResponse, minResponseLength]);
  
  const handleResponseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (disabled || submitted) return;
    setUserResponse(e.target.value);
  };
  
  const handleSubmit = () => {
    if (userResponse.length < minResponseLength || disabled || submitted) return;
    setSubmitted(true);
    onSubmit(userResponse);
  };
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Calculate how many key points were addressed
  const calculateKeyPointsCoverage = () => {
    if (!showFeedback || keyPoints.length === 0) return null;
    
    const response = userResponse.toLowerCase();
    const coveredPoints = keyPoints.filter(point => 
      response.includes(point.toLowerCase())
    );
    
    const completionPercentage = (coveredPoints.length / keyPoints.length) * 100;
    
    return {
      coveredPoints,
      totalPoints: keyPoints.length,
      completionPercentage,
      isComplete: coveredPoints.length === keyPoints.length,
      isGood: coveredPoints.length >= Math.ceil(keyPoints.length * 0.7)
    };
  };
  
  const keyPointsCoverage = calculateKeyPointsCoverage();
  
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
          <p className="text-slate-700 whitespace-pre-line">{scenario}</p>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">{question}</h3>
          <Textarea
            placeholder="Type your response here..."
            value={userResponse}
            onChange={handleResponseChange}
            disabled={disabled || submitted}
            className="min-h-[200px]"
          />
          <div className="flex justify-between text-sm mt-2 text-muted-foreground">
            <span>Minimum {minResponseLength} characters</span>
            <span>{userResponse.length} characters</span>
          </div>
        </div>
        
        {showFeedback && keyPointsCoverage && keyPoints.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Key Points Coverage:</h3>
            <div className="space-y-2">
              {keyPoints.map((point, index) => {
                const isCovered = userResponse.toLowerCase().includes(point.toLowerCase());
                return (
                  <div 
                    key={index} 
                    className={`
                      flex items-start gap-2 p-2 rounded
                      ${isCovered ? 'bg-green-50' : 'bg-slate-50'}
                    `}
                  >
                    {isCovered ? (
                      <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                    )}
                    <span>{point}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {showFeedback && feedback && (
          <Alert 
            variant="default"
            className="bg-blue-50 border-blue-200"
          >
            <AlertTitle>Feedback</AlertTitle>
            <AlertDescription className="whitespace-pre-line">{feedback}</AlertDescription>
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
              disabled={userResponse.length < minResponseLength || disabled}
            >
              Submit Response
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}