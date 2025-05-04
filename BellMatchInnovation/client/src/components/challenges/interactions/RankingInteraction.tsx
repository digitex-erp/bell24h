import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

export interface RankingOption {
  id: string;
  name: string;
  details?: string;
  image?: string;
}

export interface RankingInteractionProps {
  title: string;
  description: string;
  question: string;
  options: RankingOption[];
  onSubmit: (orderedIds: string[]) => void;
  idealRanking?: string[];
  disabled?: boolean;
  showFeedback?: boolean;
  userRanking?: string[];
  hint?: string;
  showHint?: boolean;
  onRequestHint?: () => void;
  timeLimit?: number;
}

interface SortableItemProps {
  id: string;
  option: RankingOption;
  index: number;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  disabled?: boolean;
  idealPosition?: number;
  showFeedback?: boolean;
}

function SortableItem({ id, option, index, isCorrect, isIncorrect, disabled, idealPosition, showFeedback }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.8 : 1,
  };
  
  const positionDifference = idealPosition !== undefined ? idealPosition - index : undefined;
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        p-4 mb-2 rounded-md border transition-colors select-none
        ${isDragging ? 'border-primary shadow-md bg-background' : ''}
        ${disabled ? 'opacity-80' : 'cursor-grab active:cursor-grabbing'}
        ${isCorrect ? 'border-green-400 bg-green-50' : ''}
        ${isIncorrect ? 'border-red-400 bg-red-50' : ''}
      `}
      {...(disabled ? {} : {...attributes, ...listeners})}
    >
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <div className="flex items-center">
            <Badge variant="outline" className="mr-3">
              {index + 1}
            </Badge>
            <div>
              <h4 className="font-medium">{option.name}</h4>
              {option.details && (
                <p className="text-sm text-muted-foreground">{option.details}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          {showFeedback && positionDifference !== undefined && positionDifference !== 0 && (
            <div className="flex items-center text-sm mr-2">
              {positionDifference > 0 ? (
                <span className="text-red-500 flex items-center">
                  <ArrowDown className="h-3 w-3 mr-1" />
                  {Math.abs(positionDifference)}
                </span>
              ) : (
                <span className="text-red-500 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  {Math.abs(positionDifference)}
                </span>
              )}
            </div>
          )}
          
          {showFeedback && (
            isCorrect ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              isIncorrect && <AlertCircle className="h-5 w-5 text-red-500" />
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default function RankingInteraction({
  title,
  description,
  question,
  options,
  onSubmit,
  idealRanking,
  disabled = false,
  showFeedback = false,
  userRanking: propUserRanking,
  hint,
  showHint = false,
  onRequestHint,
  timeLimit
}: RankingInteractionProps) {
  const initialItems = propUserRanking || options.map(option => option.id);
  const [items, setItems] = useState<string[]>(initialItems);
  const [submitted, setSubmitted] = useState(!!propUserRanking);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(timeLimit || null);
  
  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
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
  
  const handleDragEnd = (event: DragEndEvent) => {
    if (disabled || submitted) return;
    
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      
      // Reorder the items
      const newItems = [...items];
      newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, active.id as string);
      setItems(newItems);
    }
  };
  
  const handleSubmit = () => {
    if (disabled || submitted) return;
    setSubmitted(true);
    onSubmit(items);
  };
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Calculate score based on correct positions
  const calculateScore = () => {
    if (!showFeedback || !idealRanking) return null;
    
    let correctPositions = 0;
    const totalPositions = items.length;
    
    items.forEach((itemId, index) => {
      if (idealRanking[index] === itemId) {
        correctPositions++;
      }
    });
    
    // Calculate distance score (how far items are from their ideal positions)
    let totalDisplacement = 0;
    const maxDisplacement = Math.pow(totalPositions, 2);
    
    items.forEach((itemId, currentIndex) => {
      const idealIndex = idealRanking.indexOf(itemId);
      const displacement = Math.abs(currentIndex - idealIndex);
      totalDisplacement += displacement;
    });
    
    const displacementScore = 1 - (totalDisplacement / maxDisplacement);
    
    return {
      exactMatches: correctPositions,
      totalPositions,
      exactMatchPercentage: (correctPositions / totalPositions) * 100,
      displacementScore: displacementScore * 100,
      totalScore: Math.round((correctPositions / totalPositions) * 50 + displacementScore * 50),
      isPerfect: correctPositions === totalPositions,
      isGood: correctPositions >= Math.floor(totalPositions * 0.7) || displacementScore >= 0.7
    };
  };
  
  const score = calculateScore();
  
  // Get option object by id
  const getOptionById = (id: string) => {
    return options.find(option => option.id === id);
  };
  
  // Check if an item is in the correct position
  const isInCorrectPosition = (id: string, index: number): boolean => {
    return showFeedback && idealRanking ? idealRanking[index] === id : false;
  };
  
  // Check if an item is in the wrong position
  const isInWrongPosition = (id: string, index: number): boolean => {
    return showFeedback && idealRanking ? idealRanking[index] !== id : false;
  };
  
  // Get the ideal position of an item
  const getIdealPosition = (id: string): number | undefined => {
    return idealRanking ? idealRanking.indexOf(id) : undefined;
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
        <div className="text-lg font-medium mb-2">{question}</div>
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div>
              {items.map((id, index) => {
                const option = getOptionById(id);
                if (!option) return null;
                
                return (
                  <SortableItem
                    key={id}
                    id={id}
                    option={option}
                    index={index}
                    isCorrect={isInCorrectPosition(id, index)}
                    isIncorrect={isInWrongPosition(id, index)}
                    disabled={disabled || submitted}
                    idealPosition={showFeedback ? getIdealPosition(id) : undefined}
                    showFeedback={showFeedback}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
        
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
                ? "Perfect Ranking!" 
                : (score.isGood ? "Good Ranking!" : "Needs Improvement")}
            </AlertTitle>
            <AlertDescription>
              {score.isPerfect 
                ? "All items are in their correct positions." 
                : `You have ${score.exactMatches} out of ${score.totalPositions} items in their correct positions.`}
              <div className="mt-1">
                Overall score: {score.totalScore}%
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {showFeedback && idealRanking && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Ideal Ranking:</h3>
            <div className="space-y-2 p-4 bg-slate-50 rounded-md border">
              {idealRanking.map((id, index) => {
                const option = getOptionById(id);
                if (!option) return null;
                
                return (
                  <div key={id} className="flex items-center">
                    <Badge variant="outline" className="mr-3">
                      {index + 1}
                    </Badge>
                    <div>
                      <span className="font-medium">{option.name}</span>
                      {option.details && (
                        <span className="text-sm text-muted-foreground ml-2">- {option.details}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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
              disabled={disabled}
            >
              Submit Ranking
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}